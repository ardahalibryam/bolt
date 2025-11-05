import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  MontserratAlternates_400Regular,
  MontserratAlternates_700Bold,
} from '@expo-google-fonts/montserrat-alternates';
import {
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Figma asset URLs for indicators (Group3 - all three dots filled)
const imgGroup3 = 'https://www.figma.com/api/mcp/asset/1b811af9-bbbc-4cb8-9e6e-8cecb55cfa20';
const imgIllustration = 'https://www.figma.com/api/mcp/asset/e6ae0bf6-0322-4c53-9db0-6f43d8f2872d';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export default function OnboardingScreen3() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    MontserratAlternates_400Regular,
    MontserratAlternates_700Bold,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleRegistration = () => {
    router.push('/register' as any);
  };

  const handleLogin = () => {
    router.push('/login' as any);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Background */}
      <View style={[styles.gradientContainer, { transform: [{ rotate: '270deg' }] }]}>
        <Image
          source={require('@/assets/images/gradient-bg-3.png')}
          style={styles.gradientBg}
          contentFit="cover"
        />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="cover"
        />
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={{ uri: imgIllustration }}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          <Text style={styles.textBold}>Генерирай обява </Text>
          <Text style={styles.textRegular}>с помощта на Изкуствен интелект.</Text>
        </Text>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorsContainer}>
        <Image
          source={{ uri: imgGroup3 }}
          style={styles.indicators}
          contentFit="contain"
        />
      </View>

      {/* Registration Button */}
      <TouchableOpacity
        style={styles.registrationButton}
        onPress={handleRegistration}
        activeOpacity={0.8}
      >
        <Text style={styles.registrationButtonText}>Регистрация</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>Вход</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    width: '100%',
    height: '100%',
  },
  gradientContainer: {
    position: 'absolute',
    width: height, // Swapped dimensions for rotated gradient
    height: width,  // Swapped dimensions
    left: 7,
    top: 207,
    overflow: 'hidden',
  },
  gradientBg: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  logoContainer: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 20,
    overflow: 'hidden',
    top: 49,
    left: '50%',
    marginLeft: -37.5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  illustrationContainer: {
    position: 'absolute',
    width: 155,
    height: 164,
    top: 246,
    left: '50%',
    marginLeft: -77.5,
    overflow: 'hidden',
  },
  illustration: {
    width: '178.37%',
    height: '168.57%',
    left: '-41.04%',
    top: '-28.97%',
  },
  textContainer: {
    position: 'absolute',
    width: 324,
    top: 538,
    left: '50%',
    marginLeft: -162,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 30,
    color: '#f2f2f2',
    textAlign: 'center',
    lineHeight: 36,
  },
  textBold: {
    fontFamily: 'MontserratAlternates_700Bold',
    fontWeight: '700',
  },
  textRegular: {
    fontFamily: 'MontserratAlternates_400Regular',
  },
  indicatorsContainer: {
    position: 'absolute',
    left: 164,
    top: 787,
    alignItems: 'center',
  },
  indicators: {
    width: 65,
    height: 15,
  },
  registrationButton: {
    position: 'absolute',
    bottom: 164,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 48,
    backgroundColor: '#1374f6',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  registrationButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  loginButton: {
    position: 'absolute',
    bottom: 103,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 48,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#1374f6',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1374f6',
    textAlign: 'center',
  },
});

