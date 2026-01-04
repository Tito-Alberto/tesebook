import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabaseClient';

const { width } = Dimensions.get('window');

interface Work {
  id: string;
  title?: string;
  topic?: string;
  course?: string;
  institution?: string;
  academic_degree?: string;
  cover_url?: string;
  allow_download?: boolean;
}

interface SuggestedTopic {
  id: string;
  title: string;
  course?: string;
  description?: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [works, setWorks] = useState<Work[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error: fetchError } = await supabase
        .from('suggested_topics')
        .select('id,title,course,description')
        .order('created_at', { ascending: false })
        .limit(10);
      if (fetchError) {
        // mantém erro separado dos trabalhos
        console.warn('Erro ao carregar temas sugeridos:', fetchError.message);
      } else {
        setSuggestedTopics(data || []);
      }
    };
    fetchTopics();
  }, []);

  const recentWorks = useMemo(() => works, [works]);
  const bestWorks = useMemo(() => works, [works]);
  const mostViewedWorks = useMemo(() => works, [works]);

  const renderWorkCard = ({ item }: { item: Work }) => (
    <TouchableOpacity
      style={styles.workCard}
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
        <Text style={styles.workDetailText}>{item.title || item.topic || 'Tema do Trabalho'}</Text>
        <Text style={styles.workDetailText}>{item.course || 'Curso'}</Text>
        <Text style={styles.workDetailText}>{item.institution || 'Instituicao'}</Text>
        <Text style={styles.workDetailText}>{item.academic_degree || 'Grau'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestedTopic = ({ item }: { item: SuggestedTopic }) => (
    <View style={styles.suggestedTopicCard}>
      <Ionicons name="bulb-outline" size={28} color="#6b86f0" />
      <Text style={styles.suggestedTopicText}>{item.title}</Text>
      <Text style={styles.suggestedTopicText}>{item.course || 'Curso'}</Text>
      {item.description ? (
        <Text style={[styles.suggestedTopicText, { color: '#444' }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
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
        {error ? <Text style={[styles.sectionTitle, { color: '#d32f2f', paddingHorizontal: 16 }]}>{error}</Text> : null}

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
            ListEmptyComponent={
              <Text style={styles.workDetailText}>{loading ? 'Carregando...' : 'Nenhum tema.'}</Text>
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {loading ? 'Carregando trabalhos...' : 'Trabalhos Recentes'}
          </Text>
          <FlatList
            data={recentWorks}
            renderItem={renderWorkCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

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

      <BottomNav active="home" />
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
  suggestedTopicCard: {
    width: width * 0.5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
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
  },
});

export default HomeScreen;
