
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [institutionModalVisible, setInstitutionModalVisible] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [degreeModalVisible, setDegreeModalVisible] = useState(false);

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
  const degreeOptions = [
    'Licenciatura',
    'Mestrado',
    'Pós-Graduação',
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar as fotos é necessária!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 24, left: 24, right: 24, bottom: 24 }}
      >
        <Ionicons name="arrow-back" size={28} color="#111" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            {image ? (
              <Image source={{ uri: image }} style={{ width: 140, height: 140, borderRadius: 70 }} />
            ) : (
              <Ionicons name="person" size={80} color="#666" />
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Alterar foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity style={styles.input} onPress={() => setCourseModalVisible(true)}>
              <Text style={{ color: course ? '#222' : '#888' }}>{course || 'Selecione o curso'}</Text>
            </TouchableOpacity>
            <View style={styles.inputLine} />
          </View>
          <Modal visible={courseModalVisible} animationType="slide" transparent onRequestClose={() => setCourseModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Escolha o curso</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {courseOptions.map((item) => (
                    <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setCourse(item); setCourseModalVisible(false); }}>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome da Instituição</Text>
            <TouchableOpacity style={styles.input} onPress={() => setInstitutionModalVisible(true)}>
              <Text style={{ color: institution ? '#222' : '#888' }}>{institution || 'Selecione a instituição'}</Text>
            </TouchableOpacity>
            <View style={styles.inputLine} />
          </View>
          <Modal visible={institutionModalVisible} animationType="slide" transparent onRequestClose={() => setInstitutionModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Escolha a instituição</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {institutionOptions.map((item) => (
                    <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setInstitution(item); setInstitutionModalVisible(false); }}>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Grau Acadêmico</Text>
            <TouchableOpacity style={styles.input} onPress={() => setDegreeModalVisible(true)}>
              <Text style={{ color: academicDegree ? '#222' : '#888' }}>{academicDegree || 'Selecione o grau acadêmico'}</Text>
            </TouchableOpacity>
            <View style={styles.inputLine} />
          </View>
          <Modal visible={degreeModalVisible} animationType="slide" transparent onRequestClose={() => setDegreeModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Escolha o grau acadêmico</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {degreeOptions.map((item) => (
                    <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setAcademicDegree(item); setDegreeModalVisible(false); }}>
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
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  inputLine: {
    height: 1,
    backgroundColor: '#6b86f0',
    marginTop: 8,
    opacity: 0.3,
  },
  confirmButton: {
    width: '100%',
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
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxHeight: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#6b86f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
