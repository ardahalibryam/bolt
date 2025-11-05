import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  MontserratAlternates_600SemiBold,
} from '@expo-google-fonts/montserrat-alternates';
import {
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Figma asset URLs
const imgLogo = 'https://www.figma.com/api/mcp/asset/6f5c3314-f457-4823-bf0d-ff7f559013f5';

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export default function WelcomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    MontserratAlternates_600SemiBold,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleContinue = () => {
    // Navigate to onboarding screens
    router.push('/onboarding' as any);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/welcome-bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar style="light" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: imgLogo }}
          style={styles.logo}
          contentFit="cover"
        />
      </View>

      {/* Main text */}
      <Text style={styles.mainText}>
        Снимай.{'\n'}Оцени.{'\n'}Продай.
      </Text>

      {/* Continue button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Продължи</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 20,
    overflow: 'hidden',
    top: 237,
    left: '50%',
    marginLeft: -37.5, // Half of width to center
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  mainText: {
    position: 'absolute',
    top: 312,
    left: '50%',
    marginLeft: -164, // Half of width (328/2) to center
    width: 328,
    fontFamily: 'MontserratAlternates_600SemiBold',
    fontSize: 60,
    color: '#f2f2f2',
    textAlign: 'center',
    lineHeight: 72,
  },
  button: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -164, // Half of width (328/2) to center
    width: 328,
    height: 50,
    backgroundColor: '#1772ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b3b3b3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#f2f2f2',
  },
});

