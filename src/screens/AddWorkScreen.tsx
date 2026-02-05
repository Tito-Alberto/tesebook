import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { getFileExtension, getImageContentType, uploadToBucket } from '../lib/supabaseStorage';

const AddWorkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Estado do formulario e arquivos
  const pdfPlaceholder = 'Arquivo PDF';
  const [pdfFile, setPdfFile] = useState(pdfPlaceholder);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverAsset, setCoverAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Seleciona imagem de capa
  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissao para acessar as fotos e necessaria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setCoverImage(asset.uri);
      setCoverAsset(asset);
    }
  };

  // Seleciona arquivo PDF
  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      setPdfFile(result.name || 'Arquivo selecionado');
      // @ts-ignore Expo SDK may return uri at root or inside assets
      setPdfUri((result as any).uri || result.assets?.[0]?.uri || null);
    } else if ('assets' in result && result.assets && result.assets.length > 0) {
      setPdfFile(result.assets[0].name || 'Arquivo selecionado');
      setPdfUri(result.assets[0].uri || null);
    }
  };

  // Envia trabalho com PDF e capa
  const handleAdd = async () => {
    if (!topic.trim()) {
      setErrorMessage('Digite o tema.');
      return;
    }
    if (!pdfUri) {
      setErrorMessage('Selecione um arquivo PDF.');
      return;
    }
    setErrorMessage('');
    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setErrorMessage('Faca login para adicionar um trabalho.');
        setUploading(false);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token || null;
      let profileCourse = '';
      let profileInstitution = '';
      let profileDegree = '';
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('course,institution,academic_degree')
          .eq('id', user.id)
          .single();
        profileCourse = profileData?.course || '';
        profileInstitution = profileData?.institution || '';
        profileDegree = profileData?.academic_degree || '';
      } catch {
        // Mantem campos em branco caso falhe
      }

      const pdfExt = getFileExtension(pdfFile) || getFileExtension(pdfUri) || 'pdf';
      const pdfPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${pdfExt}`;
      let pdfUrl: string | null = null;
      try {
        pdfUrl = await uploadToBucket(
          pdfUri,
          'work-pdfs',
          pdfPath,
          'application/pdf',
          null,
          true,
          accessToken,
        );
      } catch (err: any) {
        const message = `Falha no upload do PDF: ${err?.message || 'erro desconhecido'}`;
        setErrorMessage(message);
        setUploading(false);
        return;
      }

      let coverUrl: string | null = null;
      if (coverImage) {
        const coverExt = getFileExtension(coverAsset?.fileName || coverAsset?.uri || coverImage) || 'jpg';
        const coverPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${coverExt}`;
        const coverType = getImageContentType(coverAsset?.fileName || coverAsset?.uri || coverImage, coverAsset?.mimeType);
        try {
          coverUrl = await uploadToBucket(
            coverImage,
            'work-covers',
            coverPath,
            coverType,
            null,
            true,
            accessToken,
          );
      } catch (err: any) {
        const message = `Falha no upload da capa: ${err?.message || 'erro desconhecido'}`;
        setErrorMessage(message);
        setUploading(false);
        return;
      }
      }

      const { error } = await supabase.from('works').insert({
        user_id: user.id,
        title: topic,
        topic,
        course: profileCourse,
        institution: profileInstitution,
        academic_degree: profileDegree,
        cover_url: coverUrl,
        pdf_url: pdfUrl,
        allow_download: allowDownload,
      });
      if (error) {
        const message = `Falha ao salvar trabalho: ${error.message}`;
        setErrorMessage(message);
        setUploading(false);
        return;
      }
      setErrorMessage('');
      setUploading(false);
      Alert.alert('Sucesso', 'Trabalho adicionado com sucesso!');
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      const message = err?.message || 'Erro ao enviar arquivos.';
      setErrorMessage(message);
    } finally {
      setUploading(false);
    }
  };

  // Cancela e volta
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* // Cabecalho */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
        >
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* // Capa do trabalho */}
        <TouchableOpacity
          style={styles.coverPhotoContainer}
          activeOpacity={0.8}
          onPress={pickCoverImage}
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.coverPhotoImage}
            />
          ) : (
            <Text style={styles.coverPhotoText}>Adicionar foto da capa do trabalho</Text>
          )}
        </TouchableOpacity>

        {/* // Campos do formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adicionar trabalho</Text>
            <TouchableOpacity style={styles.inputTouchable} onPress={pickPdf}>
              <Text style={[styles.input, { color: pdfFile === pdfPlaceholder ? '#999' : '#222' }]}>
                {pdfFile}
              </Text>
            </TouchableOpacity>
            <View style={styles.inputLine} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adicionar Tema</Text>
            <TextInput
              style={styles.input}
              value={topic}
              onChangeText={setTopic}
              placeholder="Digite o tema"
              placeholderTextColor="#999"
            />
            <View style={styles.inputLine} />
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Permitir fazer download?</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>{allowDownload ? 'Sim' : 'Nao'}</Text>
              <Switch
                value={allowDownload}
                onValueChange={setAllowDownload}
                trackColor={{ false: '#d9def2', true: '#6b86f0' }}
                thumbColor={allowDownload ? '#ffffff' : '#ffffff'}
                ios_backgroundColor="#d9def2"
              />
            </View>
          </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        </View>

        {/* // Acoes */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.addButton, uploading && { opacity: 0.7 }]}
            onPress={handleAdd}
            activeOpacity={0.85}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>{uploading ? 'Enviando...' : 'Adicionar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
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
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  coverPhotoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
  },
  coverPhotoText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    fontWeight: '700',
  },
  input: {
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  inputTouchable: {
    paddingVertical: 8,
  },
  inputLine: {
    height: 1,
    backgroundColor: '#6b86f0',
    marginTop: 8,
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#6b86f0',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b86f0',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddWorkScreen;
