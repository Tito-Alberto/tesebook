import React, { useState } from 'react';
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

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
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
      await supabase.from('profiles').upsert({
        id: userId,
        name,
        course,
        institution,
        academic_degree: degree,
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
          <View style={styles.inputWrap}>
            <TextInput
              value={course}
              onChangeText={setCourse}
              placeholder="Seu curso"
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
          {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}

          <Text style={styles.label}>Instituicao</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={institution}
              onChangeText={setInstitution}
              placeholder="Nome da instituicao"
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
          {errors.institution ? <Text style={styles.errorText}>{errors.institution}</Text> : null}

          <Text style={styles.label}>Grau Academico</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={degree}
              onChangeText={setDegree}
              placeholder="Ex: Licenciatura"
              style={styles.input}
            />
            <View style={styles.inputBottom} />
          </View>
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
});

export default RegisterScreen;
