import React, { useState } from 'react';
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

interface Message {
  id: string;
  text: string;
  isSent: boolean;
  time: string;
}

interface RouteParams {
  userId?: string;
  userName?: string;
  userCourse?: string;
  userInstitution?: string;
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams || {};
  
  const userName = params.userName || 'Nome do Estudante';
  const userCourse = params.userCourse || 'Curso';
  const userInstitution = params.userInstitution || 'Instituição';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Vi seu trabalho sobre Engenharia Informática. Posso ajudar com alguma dúvida?',
      isSent: false,
      time: '10:30',
    },
    {
      id: '2',
      text: 'Olá! Obrigado! Estou com dificuldades na metodologia. Você poderia me dar algumas dicas?',
      isSent: true,
      time: '10:32',
    },
    {
      id: '3',
      text: 'Claro! Para metodologia, recomendo começar definindo o tipo de pesquisa (quantitativa, qualitativa ou mista) e depois escolher as técnicas de coleta de dados.',
      isSent: false,
      time: '10:35',
    },
    {
      id: '4',
      text: 'Perfeito! Isso ajuda muito. Você tem algum exemplo de trabalho similar que eu possa consultar?',
      isSent: true,
      time: '10:37',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isSent: true,
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

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
              <Ionicons name="person" size={20} color="#6b86f0" />
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{userName}</Text>
              <Text style={styles.studentCourse}>{userCourse} - {userInstitution}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Messages Area */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isSent ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.isSent ? styles.sentMessageText : styles.receivedMessageText,
              ]}
            >
              {msg.text}
            </Text>
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Pergunte sobre trabalhos, metodologia, referências..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
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
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: {
    alignItems: 'flex-start',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  studentCourse: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
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
});

export default ChatScreen;

