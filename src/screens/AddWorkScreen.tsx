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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles';

const AddWorkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const pdfPlaceholder = 'Arquivo PDF';
  const [pdfFile, setPdfFile] = useState(pdfPlaceholder);
  const [topic, setTopic] = useState('');
  const [allowDownload, setAllowDownload] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

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
      setCoverImage(result.assets[0].uri);
    }
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      setPdfFile(result.name || 'Arquivo selecionado');
    } else if ('assets' in result && result.assets && result.assets.length > 0) {
      setPdfFile(result.assets[0].name || 'Arquivo selecionado');
    }
  };

  const handleAdd = () => {
    if (topic.trim() && allowDownload !== null) {
      navigation.navigate('ReadWork', {
        allowDownload: allowDownload === 'sim',
      });
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.coverPhotoContainer}
          activeOpacity={0.8}
          onPress={pickCoverImage}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverPhotoImage} />
          ) : (
            <Text style={styles.coverPhotoText}>Adicionar foto da capa do trabalho</Text>
          )}
        </TouchableOpacity>

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

          <View style={styles.radioContainer}>
            <Text style={styles.label}>Permitir fazer download?</Text>
            <View style={styles.radioButtons}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setAllowDownload('sim')}>
                <View style={styles.radioCircle}>
                  {allowDownload === 'sim' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Sim</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.radioOption} onPress={() => setAllowDownload('nao')}>
                <View style={styles.radioCircle}>
                  {allowDownload === 'nao' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Nao</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Adicionar</Text>
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
  radioContainer: {
    marginBottom: 24,
  },
  radioButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b86f0',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6b86f0',
  },
  radioText: {
    fontSize: 16,
    color: '#222',
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
