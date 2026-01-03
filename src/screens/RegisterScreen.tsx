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
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { globalStyles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen: React.FC = () => {
                  const [userPhoto, setUserPhoto] = useState<string | null>(null);
                  const [photoError, setPhotoError] = useState('');

                  const pickUserPhoto = async () => {
                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permissionResult.granted) {
                      setPhotoError('Permissão para acessar fotos negada.');
                      return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 1,
                    });
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                      setUserPhoto(result.assets[0].uri);
                      setPhotoError('');
                    }
                  };
            const [academicDegree, setAcademicDegree] = useState('');
            const [academicDegreeError, setAcademicDegreeError] = useState('');
            const [academicDegreeModalVisible, setAcademicDegreeModalVisible] = useState(false);
            const academicDegreeOptions = [
              'Licenciatura',
              'Mestrado',
              'Pós-Graduação'
            ];
      const navigation = useNavigation();
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [confirm, setConfirm] = useState('');
      const [institution, setInstitution] = useState('');
      const [course, setCourse] = useState('');
      const [nameError, setNameError] = useState('');
      const [emailError, setEmailError] = useState('');
      const [passwordError, setPasswordError] = useState('');
      const [confirmError, setConfirmError] = useState('');
      const [institutionError, setInstitutionError] = useState('');
      const [courseError, setCourseError] = useState('');
      const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
      const [courseModalVisible, setCourseModalVisible] = useState(false);
      
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
        'UNIVERSIDADE LUSÍADA DE ANGOLA (ULA)'
      ];

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
        'ENGENHARIA DE PRODUÇÃO'
      ];
      
      const goToLogin = () => {
        navigation.navigate('Login' as never);
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
                  onPress={goToLogin}
                  hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
                  accessibilityLabel="Voltar para o login"
                >
                  <Ionicons name="arrow-back" size={36} color="#111" />
                </TouchableOpacity>
                <Image source={require('../../assets/tesebook.png')} style={styles.logo} resizeMode="contain" />
              </View>

              <View style={styles.form}>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <TouchableOpacity onPress={pickUserPhoto} style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      borderWidth: 2,
                      borderColor: '#222',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      overflow: 'hidden',
                    }}>
                      {userPhoto ? (
                        <Image source={{ uri: userPhoto }} style={{ width: 90, height: 90 }} />
                      ) : (
                        <Image source={require('../../assets/user.png')} style={{ width: 50, height: 50 }} />
                      )}
                    </View>
                    <Text style={{ color: '#222', marginTop: 8 }}>Adicionar Foto</Text>
                  </TouchableOpacity>
                  {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
                </View>
                <Text style={styles.label}>Nome Completo</Text>
                <View style={styles.inputWrap}>
                  <TextInput value={name} onChangeText={setName} placeholder="Seu nome completo" style={styles.input} />
                  <View style={styles.inputBottom} />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                <View style={styles.inputWrap}>
                  <TextInput value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                  <View style={styles.inputBottom} />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrap}>
                  <TextInput value={password} onChangeText={setPassword} placeholder="********" secureTextEntry style={styles.input} />
                  <View style={styles.inputBottom} />
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.inputWrap}>
                  <TextInput value={confirm} onChangeText={setConfirm} placeholder="********" secureTextEntry style={styles.input} />
                  <View style={styles.inputBottom} />
                </View>
                {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

                <Text style={styles.label}>Instituição</Text>
                <TouchableOpacity
                  style={styles.inputWrap}
                  onPress={() => setInstitutionModalVisible(true)}
                >
                  <Text style={[styles.input, { color: institution ? '#222' : '#888' }]}> 
                    {institution ? institution : 'Selecione a instituição'}
                  </Text>
                  <View style={styles.inputBottom} />
                </TouchableOpacity>
                <Modal
                  visible={institutionModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setInstitutionModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Escolha a instituição</Text>
                      <FlatList
                        data={institutionOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                              setInstitution(item);
                              setInstitutionModalVisible(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                      <TouchableOpacity style={styles.modalClose} onPress={() => setInstitutionModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                {institutionError ? (
                  <Text style={styles.errorText}>{institutionError}</Text>
                ) : null}

                <Text style={styles.label}>Grau Académico</Text>
                <TouchableOpacity
                  style={styles.inputWrap}
                  activeOpacity={0.8}
                  onPress={() => setAcademicDegreeModalVisible(true)}
                >
                  <Text style={[styles.input, { color: academicDegree ? '#222' : '#888' }]}> 
                    {academicDegree ? academicDegree : 'Selecione o grau académico'}
                  </Text>
                  <View style={styles.inputBottom} />
                </TouchableOpacity>
                <Modal
                  visible={academicDegreeModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setAcademicDegreeModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Escolha o grau académico</Text>
                      <FlatList
                        data={academicDegreeOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                              setAcademicDegree(item);
                              setAcademicDegreeModalVisible(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                      <TouchableOpacity style={styles.modalClose} onPress={() => setAcademicDegreeModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                {academicDegreeError ? (
                  <Text style={styles.errorText}>{academicDegreeError}</Text>
                ) : null}

                <Text style={styles.label}>Curso</Text>
                <TouchableOpacity
                  style={styles.inputWrap}
                  activeOpacity={0.8}
                  onPress={() => setCourseModalVisible(true)}
                >
                  <Text style={[styles.input, { color: course ? '#222' : '#888' }]}> 
                    {course ? course : 'Selecione o curso'}
                  </Text>
                  <View style={styles.inputBottom} />
                </TouchableOpacity>
                <Modal
                  visible={courseModalVisible}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setCourseModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Escolha o curso</Text>
                      <FlatList
                        data={courseOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                              setCourse(item);
                              setCourseModalVisible(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                      />
                      <TouchableOpacity style={styles.modalClose} onPress={() => setCourseModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                {courseError ? <Text style={styles.errorText}>{courseError}</Text> : null}

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    let valid = true;
                    if (!name.trim()) {
                      setNameError('Digite seu nome completo.');
                      valid = false;
                    } else {
                      setNameError('');
                    }
                    if (!email.trim()) {
                      setEmailError('Digite seu email.');
                      valid = false;
                    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                      setEmailError('Email inválido.');
                      valid = false;
                    } else {
                      setEmailError('');
                    }
                    if (!password) {
                      setPasswordError('Digite uma senha.');
                      valid = false;
                    } else if (password.length < 6) {
                      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
                      valid = false;
                    } else {
                      setPasswordError('');
                    }
                    if (!confirm) {
                      setConfirmError('Confirme sua senha.');
                      valid = false;
                    } else if (confirm !== password) {
                      setConfirmError('As senhas não coincidem.');
                      valid = false;
                    } else {
                      setConfirmError('');
                    }
                    if (!institution) {
                      setInstitutionError('Selecione uma instituição.');
                      valid = false;
                    } else {
                      setInstitutionError('');
                    }
                    if (!course) {
                      setCourseError('Selecione um curso.');
                      valid = false;
                    } else {
                      setCourseError('');
                    }
                    if (!valid) return;
                    navigation.navigate('Login' as never);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Criar Conta</Text>
                </TouchableOpacity>
                {institutionError ? (
                  <Text style={styles.errorText}>{institutionError}</Text>
                ) : null}

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        );
};

const styles = StyleSheet.create({
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
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
    errorText: {
      color: '#d32f2f',
      fontSize: 13,
      marginTop: 4,
      marginBottom: 8,
      textAlign: 'center',
    },
  pickerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
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
    // match login button: full width within horizontal padding
    alignSelf: 'stretch',
    marginHorizontal: 28,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  // footer removed; button is now part of the scrollable content
  backButton: {
    position: 'absolute',
    left: 12,
    top: 8,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: '#111',
  },
});

export default RegisterScreen;
