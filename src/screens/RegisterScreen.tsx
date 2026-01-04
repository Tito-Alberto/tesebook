import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { globalStyles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';

const normalizeEmail = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed.includes('@') ? trimmed : `${trimmed}@tesebook.com`;
};

const courseOptions = [
  'DIREITO',
  'CIÊNCIA POLÍTICA',
  'RELAÇÕES INTERNACIONAIS',
  'SOCIOLOGIA',
  'PSICOLOGIA',
  'FILOSOFIA',
  'HISTÓRIA',
  'CIÊNCIAS DA EDUCAÇÃO',
  'PEDAGOGIA',
  'EDUCAÇÃO DE INFÂNCIA',
  'ECONOMIA',
  'GESTÃO DE EMPRESAS',
  'ADMINISTRAÇÃO PÚBLICA',
  'CONTABILIDADE',
  'FINANÇAS',
  'AUDITORIA',
  'MARKETING',
  'RECURSOS HUMANOS',
  'COMÉRCIO INTERNACIONAL',
  'GESTÃO DE RECURSOS HUMANOS',
  'GESTÃO HOSPITALAR',
  'MATEMÁTICA',
  'FÍSICA',
  'QUÍMICA',
  'ESTATÍSTICA',
  'INFORMÁTICA',
  'ENGENHARIA INFORMÁTICA',
  'CIÊNCIA DA COMPUTAÇÃO',
  'SISTEMAS DE INFORMAÇÃO',
  'TECNOLOGIAS DE INFORMAÇÃO',
  'TELECOMUNICAÇÕES',
  'ENGENHARIA CIVIL',
  'ENGENHARIA MECÂNICA',
  'ENGENHARIA ELÉTRICA',
  'ENGENHARIA ELETROTÉCNICA',
  'ENGENHARIA DE MINAS',
  'ENGENHARIA GEOLÓGICA',
  'ENGENHARIA QUÍMICA',
  'ENGENHARIA PETROLÍFERA',
  'ENGENHARIA AMBIENTAL',
  'ENGENHARIA DE PRODUÇÃO',
];

const institutionOptions = [
  'INSTITUTO SUPERIOR POLITÉCNICO DE TECNOLOGIAS E CIÊNCIAS (ISPTEC)',
  'INSTITUTO SUPERIOR TÉCNICO DE ANGOLA (ISTA)',
  'INSTITUTO SUPERIOR DE CIÊNCIAS DA EDUCAÇÃO (ISCED)',
  'INSTITUTO SUPERIOR POLITÉCNICO ALVAREZ DO PACO (ISPAP)',
  'INSTITUTO SUPERIOR METODISTA DE ANGOLA (ISMA)',
  'INSTITUTO SUPERIOR JEAN PIAGET DE ANGOLA (ISPIAGET)',
  'INSTITUTO SUPERIOR POLITÉCNICO GREGÓRIO SEMEDO (ISPGS)',
  'INSTITUTO SUPERIOR POLITÉCNICO DA UNIVERSIDADE PRIVADA DE ANGOLA (ISP-UPRA)',
  'INSTITUTO SUPERIOR POLITÉCNICO INDEPENDENTE (ISPI)',
  'INSTITUTO SUPERIOR TÉCNICO ÓSCAR RIBAS (ISTOR)',
  'UNIVERSIDADE AGOSTINHO NETO (UAN)',
  'UNIVERSIDADE KATYAVALA BWILA (UKB)',
  'UNIVERSIDADE JOSÉ EDUARDO DOS SANTOS (UJES)',
  'UNIVERSIDADE MANDUME YA NDEMUFAYO (UMN)',
  'UNIVERSIDADE LUEJI A’NKONDE (ULAN)',
  'UNIVERSIDADE CUITO CUANAVALE (UCC)',
  'UNIVERSIDADE KIMPA VITA (UKV)',
  'UNIVERSIDADE 11 DE NOVEMBRO (UON)',
  'UNIVERSIDADE CATÓLICA DE ANGOLA (UCAN)',
  'UNIVERSIDADE METODISTA DE ANGOLA (UMA)',
  'UNIVERSIDADE LUSÍADA DE ANGOLA (ULA)',
];

