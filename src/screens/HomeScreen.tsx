import React, { useCallback, useMemo, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

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
  star_count?: number;
  view_count?: number;
}

interface SuggestedTopic {
  id: string;
  title: string;
  course?: string;
  description?: string;
  user_id?: string;
  user?: {
    name?: string;
    photo_url?: string | null;
    institution?: string;
    course?: string;
  };
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Estado principal da tela
  const [works, setWorks] = useState<Work[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SuggestedTopic | null>(null);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Helpers para navegar entre tabs e stack
  const goToTab = (screen: string) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('MainTabs', { screen });
    } else {
      navigation.navigate(screen);
    }
  };
  const goToStack = (screen: string) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  // Carrega trabalhos ao focar na tela
  // Carrega temas sugeridos ao focar na tela
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchWorks = async () => {
        setLoading(true);
        try {
          const { data, error: worksError } = await supabase
            .from('works')
            .select('*')
            .order('created_at', { ascending: false });
          if (worksError) throw worksError;
          if (!isActive) return;
          setError('');
          const workIds = (data || []).map((work: any) => work.id).filter(Boolean);
          const starCounts = new Map<string, number>();
          if (workIds.length > 0) {
            const { data: starsData, error: starsError } = await supabase
              .from('work_stars')
              .select('work_id')
              .in('work_id', workIds);
            if (starsError) {
              console.warn('Erro ao carregar estrelas:', starsError.message);
            } else {
              (starsData || []).forEach((row: any) => {
                const current = starCounts.get(row.work_id) ?? 0;
                starCounts.set(row.work_id, current + 1);
              });
            }
          }
          const resolvedWorks = await Promise.all(
            (data || []).map(async (work: any) => {
              const starCount = starCounts.get(work.id) ?? 0;
              const resolvedUrl = work.cover_url
                ? await resolveStorageUrl(work.cover_url)
                : null;
              return {
                ...work,
                star_count: starCount,
                cover_url: resolvedUrl || work.cover_url,
              };
            }),
          );
          if (!isActive) return;
          setWorks(resolvedWorks as Work[]);
        } catch (err: any) {
          if (!isActive) return;
          setError(err?.message || 'Erro ao carregar trabalhos.');
          setWorks([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchWorks();
      return () => {
        isActive = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchTopics = async () => {
        try {
          const { data, error: topicsError } = await supabase
            .from('suggested_topics')
            .select('*')
            .order('created_at', { ascending: false });
          if (topicsError) throw topicsError;
          if (!isActive) return;
          const topics = (data || []) as SuggestedTopic[];
          const userIds = Array.from(
            new Set((topics || []).map((topic) => topic.user_id).filter(Boolean)),
          ) as string[];
          const profilesById = new Map<string, { name?: string; photo_url?: string | null }>();

          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id,name,photo_url,institution,course')
              .in('id', userIds);
            if (!profilesError && profilesData) {
              const resolvedProfiles = await Promise.all(
                profilesData.map(async (profile: any) => {
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
                profilesById.set(profile.id, {
                  name: profile.name,
                  photo_url: profile.photo_url,
                  institution: profile.institution,
                  course: profile.course,
                });
              });
            }
          }

          const enrichedTopics = (topics || []).map((topic) => ({
            ...topic,
            user: topic.user_id ? profilesById.get(topic.user_id) : undefined,
          }));
          if (!isActive) return;
          setSuggestedTopics(enrichedTopics as SuggestedTopic[]);
        } catch (err: any) {
          if (!isActive) return;
          console.warn('Erro ao carregar temas sugeridos:', err?.message);
          setSuggestedTopics([]);
        }
      };
      fetchTopics();
      return () => {
        isActive = false;
      };
    }, []),
  );
  // Listas derivadas para seccoes
  const recentWorks = useMemo(() => works, [works]);
  const bestWorks = useMemo(() => {
    const sorted = works
      .filter((work) => (work.star_count ?? 0) > 0)
      .sort(
      (a, b) => (b.star_count ?? 0) - (a.star_count ?? 0),
    );
    return sorted;
  }, [works]);
  const mostViewedWorks = useMemo(() => {
    const sorted = works
      .filter((work) => (work.view_count ?? 0) > 0)
      .sort(
        (a, b) => (b.view_count ?? 0) - (a.view_count ?? 0),
      );
    return sorted;
  }, [works]);

  // Renderiza card de trabalho
  const renderWorkCard =
    (showViews = false) =>
    ({ item }: { item: Work }) => (
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
        {showViews ? (
          <View style={styles.viewRow}>
            <Ionicons name="eye-outline" size={14} color="#6b86f0" />
            <Text style={styles.viewText}>{item.view_count ?? 0}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  // Renderiza card de tema sugerido
  const renderSuggestedTopic = ({ item }: { item: SuggestedTopic }) => (
    <TouchableOpacity
      style={styles.suggestedTopicCard}
      activeOpacity={0.85}
      onPress={() => {
        setSelectedTopic(item);
        setTopicModalVisible(true);
      }}
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicAvatar}>
          {item.user?.photo_url ? (
            <Image source={{ uri: item.user.photo_url }} style={styles.topicAvatarImage} />
          ) : (
            <Ionicons name="person" size={22} color="#6b86f0" />
          )}
        </View>
        <View style={styles.topicMeta}>
          <Text style={styles.suggestedTopicTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.suggestedTopicCourse}>{item.course || 'Curso'}</Text>
          <Text style={styles.suggestedTopicAuthor} numberOfLines={1}>
            {item.user?.name || 'Autor desconhecido'}
          </Text>
          <Text style={styles.suggestedTopicInstitution} numberOfLines={1}>
            {item.user?.institution || 'Instituicao nao informada'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* // Cabecalho */}
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
            onPress={() => goToStack('AddWork')}
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

        {/* // Pesquisa rapida */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Pesquisar"
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => goToTab('Search')}>
            <Ionicons name="search" size={24} color="#6b86f0" />
          </TouchableOpacity>
        </View>

        {/* // Temas sugeridos */}
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

        {/* // Trabalhos recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {loading ? 'Carregando trabalhos...' : 'Trabalhos Recentes'}
          </Text>
          <FlatList
            data={recentWorks}
            renderItem={renderWorkCard()}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={
              <Text style={styles.workDetailText}>
                {loading ? 'Carregando...' : 'Nenhum trabalho.'}
              </Text>
            }
          />
        </View>

        {/* // Melhores trabalhos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Melhores Trabalhos</Text>
          <FlatList
            data={bestWorks}
            renderItem={renderWorkCard()}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={
              <Text style={styles.workDetailText}>
                {loading ? 'Carregando...' : 'Nenhum trabalho.'}
              </Text>
            }
          />
        </View>

        {/* // Mais visualizados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabalhos mais visualizados</Text>
          <FlatList
            data={mostViewedWorks}
            renderItem={renderWorkCard(true)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ListEmptyComponent={
              <Text style={styles.workDetailText}>
                {loading ? 'Carregando...' : 'Nenhum trabalho.'}
              </Text>
            }
          />
        </View>
      </ScrollView>

      {/* // Modal de detalhes do tema */}
      <Modal
        visible={topicModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setTopicModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{selectedTopic?.title || 'Tema'}</Text>
              <TouchableOpacity
                style={styles.modalMessageButton}
                onPress={() => {
                  if (!selectedTopic?.user_id) return;
                  setTopicModalVisible(false);
                  navigation.navigate('Chat', {
                    userId: selectedTopic.user_id,
                    userName: selectedTopic.user?.name || 'Usuario',
                    userCourse: selectedTopic.user?.course || selectedTopic.course || 'Curso',
                    userInstitution: selectedTopic.user?.institution || 'Instituicao',
                    userPhotoUrl: selectedTopic.user?.photo_url || null,
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6b86f0" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>{selectedTopic?.course || 'Curso'}</Text>
            <View style={styles.modalAuthorRow}>
              <View style={styles.modalAvatar}>
                {selectedTopic?.user?.photo_url ? (
                  <Image source={{ uri: selectedTopic.user.photo_url }} style={styles.modalAvatarImage} />
                ) : (
                  <Ionicons name="person" size={18} color="#6b86f0" />
                )}
              </View>
              <Text style={styles.modalAuthorName}>
                {selectedTopic?.user?.name || 'Autor desconhecido'}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                {selectedTopic?.description?.trim()
                  ? selectedTopic?.description
                  : 'Sem descricao.'}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setTopicModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
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
    paddingBottom: 20,
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
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewText: {
    fontSize: 12,
    color: '#6b86f0',
    marginLeft: 6,
    fontWeight: '600',
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
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  topicAvatarImage: {
    width: '100%',
    height: '100%',
  },
  topicMeta: {
    flex: 1,
  },
  suggestedTopicTitle: {
    fontSize: 13,
    color: '#222',
    fontWeight: '700',
  },
  suggestedTopicCourse: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  suggestedTopicAuthor: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  suggestedTopicInstitution: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalMessageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b86f0',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  modalAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalAuthorName: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  modalClose: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#6b86f0',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HomeScreen;
