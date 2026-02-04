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
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../styles';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';

// Helpers para normalizar e validar email
const normalizeEmail = (raw: string) => {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return '';
  if (!trimmed.includes('@')) return `${trimmed}@tesebook.com`;
  const [local, domain] = trimmed.split('@');
  if (!local) return '';
  if (!domain) return `${local}@tesebook.com`;
  return trimmed;
};
const isValidEmail = (raw: string) => {
  const normalized = normalizeEmail(raw);
  if (!normalized) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const EMAIL_NOT_CONFIRMED_REGEX = /email\s+not\s+confirmed/i;

const LoginScreen: React.FC = () => {
  // Estado do formulario e feedbacks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigation = useNavigation<any>();

  // Login com validacao e checagem de perfil
  const handleLogin = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Insira o email.');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email invalido.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Insira a senha.');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;

    setAuthError('');
    setResendEmail('');
    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      if (!isValidEmail(email) || !password) {
        setAuthError('Informe email e senha.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
      if (!data.user) {
        setAuthError('Usuario nao encontrado.');
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      if (profileError || !profile) {
        await supabase.auth.signOut();
        setAuthError('Conta sem perfil. Finalize o cadastro primeiro.');
        setLoading(false);
        return;
      }
      navigation.navigate('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      if (EMAIL_NOT_CONFIRMED_REGEX.test(err?.message || '')) {
        setAuthError('Email nao confirmado. Verifique sua caixa de entrada.');
        setResendEmail(normalizeEmail(email));
      } else {
        setAuthError(err?.message || 'Erro ao entrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reenvio de confirmacao de email
  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
      });
      if (error) throw error;
      setAuthError('Email de confirmacao reenviado.');
    } catch (err: any) {
      setAuthError(err?.message || 'Erro ao reenviar confirmacao.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, { flex: 1 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
        {/* Loading bloqueante */}
        {loading ? (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#6b86f0" />
            </View>
          </View>
        ) : null}
        {/* Logo */}
        <View style={styles.top}>
          <Image source={require('../../assets/tesebook.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Formulario de login */}
        <View style={styles.form}>
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
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
          {resendEmail ? (
            <TouchableOpacity
              style={[styles.resendButton, resendLoading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleResend}
              disabled={resendLoading}
            >
              <Text style={styles.resendButtonText}>
                {resendLoading ? 'Reenviando...' : 'Reenviar confirmacao'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Acao principal */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>

          {/* Link de recuperacao */}
          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Esqueceu sua senha ?</Text>
          </TouchableOpacity>
        </View>

        {/* Acesso ao cadastro */}
        <View style={styles.bottom} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.outlineButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.outlineButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingVertical: 20,
    paddingBottom: 180,
  },
  top: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8,
    paddingTop: 6,
  },
  logo: {
    width: 340,
    height: 160,
  },
  backButton: {},
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
    marginTop: 6,
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  forgot: {
    marginTop: 12,
    alignItems: 'center',
  },
  forgotText: {
    color: '#222',
    opacity: 0.8,
  },
  bottom: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 24,
    alignItems: 'center',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#6b86f0',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  outlineButtonText: {
    color: '#1f3aa6',
    fontWeight: '700',
  },
  resendButton: {
    marginTop: 6,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#1f3aa6',
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingCard: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default LoginScreen;
