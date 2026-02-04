import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { getFileExtension, resolveStorageUrl } from '../lib/supabaseStorage';
import { favoritesEvents } from '../lib/favoritesEvents';
import * as FileSystem from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';

type RouteParams = {
  allowDownload?: boolean;
  workId?: string;
};

const ReadWorkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route?.params as RouteParams) || {};
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [starLoading, setStarLoading] = useState(false);
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState('');
  const [readerUrl, setReaderUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getViewerUrl = useCallback((pdfUrl: string) => {
    if (Platform.OS === 'android') {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`;
    }
    return pdfUrl;
  }, []);

  const canDownload = useMemo(() => {
    if (params.allowDownload === false) return false;
    if (work && work.allow_download === false) return false;
    return true;
  }, [params.allowDownload, work]);

  const refreshFavoriteStatus = useCallback(async (options?: { activeRef?: { current: boolean } }) => {
    if (!params.workId) return;
    const activeRef = options?.activeRef;
    const isActive = () => !activeRef || activeRef.current;
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isActive()) setIsFavorite(false);
        return;
      }
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('work_id', params.workId)
        .limit(1);
      if (favError) throw favError;
      if (isActive()) setIsFavorite((favorites || []).length > 0);
    } catch {
      if (isActive()) setIsFavorite(false);
    }
  }, [params.workId]);

  const refreshStarStatus = useCallback(async (options?: { activeRef?: { current: boolean } }) => {
    if (!params.workId) return;
    const activeRef = options?.activeRef;
    const isActive = () => !activeRef || activeRef.current;
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isActive()) setIsStarred(false);
        return;
      }
      const { data: stars, error: starError } = await supabase
        .from('work_stars')
        .select('id')
        .eq('user_id', user.id)
        .eq('work_id', params.workId)
        .limit(1);
      if (starError) throw starError;
      if (isActive()) setIsStarred((stars || []).length > 0);
    } catch {
      if (isActive()) setIsStarred(false);
    }
  }, [params.workId]);

  const incrementViewCount = useCallback(async (workId: string) => {
    try {
      const { error: viewError } = await supabase.rpc('increment_work_view', { work_id: workId });
      if (viewError) console.warn('Erro ao contar visualizacao:', viewError.message);
    } catch (err: any) {
      console.warn('Erro ao contar visualizacao:', err?.message);
    }
  }, []);

  useEffect(() => {
    const activeRef = { current: true };
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
        if (activeRef.current) {
          setWork({
            ...data,
            cover_url: resolvedCover || data?.cover_url,
            pdf_url: resolvedPdf || data?.pdf_url,
          });
        }
        if (data?.id) {
          void incrementViewCount(data.id);
        }
        if (activeRef.current) setError('');
      } catch (err: any) {
        if (activeRef.current) setError(err?.message || 'Erro ao carregar trabalho.');
      } finally {
        if (activeRef.current) setLoading(false);
      }
    };
    fetchWork();
    refreshFavoriteStatus({ activeRef });
    refreshStarStatus({ activeRef });
    return () => {
      activeRef.current = false;
    };
  }, [params.workId, refreshFavoriteStatus, refreshStarStatus, incrementViewCount]);

  useEffect(() => {
    const unsubscribe = favoritesEvents.subscribe((event) => {
      if (!params.workId) return;
      if (event?.workId && event.workId !== params.workId) return;
      if (event?.action) {
        setIsFavorite(event.action === 'added');
        return;
      }
      refreshFavoriteStatus();
    });
    return unsubscribe;
  }, [params.workId, refreshFavoriteStatus]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      if (readerTimeoutRef.current) {
        clearTimeout(readerTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToastMessage(message);
    setToastVisible(true);
    toastAnim.stopAnimation(() => {
      toastAnim.setValue(0);
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setToastVisible(false);
      });
    }, 1800);
  };

  const clearReaderTimeout = () => {
    if (readerTimeoutRef.current) {
      clearTimeout(readerTimeoutRef.current);
      readerTimeoutRef.current = null;
    }
  };



  const handleStartReading = () => {
    if (!work?.pdf_url) {
      showToast('PDF indisponivel.');
      return;
    }
    clearReaderTimeout();
    setReaderError('');
    setIsReading(true);
    setReaderLoading(true);
    setReaderUrl(getViewerUrl(work.pdf_url));
    readerTimeoutRef.current = setTimeout(() => {
      setReaderLoading(false);
      setReaderError('Nao foi possivel abrir o PDF aqui. Use Abrir no navegador.');
    }, 10000);
  };

  const handleReaderLoadEnd = () => {
    clearReaderTimeout();
    setReaderLoading(false);
  };

  const handleReaderError = (event: any) => {
    clearReaderTimeout();
    setReaderLoading(false);
    setReaderError(event?.nativeEvent?.description || 'Nao foi possivel abrir o PDF.');
  };

  const handleOpenExternal = async () => {
    if (!work?.pdf_url) return;
    try {
      await Linking.openURL(work.pdf_url);
    } catch (err: any) {
      setError(err?.message || 'Erro ao abrir o PDF.');
    }
  };

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
      const baseName = (work?.title || work?.topic || `trabalho-${Date.now()}`)
        .toString()
        .replace(/[\\/:*?"<>|]+/g, '')
        .trim();
      const ext = getFileExtension(pdfUrl) || 'pdf';
      const fileName = `${baseName || 'trabalho'}.${ext}`;

      let savedUri: string | null = null;

      if (Platform.OS === 'android' && (FileSystem as any).StorageAccessFramework) {
        const permissions = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions?.granted) {
          throw new Error('Permissao de armazenamento negada.');
        }
        const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, tempUri);
        const encoding = (FileSystem as any).EncodingType?.Base64 || 'base64';
        const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, { encoding });
        const destUri = await (FileSystem as any).StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf',
        );
        await FileSystem.writeAsStringAsync(destUri, base64, { encoding });
        savedUri = destUri;
      } else {
        const downloadsDir = `${FileSystem.documentDirectory}downloads/`;
        await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
        const dest = `${downloadsDir}${fileName}`;
        const downloadResult = await FileSystem.downloadAsync(pdfUrl, dest);
        savedUri = downloadResult.uri;
      }

      if (savedUri) {
        showToast('Arquivo salvo nos Documentos.');
        let openUri = savedUri;
        if (Platform.OS === 'android' && savedUri.startsWith('file://')) {
          try {
            openUri = await FileSystem.getContentUriAsync(savedUri);
          } catch {
            openUri = savedUri;
          }
        }
        await Linking.openURL(openUri);
      }
    } catch (err: any) {
      const message = err?.message || 'Erro ao baixar o PDF.';
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!params.workId || favoriteLoading) return;
    setFavoriteLoading(true);
    setError('');
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Faca login para usar favoritos.');
        return;
      }
      if (isFavorite) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('work_id', params.workId);
        if (deleteError) throw deleteError;
        setIsFavorite(false);
        favoritesEvents.emit({ workId: params.workId, action: 'removed' });
        showToast('Trabalho removido dos favoritos!');
      } else {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, work_id: params.workId });
        if (insertError) throw insertError;
        setIsFavorite(true);
        favoritesEvents.emit({ workId: params.workId, action: 'added' });
        showToast('Trabalho adicionado aos favoritos!');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar favorito.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const toggleStar = async () => {
    if (!params.workId || starLoading) return;
    setStarLoading(true);
    setError('');
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Faca login para usar estrelas.');
        return;
      }
      if (isStarred) {
        const { error: deleteError } = await supabase
          .from('work_stars')
          .delete()
          .eq('user_id', user.id)
          .eq('work_id', params.workId);
        if (deleteError) throw deleteError;
        setIsStarred(false);
        showToast('Estrela removida do trabalho!');
      } else {
        const { error: insertError } = await supabase
          .from('work_stars')
          .insert({ user_id: user.id, work_id: params.workId });
        if (insertError) throw insertError;
        setIsStarred(true);
        showToast('Trabalho marcado como melhor!');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar estrela.');
    } finally {
      setStarLoading(false);
    }
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
            onPress={toggleStar}
            disabled={starLoading}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons
              name={isStarred ? 'star' : 'star-outline'}
              size={24}
              color={isStarred ? '#f4b400' : '#111'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#ff0000' : '#111'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (work?.user_id) {
                navigation.navigate('Chat', { userId: work.user_id });
              } else {
                navigation.navigate('Chat');
              }
            }}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons name='chatbubbles-outline' size={24} color='#6b86f0' />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, !work?.pdf_url && styles.iconButtonDisabled]}
            onPress={work?.pdf_url ? handleStartReading : undefined}
            disabled={!work?.pdf_url}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons name="book-outline" size={24} color={work?.pdf_url ? '#6b86f0' : '#9aa5c8'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, (!canDownload || downloading) && styles.iconButtonDisabled]}
            onPress={canDownload ? handleDownload : undefined}
            disabled={!canDownload || downloading}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons
              name="download-outline"
              size={24}
              color={!canDownload || downloading ? '#9aa5c8' : '#6b86f0'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.pdfContainer, isReading && styles.pdfContainerReading]}>
        {isReading ? (
          <>
            {readerError ? (
              <View style={styles.readerError}>
                <Text style={styles.readerErrorText}>{readerError}</Text>
                <TouchableOpacity style={styles.readerErrorButton} onPress={handleOpenExternal}>
                  <Text style={styles.readerErrorButtonText}>Abrir no navegador</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <WebView
                source={readerUrl ? { uri: readerUrl } : { html: '<html><body></body></html>' }}
                style={styles.pdfViewer}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                onLoadEnd={handleReaderLoadEnd}
                onError={handleReaderError}
                onHttpError={handleReaderError}
              />
            )}
            {readerLoading ? (
              <View style={styles.readerLoading}>
                <ActivityIndicator size="large" color="#6b86f0" />
                <Text style={styles.readerLoadingText}>Carregando...</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.closeViewerButton}
              onPress={() => {
                setIsReading(false);
                setReaderError('');
                setReaderUrl(null);
              }}
              hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.coverContent}
            activeOpacity={work?.pdf_url ? 0.85 : 1}
            onPress={work?.pdf_url ? handleStartReading : undefined}
          >
            {work?.cover_url ? (
              <Image
                source={{ uri: work.cover_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode='cover'
              />
            ) : (
              <Text style={styles.pdfText}>{loading ? 'Carregando...' : work?.title || 'Arquivo PDF'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={[styles.pdfText, { color: '#d32f2f', padding: 12 }]}>{error}</Text> : null}

      {toastVisible ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}

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
    padding: 4,
    marginLeft: 6,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    margin: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pdfContainerReading: {
    margin: 0,
    borderRadius: 0,
    backgroundColor: '#ffffff',
  },
  pdfViewer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  readerLoading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  readerLoadingText: {
    marginTop: 8,
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  readerError: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  readerErrorText: {
    color: '#222',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  readerErrorButton: {
    backgroundColor: '#6b86f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  readerErrorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeViewerButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 16,
    padding: 6,
  },
  coverContent: {
    width: '100%',
    height: '100%',
  },
  pdfText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#1f2933',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReadWorkScreen;
