import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import SearchScreen from './SearchScreen';
import ReadLibraryScreen from './ReadLibraryScreen';
import ChatListScreen from './ChatListScreen';

const Tab = createBottomTabNavigator();
const chatBadgeCount = 9;

const MainTabsScreen: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#6b86f0',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.65)',
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Favorites') iconName = 'heart-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Read') iconName = 'document-text-outline';
          else if (route.name === 'ChatList') iconName = 'chatbubbles-outline';

          if (route.name !== 'ChatList') {
            return <Ionicons name={iconName} size={size ?? 24} color={color} />;
          }

          return (
            <View style={styles.iconWrapper}>
              <Ionicons name={iconName} size={size ?? 24} color={color} />
              {chatBadgeCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{chatBadgeCount}</Text>
                </View>
              ) : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Read" component={ReadLibraryScreen} />
      <Tab.Screen name="ChatList" component={ChatListScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6b86f0',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MainTabsScreen;
