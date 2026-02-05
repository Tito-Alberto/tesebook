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

type NotificationType = 'work' | 'topic';

interface NotificationRow {
  id: string;
  receiver_id: string;
  sender_id?: string | null;
  type: NotificationType;
  work_id?: string | null;
  topic_id?: string | null;
  created_at?: string | null;
  read_at?: string | null;
}

interface ProfileSummary {
  id: string;
  name?: string | null;
  photo_url?: string | null;
  course?: string | null;
  institution?: string | null;
}

interface WorkSummary {
  id: string;
  title?: string | null;
  topic?: string | null;
  course?: string | null;
  institution?: string | null;
  academic_degree?: string | null;
  cover_url?: string | null;
  allow_download?: boolean | null;
}

interface TopicSummary {
  id: string;
  title?: string | null;
  course?: string | null;
  description?: string | null;
  user_id?: string | null;
}

interface NotificationItem extends NotificationRow {
  sender?: ProfileSummary | null;
  work?: WorkSummary | null;
  topic?: TopicSummary | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    let channel: any = null;
    let unsubscribeFocus: any = null;

    const setupChannel = async (userId: string) => {
      if (channel) return;
      channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `receiver_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `receiver_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          },
        )
        .subscribe();
    };

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserId = user?.id || null;
        if (!currentUserId) {
          if (!isActive) return;
          setNotifications([]);
          setError('Faca login para ver notificacoes.');
          setLoading(false);
          return;
        }

        await setupChannel(currentUserId);

        const { data, error: notificationError } = await supabase
          .from('notifications')
          .select('*')
          .eq('receiver_id', currentUserId)
          .order('created_at', { ascending: false });
        if (notificationError) throw notificationError;

        const rows = (data || []) as NotificationRow[];
        const senderIds = Array.from(
          new Set(rows.map((item) => item.sender_id).filter(Boolean) as string[]),
        );
        const workIds = Array.from(
          new Set(rows.map((item) => item.work_id).filter(Boolean) as string[]),
        );
        const topicIds = Array.from(
          new Set(rows.map((item) => item.topic_id).filter(Boolean) as string[]),
        );

        const profilesById = new Map<string, ProfileSummary>();
        if (senderIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id,name,photo_url,course,institution')
            .in('id', senderIds);
          if (profilesError) throw profilesError;

          const resolvedProfiles = await Promise.all(
            (profilesData || []).map(async (profile: any) => {
              const resolvedPhoto = profile.photo_url
                ? await resolveStorageUrl(profile.photo_url)
                : null;
              return {
                ...profile,
                photo_url: resolvedPhoto || profile.photo_url,
              };
            }),
          );

          resolvedProfiles.forEach((profile: any) => {
            if (profile?.id) profilesById.set(profile.id, profile);
          });
        }

        const worksById = new Map<string, WorkSummary>();
        if (workIds.length > 0) {
          const { data: worksData, error: worksError } = await supabase
            .from('works')
            .select('id,title,topic,course,institution,academic_degree,cover_url,allow_download')
            .in('id', workIds);
          if (worksError) throw worksError;
          const resolvedWorks = await Promise.all(
            (worksData || []).map(async (work: any) => {
              const resolvedCover = work.cover_url
                ? await resolveStorageUrl(work.cover_url)
                : null;
              return {
                ...work,
                cover_url: resolvedCover || work.cover_url,
              };
            }),
          );
          resolvedWorks.forEach((work: any) => {
            if (work?.id) worksById.set(work.id, work);
          });
        }

        const topicsById = new Map<string, TopicSummary>();
        if (topicIds.length > 0) {
          const { data: topicsData, error: topicsError } = await supabase
            .from('suggested_topics')
            .select('id,title,course,description,user_id')
            .in('id', topicIds);
          if (topicsError) throw topicsError;
          (topicsData || []).forEach((topic: any) => {
            if (topic?.id) topicsById.set(topic.id, topic);
          });
        }

        const enriched = rows.map((item) => ({
          ...item,
          sender: item.sender_id ? profilesById.get(item.sender_id) || null : null,
          work: item.work_id ? worksById.get(item.work_id) || null : null,
          topic: item.topic_id ? topicsById.get(item.topic_id) || null : null,
        }));

        if (!isActive) return;
        setNotifications(enriched);
        setError('');
      } catch (err: any) {
        if (!isActive) return;
        setError(err?.message || 'Erro ao carregar notificacoes.');
        setNotifications([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchNotifications();
    unsubscribeFocus = navigation.addListener('focus', () => {
      fetchNotifications();
    });

    return () => {
      isActive = false;
      if (channel) supabase.removeChannel(channel);
      if (unsubscribeFocus) unsubscribeFocus();
    };
  }, [navigation]);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch {
      // silencioso
    }
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.read_at) {
      await markAsRead(item.id);
    }

    if (item.type === 'work' && item.work?.id) {
      navigation.navigate('ReadWork', {
        workId: item.work.id,
        allowDownload: item.work.allow_download,
      });
      return;
    }

    if (item.type === 'topic' && item.topic?.id) {
      navigation.navigate('MainTabs', {
        screen: 'Home',
        params: { openTopicId: item.topic.id },
      });
      return;
    }

    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const senderName = item.sender?.name || 'Usuario';
    const title =
      item.type === 'work' ? 'Novo trabalho' : 'Novo tema sugerido';
    const subtitle =
      item.type === 'work'
        ? item.work?.title || item.work?.topic || 'Trabalho novo'
        : item.topic?.title || 'Tema sugerido';
    const course =
      item.type === 'work'
        ? item.work?.course || item.sender?.course || 'Curso'
        : item.topic?.course || item.sender?.course || 'Curso';
    const createdAt = formatDate(item.created_at);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, item.read_at ? styles.readItem : null]}
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.avatar}>
          {item.sender?.photo_url ? (
            <Image source={{ uri: item.sender.photo_url }} style={styles.avatarImage} />
          ) : (
            <Ionicons name={item.type === 'work' ? 'document-text-outline' : 'bulb-outline'} size={24} color="#6b86f0" />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {title} - {senderName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {course}
          </Text>
          {createdAt ? <Text style={styles.time}>{createdAt}</Text> : null}
        </View>
        {!item.read_at ? <View style={styles.unreadDot} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
        >
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificacoes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <Text style={styles.emptyText}>Carregando...</Text>
            ) : (
              <Text style={styles.emptyText}>Sem notificacoes.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listContent: {
    paddingTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  readItem: {
    backgroundColor: '#fafafa',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef1ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6b86f0',
    marginLeft: 8,
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

export default NotificationsScreen;
