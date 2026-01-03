import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Dados de exemplo do usuário
  const userData = {
    name: 'Nome do usuário',
    course: 'Curso',
    institution: 'Nome da instituição',
    academicDegree: 'Grau academico',
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
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
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={80} color="#666" />
          </View>
        </View>

        {/* Username */}
        <Text style={styles.username}>{userData.name}</Text>

        {/* Academic Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Curso</Text>
          <Text style={styles.detailValue}>{userData.course}</Text>

          <Text style={styles.detailLabel}>Nome da instituição</Text>
          <Text style={styles.detailValue}>{userData.institution}</Text>

          <Text style={styles.detailLabel}>Grau academico</Text>
          <Text style={styles.detailValue}>{userData.academicDegree}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.primaryButtonText}>Editar o perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddTopic')}
          >
            <Text style={styles.secondaryButtonText}>Sugerir Temas</Text>
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
    marginBottom: 24,
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
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 32,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  detailValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#6b86f0',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6b86f0',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6b86f0',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProfileScreen;
