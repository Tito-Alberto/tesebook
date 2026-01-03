import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

type Props = {
  onFinish?: () => void;
  duration?: number;
  fonts?: { [name: string]: any };
  assets?: any[];
};

const SplashScreen: React.FC<Props> = ({ onFinish, duration = 1200, fonts, assets = [] }) => {
  const [ready, setReady] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    let mounted = true;

    async function loadResources() {
      try {
        const imageAssets = [require('../../assets/tesebook.png'), ...assets];
        await Asset.loadAsync(imageAssets);
        if (fonts && Object.keys(fonts).length) {
          await Font.loadAsync(fonts);
        }
      } catch (e) {
        // ignore load errors but continue
      } finally {
        if (mounted) setReady(true);
      }
    }

    loadResources();

    return () => {
      mounted = false;
    };
  }, [assets, fonts]);

  useEffect(() => {
    if (!ready) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      Animated.delay(duration),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 420, useNativeDriver: true }),
      ]),
    ]).start(() => onFinish && onFinish());
  }, [ready, duration, onFinish, opacity, scale]);

  const windowWidth = Dimensions.get('window').width;
  // Increase logo size: use a larger fraction of the screen and a slightly taller aspect
  const logoWidth = Math.min(760, windowWidth * 0.9);
  const logoHeight = Math.round(logoWidth * 0.45);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/tesebook.png')}
          style={[styles.image, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
        {!ready && <ActivityIndicator style={styles.indicator} size="small" color="#0b63c6" />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // dynamic width/height applied inline
  },
  indicator: {
    marginTop: 18,
  },
});

export default SplashScreen;
