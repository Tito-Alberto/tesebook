import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type TabKey = 'home' | 'favorites' | 'search' | 'read' | 'chat';

type BottomNavProps = {
  active?: TabKey;
};

const tabs: Array<{
  key: TabKey;
  route: string;
  icon: string;
  activeIcon: string;
}> = [
  { key: 'home', route: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'favorites', route: 'Favorites', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'search', route: 'Search', icon: 'search-outline', activeIcon: 'search' },
  { key: 'read', route: 'ReadWork', icon: 'document-text-outline', activeIcon: 'document-text' },
  { key: 'chat', route: 'ChatList', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
];

const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => navigation.navigate(tab.route)}
            activeOpacity={0.8}
          >
            <Ionicons name={iconName as any} size={24} color="#fff" />
            {tab.key === 'chat' && (
              <View style={styles.badgeWrapper}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>9</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  badgeWrapper: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  badge: {
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

export default BottomNav;
