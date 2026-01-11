import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { resolveStorageUrl } from '../lib/supabaseStorage';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setError('Faca login para ver o perfil.');
          setLoading(false);
          return;
        }
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(data);
        setError('');
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar perfil.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    let active = true;
    const resolveAvatar = async () => {
      if (!profile?.photo_url) {
        if (active) setAvatarUrl(null);
        return;
      }
      const resolvedUrl = await resolveStorageUrl(profile.photo_url);
      if (active) setAvatarUrl(resolvedUrl);
    };
    resolveAvatar();
    return () => {
      active = false;
    };
  }, [profile]);

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
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={80} color="#666" />
            )}
          </View>
        </View>

        <Text style={styles.username}>
          {loading ? 'Carregando...' : profile?.name || 'Usuario'}
        </Text>

        {error ? <Text style={[styles.detailValue, { color: '#d32f2f', textAlign: 'center' }]}>{error}</Text> : null}

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Curso</Text>
          <Text style={styles.detailValue}>{profile?.course || '-'}</Text>

          <Text style={styles.detailLabel}>Nome da instituicao</Text>
          <Text style={styles.detailValue}>{profile?.institution || '-'}</Text>

          <Text style={styles.detailLabel}>Grau academico</Text>
          <Text style={styles.detailValue}>{profile?.academic_degree || '-'}</Text>
        </View>

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

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={async () => {
              await supabase.auth.signOut();
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.logoutButtonText}>Terminar sessão</Text>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    paddingVertical: 6,
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
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6b86f0',
    paddingVertical: 6,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6b86f0',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e53935',
    paddingVertical: 6,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 72,
  },
  logoutButtonText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ProfileScreen;
