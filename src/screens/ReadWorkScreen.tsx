import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = {
  allowDownload?: boolean;
};

const ReadWorkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route?.params as RouteParams) || {};
  const [isFavorite, setIsFavorite] = useState(false);
  const canDownload = params.allowDownload !== false;

  const handleDownload = () => {
    // Aqui pode adicionar a lógica para baixar o PDF
    console.log('Baixar PDF');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/tesebook.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chat')}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons name="chatbubbles-outline" size={28} color="#6b86f0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFavorite}
            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? '#ff0000' : '#111'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Content Area */}
      <View style={styles.pdfContainer}>
        <Text style={styles.pdfText}>Arquivo PDF</Text>
        {/* Aqui pode adicionar um visualizador de PDF real */}
      </View>

      {/* Download Button */}
      <TouchableOpacity
        style={[
          styles.downloadButton,
          !canDownload && styles.downloadButtonDisabled,
        ]}
        onPress={canDownload ? handleDownload : undefined}
        activeOpacity={canDownload ? 0.85 : 1}
        disabled={!canDownload}
      >
        <Text
          style={[
            styles.downloadButtonText,
            !canDownload && styles.downloadButtonTextDisabled,
          ]}
        >
          BAIXAR
        </Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ReadWork')}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ChatList')}
        >
          <View style={styles.messageBadge}>
            <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>9</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
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
    marginRight: 8,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    margin: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  downloadButton: {
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 28,
    backgroundColor: '#6b86f0',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b86f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  downloadButtonDisabled: {
    backgroundColor: '#c7d0f8',
  },
  downloadButtonTextDisabled: {
    color: '#eaeaea',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#6b86f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  navItem: {
    padding: 8,
  },
  messageBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ReadWorkScreen;

