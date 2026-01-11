import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

type RouteParams = {
  allowDownload?: boolean;
  workId?: string;
};

const ReadWorkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route?.params as RouteParams) || {};
  const [isFavorite, setIsFavorite] = useState(false);
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const canDownload = useMemo(() => {
    if (params.allowDownload === false) return false;
    if (work && work.allow_download === false) return false;
    return true;
  }, [params.allowDownload, work]);

  useEffect(() => {
    const fetchWork = async () => {
      if (!params.workId) return;
      setLoading(true);
      try {
        const { data, error: workError } = await supabase
          .from('works')
          .select('*')
          .eq('id', params.workId)
          .single();
        if (workError) throw workError;
        const resolvedCover = data?.cover_url ? await resolveStorageUrl(data.cover_url) : null;
        const resolvedPdf = data?.pdf_url ? await resolveStorageUrl(data.pdf_url) : null;
        setWork({
          ...data,
          cover_url: resolvedCover || data?.cover_url,
          pdf_url: resolvedPdf || data?.pdf_url,
        });
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar trabalho.');
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [params.workId]);

  const handleDownload = async () => {
    if (!canDownload || !work) return;
    const pdfUrl = work.pdf_url;
    if (!pdfUrl) {
      setError('Nenhum PDF disponivel.');
      return;
    }
    setError('');
    setDownloading(true);
    try {
      await Linking.openURL(pdfUrl);
    } catch (err: any) {
      const message = err?.message || 'Erro ao baixar o PDF.';
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Ionicons name='arrow-back' size={26} color='#111' />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode='contain'
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chat')}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons name='chatbubbles-outline' size={28} color='#6b86f0' />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFavorite}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? '#ff0000' : '#111'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pdfContainer}>
        {work?.cover_url ? (
          <Image
            source={{ uri: work.cover_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode='cover'
          />
        ) : (
          <Text style={styles.pdfText}>{loading ? 'Carregando...' : work?.title || 'Arquivo PDF'}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.downloadButton,
          (!canDownload || downloading) && styles.downloadButtonDisabled,
        ]}
        onPress={canDownload ? handleDownload : undefined}
        activeOpacity={canDownload ? 0.85 : 1}
        disabled={!canDownload || downloading}
      >
        <Text
          style={[
            styles.downloadButtonText,
            (!canDownload || downloading) && styles.downloadButtonTextDisabled,
          ]}
        >
          {downloading ? 'Baixando...' : 'BAIXAR'}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={[styles.pdfText, { color: '#d32f2f', padding: 12 }]}>{error}</Text> : null}

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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    margin: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  downloadButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 28,
    backgroundColor: '#6b86f0',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  downloadButtonDisabled: {
    backgroundColor: '#c7d0f8',
  },
  downloadButtonTextDisabled: {
    color: '#eaeaea',
  },
});

export default ReadWorkScreen;
