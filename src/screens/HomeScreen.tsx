import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');

interface SuggestedTopic {
  id: string;
  studentName: string;
  workTopic: string;
  course: string;
  description: string;
}

interface Work {
  id: string;
  studentName: string;
  workTopic: string;
  course: string;
  institution: string;
  academicDegree: string;
  views: number;
  likes: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedTopic, setSelectedTopic] = React.useState<SuggestedTopic | null>(null);
  const [topicModalVisible, setTopicModalVisible] = React.useState(false);

  // Dados de exemplo
  const suggestedTopics: SuggestedTopic[] = [
    {
      id: '1',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      description: 'DescriÇõÇœo resumida do trabalho sugerido.',
    },
    {
      id: '2',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      description: 'DescriÇõÇœo resumida do trabalho sugerido.',
    },
  ];

  const recentWorks: Work[] = [
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
  ];

  const bestWorks: Work[] = [
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
  ];

  const mostViewedWorks: Work[] = [
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
  ];

  const renderSuggestedTopic = ({ item }: { item: SuggestedTopic }) => (
    <TouchableOpacity
      style={styles.suggestedTopicCard}
      activeOpacity={0.8}
      onPress={() => {
        setSelectedTopic(item);
        setTopicModalVisible(true);
      }}
    >
      <Ionicons name="person-outline" size={40} color="#6b86f0" />
      <Text style={styles.suggestedTopicText}>{item.studentName}</Text>
      <Text style={styles.suggestedTopicText}>{item.workTopic}</Text>
      <Text style={styles.suggestedTopicText}>{item.course}</Text>
    </TouchableOpacity>
  );

  const handleOpenWork = () => {
    navigation.navigate('ReadWork');
  };

  const renderWorkCard = ({ item }: { item: Work }) => (
    <TouchableOpacity style={styles.workCard} activeOpacity={0.8} onPress={handleOpenWork}>
      <View style={styles.workCover}>
        <Text style={styles.workCoverText}>Capa do trabalho</Text>
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.workDetailText}>{item.studentName}</Text>
        <Text style={styles.workDetailText}>{item.workTopic}</Text>
        <Text style={styles.workDetailText}>{item.course}</Text>
        <Text style={styles.workDetailText}>{item.institution}</Text>
        <Text style={styles.workDetailText}>{item.academicDegree}</Text>
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="menu" size={28} color="#111" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('AddWork')}
          >
            <Ionicons name="add-circle-outline" size={28} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications-outline" size={28} color="#111" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>9</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Pesquisar"
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search" size={24} color="#6b86f0" />
          </TouchableOpacity>
        </View>

        {/* Temas sugeridos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temas sugeridos</Text>
          <FlatList
            data={suggestedTopics}
            renderItem={renderSuggestedTopic}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trabalhos Recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabalhos Recentes</Text>
          <FlatList
            data={recentWorks}
            renderItem={renderWorkCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Melhores Trabalhos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Melhores Trabalhos</Text>
          <FlatList
            data={bestWorks}
            renderItem={renderWorkCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trabalhos mais visualizados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabalhos mais visualizados</Text>
          <FlatList
            data={mostViewedWorks}
            renderItem={renderWorkCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="home" />

      <Modal
        visible={topicModalVisible && !!selectedTopic}
        animationType="slide"
        transparent
        onRequestClose={() => setTopicModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tema sugerido</Text>
              <TouchableOpacity
                onPress={() => setTopicModalVisible(false)}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              >
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            {selectedTopic && (
              <View>
                <Text style={styles.modalLabel}>Estudante</Text>
                <Text style={styles.modalValue}>{selectedTopic.studentName}</Text>
                <Text style={styles.modalLabel}>Tema</Text>
                <Text style={styles.modalValue}>{selectedTopic.workTopic}</Text>
                <Text style={styles.modalLabel}>Curso</Text>
                <Text style={styles.modalValue}>{selectedTopic.course}</Text>
                <Text style={styles.modalLabel}>DescriÇõÇœo</Text>
                <Text style={styles.modalValue}>{selectedTopic.description}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setTopicModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => {
                  setTopicModalVisible(false);
                  navigation.navigate('Chat', {
                    userName: selectedTopic?.studentName,
                    userCourse: selectedTopic?.course,
                  });
                }}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={[styles.modalButtonText, { color: '#fff', marginLeft: 6 }]}>Mensagem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerIcon: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b86f0',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  suggestedTopicCard: {
    width: width * 0.4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestedTopicText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  workCard: {
    width: width * 0.75,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
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
  workDetailText: {
    fontSize: 12,
    color: '#666',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  modalLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 16,
    color: '#222',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSecondaryButton: {
    backgroundColor: '#e0e0e0',
  },
  modalPrimaryButton: {
    backgroundColor: '#6b86f0',
  },
  modalButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;

