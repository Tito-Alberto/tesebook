import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';

interface FavoriteWork {
  id: string;
  studentName: string;
  workTopic: string;
  course: string;
  institution: string;
  academicDegree: string;
  views: number;
  likes: number;
}

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNavigateToSearch = () => {
    // Usar replace para garantir que a navegação funcione corretamente
    navigation.replace('Search');
  };

  const handleOpenWork = () => {
    navigation.navigate('ReadWork');
  };

  const handleMessage = () => {
    navigation.navigate('Chat');
  };

  // Dados de exemplo
  const favoriteWorks: FavoriteWork[] = [
    {
      id: '1',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
      academicDegree: 'Grau Académico',
      views: 10,
      likes: 10,
    },
    {
      id: '2',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
      academicDegree: 'Grau Académico',
      views: 10,
      likes: 10,
    },
    {
      id: '3',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
      academicDegree: 'Grau Académico',
      views: 10,
      likes: 10,
    },
  ];

  const renderFavoriteWork = ({ item }: { item: FavoriteWork }) => (
    <TouchableOpacity style={styles.workCard} activeOpacity={0.85} onPress={handleOpenWork}>
      <View style={styles.workCover}>
        <Text style={styles.workCoverText}>Capa do trabalho</Text>
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.workDetailText}>{item.workTopic}</Text>
        <Text style={styles.workDetailText}>{item.course}</Text>
        <Text style={styles.workDetailText}>{item.institution}</Text>
        <Text style={styles.academicDegree}>{item.academicDegree}</Text>
        <View style={styles.workStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionsColumn}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage} activeOpacity={0.8}>
          <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
          <Text style={styles.messageButtonText}>Mensagem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={favoriteWorks}
          renderItem={renderFavoriteWork}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="favorites" />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 120,
    height: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  workCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workCover: {
    width: 80,
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workCoverText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  workDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workDetailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  academicDegree: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionsColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b86f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  removeButton: {
    backgroundColor: '#6b86f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FavoritesScreen;

