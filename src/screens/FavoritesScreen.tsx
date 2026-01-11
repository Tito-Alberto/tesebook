import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

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

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchFavorites = async () => {
        setLoading(true);
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError || !user) {
            if (!isActive) return;
            setError('Faca login para ver seus favoritos.');
            setWorks([]);
            setLoading(false);
            return;
          }

          const { data: favorites, error: favError } = await supabase
            .from('favorites')
            .select('work_id')
            .eq('user_id', user.id);
          if (favError) throw favError;
          const workIds = (favorites || []).map((f) => f.work_id);
          if (workIds.length === 0) {
            if (!isActive) return;
            setError('');
            setWorks([]);
            setLoading(false);
            return;
          }

          const { data: worksData, error: worksError } = await supabase
            .from('works')
            .select('*')
            .in('id', workIds);
          if (worksError) throw worksError;
          if (!isActive) return;
          setError('');
          setWorks((worksData || []) as Work[]);
        } catch (err: any) {
          if (!isActive) return;
          setError(err?.message || 'Erro ao carregar favoritos.');
          setWorks([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchFavorites();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleOpenWork = (id: string, allow_download?: boolean) => {
    navigation.navigate('ReadWork', { workId: id, allowDownload: allow_download });
  };

  const handleMessage = () => {
    navigation.navigate('Chat');
  };

  const renderFavoriteWork = ({ item }: { item: Work }) => (
    <TouchableOpacity style={styles.workCard} activeOpacity={0.85} onPress={() => handleOpenWork(item.id, item.allow_download)}>
      <View style={styles.workCover}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Text style={styles.workCoverText}>Capa do trabalho</Text>
        )}
      </View>
      <View style={styles.workDetails}>
        <Text style={styles.studentName}>{item.title || item.topic || 'Tema do Trabalho'}</Text>
        <Text style={styles.workDetailText}>{item.course || 'Curso'}</Text>
        <Text style={styles.workDetailText}>{item.institution || 'Instituicao'}</Text>
        <Text style={styles.academicDegree}>{item.academic_degree || 'Grau'}</Text>
      </View>
      <View style={styles.actionsColumn}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage} activeOpacity={0.8}>
          <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
          <Text style={styles.messageButtonText}>Mensagem</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        {error ? <Text style={[styles.headerTitle, { color: '#d32f2f', fontSize: 14 }]}>{error}</Text> : null}
        <FlatList
          data={works}
          renderItem={renderFavoriteWork}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? <Text style={styles.workDetailText}>Carregando...</Text> : <Text style={styles.workDetailText}>Nenhum trabalho.</Text>
          }
        />
      </ScrollView>

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
    paddingBottom: 20,
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
});

export default FavoritesScreen;
