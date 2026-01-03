import React from 'react';
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

interface ChatUser {
  id: string;
  name: string;
  course: string;
  institution: string;
  unreadCount: number;
}

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Dados de exemplo
  const chatUsers: ChatUser[] = [
    {
      id: '1',
      name: 'Nome do Estudante',
      course: 'Curso',
      institution: 'Nome da Instituição',
      unreadCount: 9,
    },
    {
      id: '2',
      name: 'Nome do Estudante',
      course: 'Curso',
      institution: 'Nome da Instituição',
      unreadCount: 9,
    },
    {
      id: '3',
      name: 'Nome do Estudante',
      course: 'Curso',
      institution: 'Nome da Instituição',
      unreadCount: 9,
    },
  ];

  const handleUserPress = (user: ChatUser) => {
    navigation.navigate('Chat', {
      userId: user.id,
      userName: user.name,
      userCourse: user.course,
      userInstitution: user.institution,
    });
  };

  const renderUserItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#6b86f0" />
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={chatUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ReadWork')}
        >
          <Ionicons name="document-text-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.messageBadge}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>9</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#6b86f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0,
    zIndex: 1000,
    elevation: 10,
  },
  navItem: {
    padding: 8,
  },
  messageBadge: {
    position: 'relative',
  },
});

export default ChatListScreen;

