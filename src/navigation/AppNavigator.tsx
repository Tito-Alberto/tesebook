import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabsScreen from '../screens/MainTabsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AddTopicScreen from '../screens/AddTopicScreen';
import AddWorkScreen from '../screens/AddWorkScreen';
import ReadWorkScreen from '../screens/ReadWorkScreen';
import ChatScreen from '../screens/ChatScreen';

// Stack principal de navegacao
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* // Rotas principais do app */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        {/* // Autenticacao */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* // Abas principais */}
        <Stack.Screen name="MainTabs" component={MainTabsScreen} />
        {/* // Telas do usuario */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        {/* // Conteudos e leitura */}
        <Stack.Screen
          name="AddTopic"
          component={AddTopicScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen
          name="AddWork"
          component={AddWorkScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen
          name="ReadWork"
          component={ReadWorkScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
        {/* // Conversas */}
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
