import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

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

const ReadLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Estado da lista de trabalhos
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Busca trabalhos no Supabase
  const fetchWorks = useCallback(async (options?: { activeRef?: { current: boolean } }) => {
    const activeRef = options?.activeRef;
    const isActive = () => !activeRef || activeRef.current;
    if (!isActive()) return;
    setLoading(true);
    try {
      const { data, error: worksError } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      if (worksError) throw worksError;
      const resolvedWorks = await Promise.all(
        (data || []).map(async (work) => {
          if (!work.cover_url) return work;
          try {
            const resolvedUrl = await resolveStorageUrl(work.cover_url);
            return { ...work, cover_url: resolvedUrl || work.cover_url };
          } catch {
            return work;
          }
        }),
      );
      if (!isActive()) return;
      setWorks(resolvedWorks as Work[]);
      setError('');
    } catch (err: any) {
      if (!isActive()) return;
      setError(err?.message || 'Erro ao carregar trabalhos.');
      setWorks([]);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Recarrega ao voltar para a tela
      const activeRef = { current: true };
      fetchWorks({ activeRef });
      return () => {
        activeRef.current = false;
      };
    }, [fetchWorks]),
  );

  useEffect(() => {
    // Carrega na primeira vez
    fetchWorks();
  }, [fetchWorks]);

  // Abre leitura do trabalho
  const handleOpenWork = (id: string, allowDownload?: boolean) => {
    navigation.navigate('ReadWork', { workId: id, allowDownload });
  };

  // Renderiza card de trabalho
  const renderWorkItem = ({ item }: { item: Work }) => (
    <TouchableOpacity
      style={styles.workCard}
      activeOpacity={0.85}
      onPress={() => handleOpenWork(item.id, item.allow_download)}
    >
      <View style={styles.workCover}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={styles.workCoverText}>Capa do trabalho</Text>
        )}
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.workTitle}>{item.title || item.topic || 'Tema do Trabalho'}</Text>
        <Text style={styles.workInfo}>{item.course || 'Curso'}</Text>
        <Text style={styles.workInfo}>{item.institution || 'Instituicao'}</Text>
        <Text style={styles.workInfo}>{item.academic_degree || 'Grau'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabecalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leituras</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Lista principal */}
      {error ? <Text style={[styles.headerTitle, { color: '#d32f2f', fontSize: 14 }]}>{error}</Text> : null}
      <FlatList
        data={works}
        renderItem={renderWorkItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.workInfo}>Carregando...</Text>
          ) : (
            <Text style={styles.workInfo}>Nenhum trabalho.</Text>
          )
        }
        refreshing={loading}
        onRefresh={() => fetchWorks()}
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
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
  workTitle: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default ReadLibraryScreen;
