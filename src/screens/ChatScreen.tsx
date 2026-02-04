import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

interface DbMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
}

interface RouteParams {
  userId?: string;
  userName?: string;
  userCourse?: string;
  userInstitution?: string;
  userPhotoUrl?: string | null;
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};

  // Dados do usuario alvo (fallback do header)
  const fallbackName = params.userName || 'Nome do Estudante';
  const fallbackCourse = params.userCourse || 'Curso';
  const fallbackInstitution = params.userInstitution || 'Instituicao';
  const fallbackPhotoUrl = params.userPhotoUrl || null;
  const targetUserId = params.userId ?? null;

  const [displayName, setDisplayName] = useState(fallbackName);
  const [displayCourse, setDisplayCourse] = useState(fallbackCourse);
  const [displayInstitution, setDisplayInstitution] = useState(fallbackInstitution);
  const [displayPhotoUrl, setDisplayPhotoUrl] = useState<string | null>(fallbackPhotoUrl);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [sending, setSending] = useState(false);

  // Salva leitura no Supabase para sincronizar
  const updateLastRead = async (timestamp?: string | null) => {
    if (!currentUserId || !targetUserId || !timestamp) return;
    try {
      await supabase
        .from('chat_reads')
        .upsert(
          {
            user_id: currentUserId,
            other_user_id: targetUserId,
            last_read_at: timestamp,
          },
          { onConflict: 'user_id,other_user_id' },
        );
    } catch {
      // ignore update failures
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMessageBetween = (msg: DbMessage, userA: string, userB: string) =>
    (msg.sender_id === userA && msg.receiver_id === userB) ||
    (msg.sender_id === userB && msg.receiver_id === userA);

  // Envio de mensagem
  const handleSend = async () => {
    if (!message.trim() || !currentUserId || !targetUserId || sending) return;
    const body = message.trim();
    setSending(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: targetUserId,
          body,
        })
        .select('id,sender_id,receiver_id,body,created_at')
        .single();

      if (error) throw error;
      if (data) {
        setMessages((prev) => (prev.some((msg) => msg.id === data.id) ? prev : [...prev, data]));
        setMessagesError('');
        await updateLastRead(data.created_at);
      }
    } catch (err: any) {
      setMessagesError(err?.message || 'Nao foi possivel enviar a mensagem.');
      setMessage(body);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // Busca usuario logado
    let isActive = true;
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!isActive) return;
      setCurrentUserId(user?.id ?? null);
    };
    fetchCurrentUser();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    // Carrega historico da conversa
    let isActive = true;
    const fetchMessages = async () => {
      if (!targetUserId) {
        setMessages([]);
        setMessagesError('Nenhum usuario selecionado.');
        setMessagesLoading(false);
        return;
      }
      if (!currentUserId) {
        setMessages([]);
        setMessagesError('Entre para conversar.');
        setMessagesLoading(false);
        return;
      }

      setMessagesLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id,sender_id,receiver_id,body,created_at')
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`,
          )
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (!isActive) return;
        setMessages(data || []);
        setMessagesError('');
        if (data && data.length > 0) {
          await updateLastRead(data[data.length - 1].created_at);
        }
      } catch (err: any) {
        if (!isActive) return;
        setMessagesError(err?.message || 'Erro ao carregar mensagens.');
        setMessages([]);
      } finally {
        if (isActive) setMessagesLoading(false);
      }
    };

    fetchMessages();
    return () => {
      isActive = false;
    };
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    // Escuta novas mensagens em realtime
    if (!currentUserId) return;
    const channel = supabase
      .channel(`messages-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as DbMessage;
          if (!targetUserId) return;
          if (!isMessageBetween(newMessage, currentUserId, targetUserId)) return;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev;
            const next = [...prev, newMessage];
            next.sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
            void updateLastRead(newMessage.created_at);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    // Busca dados do perfil alvo quando faltam infos
    let isActive = true;
    const shouldFetch =
      !!targetUserId &&
      (
        !params.userName ||
        params.userName === 'Nome do Estudante' ||
        !params.userCourse ||
        params.userCourse === 'Curso' ||
        !params.userInstitution ||
        params.userInstitution === 'Instituicao' ||
        !params.userPhotoUrl
      );

    if (!shouldFetch || !targetUserId) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id,name,course,institution,photo_url')
          .eq('id', targetUserId)
          .single();
        if (error || !data || !isActive) return;

        const resolvedPhoto = data.photo_url ? await resolveStorageUrl(data.photo_url) : null;
        if (!isActive) return;
        setDisplayName(data.name || fallbackName);
        setDisplayCourse(data.course || fallbackCourse);
        setDisplayInstitution(data.institution || fallbackInstitution);
        setDisplayPhotoUrl(resolvedPhoto || data.photo_url || null);
      } catch {
        // keep fallback values
      }
    };

    fetchProfile();
    return () => {
      isActive = false;
    };
  }, [
    targetUserId,
    params.userName,
    params.userCourse,
    params.userInstitution,
    params.userPhotoUrl,
    fallbackName,
    fallbackCourse,
    fallbackInstitution,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
        >
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
              {displayPhotoUrl ? (
                <Image source={{ uri: displayPhotoUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={18} color="#6b86f0" />
              )}
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.studentCourse} numberOfLines={1}>
                {displayCourse}
              </Text>
              <Text style={styles.studentInstitution} numberOfLines={4}>
                {displayInstitution}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Mensagens */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messagesError ? <Text style={styles.errorText}>{messagesError}</Text> : null}
        {messagesLoading ? <Text style={styles.infoText}>Carregando...</Text> : null}
        {!messagesLoading && !messagesError && messages.length === 0 ? (
          <Text style={styles.infoText}>Nenhuma mensagem ainda.</Text>
        ) : null}
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender_id === currentUserId ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender_id === currentUserId ? styles.sentMessageText : styles.receivedMessageText,
              ]}
            >
              {msg.body}
            </Text>
            <Text style={styles.messageTime}>{formatMessageTime(msg.created_at)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Campo de envio */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Pergunte sobre trabalhos, metodologia, referencias..."
          placeholderTextColor="#999"
          multiline
          editable={!!currentUserId && !!targetUserId}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (sending || !message.trim() || !currentUserId || !targetUserId) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={sending || !message.trim() || !currentUserId || !targetUserId}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    zIndex: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 8,
    paddingLeft: 4,
    minWidth: 0,
  },
  headerRight: {
    width: 0,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginTop: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  studentDetails: {
    alignItems: 'flex-start',
    flexShrink: 1,
    minWidth: 0,
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  studentCourse: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  studentInstitution: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    lineHeight: 14,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6b86f0',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#ffffff',
  },
  receivedMessageText: {
    color: '#222',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
  },
  infoText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6b86f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#b9c4f5',
  },
});

export default ChatScreen;
