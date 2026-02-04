import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

interface ChatUser {
  id: string;
  name: string;
  course: string;
  institution: string;
  unreadCount: number;
  lastMessageAt?: string | null;
  photoUrl?: string | null;
}

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Estado da lista de conversas
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    let channel: any = null;
    let unsubscribeFocus: any = null;
    // Carrega usuarios com conversa e contadores
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserId = user?.id || null;
        if (!currentUserId) {
          if (!isActive) return;
          setChatUsers([]);
          setError('Faca login para ver conversas.');
          return;
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id,receiver_id,created_at')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
        if (messagesError) throw messagesError;

        if (!channel) {
          // Realtime para mensagens e leituras
          channel = supabase
            .channel(`messages-list-${currentUserId}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'messages' },
              (payload) => {
                const newMessage = payload.new as any;
                if (
                  newMessage?.sender_id === currentUserId ||
                  newMessage?.receiver_id === currentUserId
                ) {
                  fetchUsers();
                }
              },
            )
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_reads',
                filter: `user_id=eq.${currentUserId}`,
              },
              () => {
                fetchUsers();
              },
            )
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_reads',
                filter: `user_id=eq.${currentUserId}`,
              },
              () => {
                fetchUsers();
              },
            )
            .subscribe();
        }

        const otherUserIdSet = new Set<string>();
        const lastMessageMap = new Map<string, string>();
        (messagesData || []).forEach((msg: any) => {
          const otherId =
            msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
          if (!otherId) return;
          otherUserIdSet.add(otherId);
          if (msg.created_at) {
            const previous = lastMessageMap.get(otherId);
            if (
              !previous ||
              new Date(msg.created_at).getTime() > new Date(previous).getTime()
            ) {
              lastMessageMap.set(otherId, msg.created_at);
            }
          }
        });

        const otherUserIds = Array.from(otherUserIdSet);

        if (otherUserIds.length === 0) {
          if (!isActive) return;
          setChatUsers([]);
          setError('');
          return;
        }

        const { data: readsData, error: readsError } = await supabase
          .from('chat_reads')
          .select('other_user_id,last_read_at')
          .eq('user_id', currentUserId)
          .in('other_user_id', otherUserIds);
        if (readsError) throw readsError;

        const lastReadMap = new Map<string, number>();
        (readsData || []).forEach((read: any) => {
          const ms = read.last_read_at ? new Date(read.last_read_at).getTime() : 0;
          lastReadMap.set(read.other_user_id, Number.isNaN(ms) ? 0 : ms);
        });

        const unreadCounts = new Map<string, number>();
        (messagesData || []).forEach((msg: any) => {
          if (msg.receiver_id !== currentUserId) return;
          const otherId = msg.sender_id;
          if (!otherId) return;
          const msgTime = new Date(msg.created_at).getTime();
          if (Number.isNaN(msgTime)) return;
          const lastReadMs = lastReadMap.get(otherId) ?? 0;
          if (msgTime > lastReadMs) {
            unreadCounts.set(otherId, (unreadCounts.get(otherId) || 0) + 1);
          }
        });

        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id,name,course,institution,photo_url')
          .in('id', otherUserIds);
        if (profilesError) throw profilesError;

        const resolvedProfiles = await Promise.all(
          (data || []).map(async (profile: any) => {
            const resolvedPhoto = profile.photo_url
              ? await resolveStorageUrl(profile.photo_url)
              : null;
            return {
              ...profile,
              photo_url: resolvedPhoto || profile.photo_url,
            };
          }),
        );

        const users = resolvedProfiles
          .filter((profile: any) => profile.id && profile.id !== currentUserId)
          .map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Usuario',
            course: profile.course || 'Curso',
            institution: profile.institution || 'Instituicao',
            unreadCount: unreadCounts.get(profile.id) || 0,
            lastMessageAt: lastMessageMap.get(profile.id) || null,
            photoUrl: profile.photo_url || null,
          }));

        if (!isActive) return;
        users.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
        setChatUsers(users);
        setError('');
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || 'Erro ao carregar usuarios.');
        setChatUsers([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchUsers();
    unsubscribeFocus = navigation.addListener('focus', () => {
      fetchUsers();
    });
    return () => {
      isActive = false;
      if (channel) supabase.removeChannel(channel);
      if (unsubscribeFocus) unsubscribeFocus();
    };
  }, [navigation]);

  const handleUserPress = (user: ChatUser) => {
    // Abre chat com usuario selecionado
    navigation.navigate('Chat', {
      userId: user.id,
      userName: user.name,
      userCourse: user.course,
      userInstitution: user.institution,
      userPhotoUrl: user.photoUrl || null,
    });
  };

  // Renderiza item da lista
  const renderUserItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={32} color="#6b86f0" />
          )}
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.course}>{item.course}</Text>
        <Text style={styles.institution}>{item.institution}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* // Cabecalho */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* // Lista de conversas */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <FlatList
          data={chatUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <Text style={styles.emptyText}>Carregando...</Text>
            ) : (
              <Text style={styles.emptyText}>Nenhum usuario.</Text>
            )
          }
        />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listContent: {
    paddingTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  course: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  institution: {
    fontSize: 14,
    color: '#666',
  },
  userBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6b86f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default ChatListScreen;