const degreeOptions = ['Licenciatura', 'Mestrado', 'Pós-Graduação'];

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
  const [degreeModalVisible, setDegreeModalVisible] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Digite seu nome completo.';
    if (!email.trim()) next.email = 'Digite seu email.';
    if (!password) next.password = 'Digite uma senha.';
    else if (password.length < 6) next.password = 'Senha precisa ter pelo menos 6 caracteres.';
    if (!confirm) next.confirm = 'Confirme sua senha.';
    else if (confirm !== password) next.confirm = 'As senhas nao coincidem.';
    if (!course) next.course = 'Selecione/insira o curso.';
    if (!institution) next.institution = 'Digite a instituicao.';
    if (!degree) next.degree = 'Informe o grau.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const pickUserPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setPhotoError('Permissao para acessar fotos e necessaria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUserPhoto(result.assets[0].uri);
      setPhotoError('');
    }
  };

  const uploadProfilePhoto = async (uri: string, userId: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split('.').pop() || 'jpg';
    const path = `profiles/${userId}.${ext}`;
    const { error } = await supabase.storage.from('profile-photos').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setAuthError('');
    setLoading(true);
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });
    if (error) {
      setAuthError(error.message || 'Erro ao criar conta.');
      setLoading(false);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      let photoUrl: string | null = null;
      if (userPhoto) {
        try {
          photoUrl = await uploadProfilePhoto(userPhoto, userId);
        } catch (err: any) {
          setPhotoError(err?.message || 'Erro ao enviar foto.');
        }
      }

      await supabase.from('profiles').upsert({
        id: userId,
        name,
        course,
        institution,
        academic_degree: degree,
        photo_url: photoUrl,
      });
    }
    setLoading(false);
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, { flex: 1 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
          >
            <Ionicons name="arrow-back" size={36} color="#111" />
          </TouchableOpacity>
          <Image source={require('../../assets/tesebook.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.form}>
          <View style={styles.photoWrapper}>
            <TouchableOpacity onPress={pickUserPhoto} style={styles.photoButton} activeOpacity={0.85}>
              <View style={styles.photoCircle}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.photoImage} />
                ) : (
                  <Ionicons name="camera" size={28} color="#6b86f0" />
                )}
              </View>
              <Text style={styles.photoText}>{userPhoto ? 'Trocar foto' : 'Adicionar foto'}</Text>
            </TouchableOpacity>
            {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
          </View>

          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputWrap}>
            <TextInput value={name} onChangeText={setName} placeholder="Seu nome completo" style={styles.input} />
            <View style={styles.inputBottom} />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="********"
              secureTextEntry
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
          {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}

          <Text style={styles.label}>Curso</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            activeOpacity={0.8}
            onPress={() => setCourseModalVisible(true)}
          >
            <Text style={[styles.input, { color: course ? '#222' : '#888' }]}>
              {course || 'Selecione o curso'}
            </Text>
            <View style={styles.inputBottom} />
          </TouchableOpacity>
          {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}

          <Text style={styles.label}>Instituicao</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            activeOpacity={0.8}
            onPress={() => setInstitutionModalVisible(true)}
          >
            <Text style={[styles.input, { color: institution ? '#222' : '#888' }]}>
              {institution || 'Selecione a instituição'}
            </Text>
            <View style={styles.inputBottom} />
          </TouchableOpacity>
          {errors.institution ? <Text style={styles.errorText}>{errors.institution}</Text> : null}

          <Text style={styles.label}>Grau Academico</Text>
          <TouchableOpacity
            style={styles.inputWrap}
            activeOpacity={0.8}
            onPress={() => setDegreeModalVisible(true)}
          >
            <Text style={[styles.input, { color: degree ? '#222' : '#888' }]}>
              {degree || 'Selecione o grau'}
            </Text>
            <View style={styles.inputBottom} />
          </TouchableOpacity>
          {errors.degree ? <Text style={styles.errorText}>{errors.degree}</Text> : null}

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Criando...' : 'Criar Conta'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Curso */}
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
                    setCourse(item);
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

      {/* Modal Instituicao */}
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
                    setInstitution(item);
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

      {/* Modal Grau */}
      <Modal
        visible={degreeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDegreeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o grau académico</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {degreeOptions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalItem}
                  onPress={() => {
                    setDegree(item);
                    setDegreeModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setDegreeModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  top: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 6,
    paddingTop: 6,
  },
  logo: {
    width: 300,
    height: 140,
  },
  form: {
    paddingHorizontal: 28,
  },
  photoWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  photoButton: {
    alignItems: 'center',
  },
  photoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#6b86f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    marginTop: 8,
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    marginBottom: 8,
    color: '#222',
    fontSize: 14,
  },
  inputWrap: {
    backgroundColor: '#f4f6fb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#0b63c6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  inputBottom: {
    height: 6,
    backgroundColor: '#6b86f0',
    borderRadius: 6,
    alignSelf: 'stretch',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#6b86f0',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 8,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 15,
    color: '#222',
  },
  modalClose: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#6b86f0',
    borderRadius: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
