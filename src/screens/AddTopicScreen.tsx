import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles';

const AddTopicScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [courseModalVisible, setCourseModalVisible] = useState(false);

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

  const handleAdd = () => {
    // Aqui pode adicionar a lógica para salvar o tema
    // Por enquanto, apenas volta para a tela anterior
    if (topic.trim() && course.trim() && description.trim()) {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
        {/* Form Fields */}
        <View style={styles.formContainer}>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Curso</Text>
            <TouchableOpacity
              style={styles.inputTouchable}
              onPress={() => setCourseModalVisible(true)}
            >
              <Text style={[styles.input, { color: course ? '#222' : '#999' }]}>
                {course || 'Selecione o curso'}
              </Text>
            </TouchableOpacity>
            <View style={styles.inputLine} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Discrição</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Digite a descrição"
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCourseModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
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
  inputLine: {
    height: 1,
    backgroundColor: '#6b86f0',
    marginTop: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#222',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 150,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  inputTouchable: {
    paddingVertical: 8,
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

export default AddTopicScreen;
