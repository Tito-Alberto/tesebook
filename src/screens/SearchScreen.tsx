import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabaseClient';

interface Work {
  id: string;
  title?: string;
  topic?: string;
  course?: string;
  institution?: string;
  cover_url?: string;
  allow_download?: boolean;
}

type TabKey = 'Curso' | 'Instituicao';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabKey>('Curso');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const courseOptions = useMemo(() => {
    const list = works.map((w) => w.course).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [works]);

  const institutionOptions = useMemo(() => {
    const list = works.map((w) => w.institution).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [works]);

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      setLoading(false);
      if (fetchError) {
        setError(fetchError.message || 'Erro ao carregar trabalhos.');
      } else {
        setError('');
        setWorks(data || []);
      }
    };
    fetchWorks();
  }, []);

  const filteredWorks = works.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchCourse =
      !selectedCourse || (item.course || '').toLowerCase() === selectedCourse.toLowerCase();
    const matchInstitution =
      !selectedInstitution || (item.institution || '').toLowerCase() === selectedInstitution.toLowerCase();
    const matchQuery =
      !query ||
      (item.topic || '').toLowerCase().includes(query) ||
      (item.title || '').toLowerCase().includes(query) ||
      (item.course || '').toLowerCase().includes(query) ||
      (item.institution || '').toLowerCase().includes(query);
    const byTab = activeTab === 'Curso' ? matchCourse : matchInstitution;
    return matchCourse && matchInstitution && matchQuery && byTab;
  });

  const renderWorkItem = ({ item }: { item: Work }) => (
    <TouchableOpacity
      style={styles.workItem}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ReadWork', {
          workId: item.id,
          allowDownload: item.allow_download,
        })
      }
    >
      <View style={styles.workCover}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={styles.workCoverText}>Capa do trabalho</Text>
        )}
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.studentName}>{item.title || item.topic || 'Tema do Trabalho'}</Text>
        <Text style={styles.workInfo}>{item.course || 'Curso'}</Text>
        <Text style={styles.workInfo}>{item.institution || 'Instituicao'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

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
            onPress={() => setActiveTab('Instituicao')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Instituicao' && styles.tabTextActive,
              ]}
            >
              Instituição
            </Text>
            {activeTab === 'Instituicao' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchIcon}
            onPress={() => setSearchVisible((prev) => !prev)}
          >
            <Ionicons name="search" size={24} color="#111" />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b86f0" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por tema, nome, curso ou instituição"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        <View style={styles.filterRow}>
          {activeTab === 'Curso' ? (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setCourseModalVisible(true)}
            >
              <Text style={[styles.filterText, { color: selectedCourse ? '#222' : '#888' }]}>
                {selectedCourse || 'Selecionar curso'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setInstitutionModalVisible(true)}
            >
              <Text style={[styles.filterText, { color: selectedInstitution ? '#222' : '#888' }]}>
                {selectedInstitution || 'Selecionar instituição'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={[styles.tabText, { color: '#d32f2f', paddingHorizontal: 16 }]}>{error}</Text> : null}
        <FlatList
          data={filteredWorks}
          renderItem={renderWorkItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <Text style={styles.workInfo}>Carregando...</Text>
            ) : (
              <Text style={styles.workInfo}>Nenhum resultado.</Text>
            )
          }
        />
      </ScrollView>

      <BottomNav active="search" />

      <Modal
        visible={courseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCourseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o curso</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {courseOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCourse(item);
                    setCourseModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setCourseModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={institutionModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInstitutionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha a instituição</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {institutionOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedInstitution(item);
                    setInstitutionModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setInstitutionModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
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
  workInfo: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  modalClose: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#6b86f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
