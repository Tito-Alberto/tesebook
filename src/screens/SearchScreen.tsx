import React, { useState } from 'react';
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

interface Work {
  id: string;
  studentName: string;
  workTopic: string;
  course: string;
  institution: string;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Curso' | 'Instituição'>('Curso');

  // Dados de exemplo
  const works: Work[] = [
    {
      id: '1',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
    },
    {
      id: '2',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
    },
    {
      id: '3',
      studentName: 'Nome do Estudante',
      workTopic: 'Tema do Trabalho',
      course: 'Curso',
      institution: 'Nome da Instituição',
    },
  ];

  const renderWorkItem = ({ item }: { item: Work }) => (
    <View style={styles.workItem}>
      <View style={styles.workCover}>
        <Text style={styles.workCoverText}>Capa do trabalho</Text>
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.workTopic}>{item.workTopic}</Text>
        <Text style={styles.workInfo}>{item.course}</Text>
        <Text style={styles.workInfo}>{item.institution}</Text>
      </View>
    </View>
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

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Curso')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Curso' && styles.tabTextActive,
              ]}
            >
              Curso
            </Text>
            {activeTab === 'Curso' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Instituição')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Instituição' && styles.tabTextActive,
              ]}
            >
              Instituição
            </Text>
            {activeTab === 'Instituição' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={works}
          renderItem={renderWorkItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="search" />
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
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#6b86f0',
    fontWeight: '700',
  },
  tabUnderline: {
    height: 2,
    backgroundColor: '#6b86f0',
    marginTop: 4,
    width: '100%',
  },
  searchIcon: {
    padding: 8,
    marginLeft: 16,
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
  workItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffffff',
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
    fontWeight: '600',
  },
  workDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workTopic: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workInfo: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
});

export default SearchScreen;

