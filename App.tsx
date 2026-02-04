import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AppProps } from './src/interfaces';
import { globalStyles } from './src/styles';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App({ title = 'Bem-vindo' }: AppProps) {
  // Controla exibicao do splash
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    // Splash inicial
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    // Container principal do app
    <View style={[globalStyles.container, { flex: 1 }]}> 
      <StatusBar style="auto" />
      <AppNavigator />
    </View>
  );
}
