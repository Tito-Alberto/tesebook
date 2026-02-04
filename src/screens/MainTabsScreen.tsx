import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import FavoritesScreen from './FavoritesScreen';
import SearchScreen from './SearchScreen';
import ReadLibraryScreen from './ReadLibraryScreen';
import ChatListScreen from './ChatListScreen';
import { supabase } from '../lib/supabaseClient';

const Tab = createBottomTabNavigator();

const MainTabsScreen: React.FC = () => {
  const [chatBadgeCount, setChatBadgeCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    let channel: any = null;
    let authSubscription: any = null;

    const fetchUnreadCount = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserId = user?.id || null;
        if (!currentUserId) {
          if (isActive) setChatBadgeCount(0);
          return;
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('sender_id,created_at')
          .eq('receiver_id', currentUserId);
        if (messagesError) throw messagesError;

        const senderIds = Array.from(
          new Set((messagesData || []).map((msg: any) => msg.sender_id).filter(Boolean)),
        );

        if (senderIds.length === 0) {
          if (isActive) setChatBadgeCount(0);
          return;
        }

        const { data: readsData, error: readsError } = await supabase
          .from('chat_reads')
          .select('other_user_id,last_read_at')
          .eq('user_id', currentUserId)
          .in('other_user_id', senderIds);
        if (readsError) throw readsError;

        const lastReadMap = new Map<string, number>();
        (readsData || []).forEach((read: any) => {
          const ms = read.last_read_at ? new Date(read.last_read_at).getTime() : 0;
          lastReadMap.set(read.other_user_id, Number.isNaN(ms) ? 0 : ms);
        });

        let totalUnread = 0;
        (messagesData || []).forEach((msg: any) => {
          const senderId = msg.sender_id;
          if (!senderId) return;
          const msgTime = new Date(msg.created_at).getTime();
          if (Number.isNaN(msgTime)) return;
          const lastReadMs = lastReadMap.get(senderId) ?? 0;
          if (msgTime > lastReadMs) totalUnread += 1;
        });

        if (isActive) setChatBadgeCount(totalUnread);
      } catch {
        if (isActive) setChatBadgeCount(0);
      }
    };

    const setupChannel = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserId = user?.id || null;
      if (!currentUserId) return;
      if (channel) return;

      channel = supabase
        .channel(`chat-badge-${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUserId}`,
          },
          () => {
            fetchUnreadCount();
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_reads',
            filter: `user_id=eq.${currentUserId}`,
          },
          () => {
            fetchUnreadCount();
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_reads',
            filter: `user_id=eq.${currentUserId}`,
          },
          () => {
            fetchUnreadCount();
          },
        )
        .subscribe();
    };

    const refresh = async () => {
      await fetchUnreadCount();
      await setupChannel();
    };

    refresh();
    authSubscription = supabase.auth.onAuthStateChange(() => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      refresh();
    });

    return () => {
      isActive = false;
      if (channel) supabase.removeChannel(channel);
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

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
                  <Text style={styles.badgeText}>
                    {chatBadgeCount > 99 ? '99+' : chatBadgeCount}
                  </Text>
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
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6b86f0',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default MainTabsScreen;
