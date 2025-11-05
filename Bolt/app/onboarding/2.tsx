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

// Figma asset URLs for indicators
const imgEllipse1 = 'https://www.figma.com/api/mcp/asset/49182204-91b7-4a97-b63c-6ef53428e70f';
const imgEllipse2 = 'https://www.figma.com/api/mcp/asset/2bb0496a-baed-4024-bcb0-1eb59bee38ed';
const imgEllipse3 = 'https://www.figma.com/api/mcp/asset/7525779c-a661-4e2a-812f-e288136a54bb';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export default function OnboardingScreen2() {
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

  const handleSkip = () => {
    // Navigate to next onboarding or login
    router.push('/onboarding/3' as any);
  };

  const handleNext = () => {
    // Navigate to next onboarding screen
    router.push('/onboarding/3' as any);
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
          source={require('@/assets/images/gradient-bg-2.png')}
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

      {/* Rocket Illustration */}
      <View style={styles.rocketContainer}>
        <Image
          source={require('@/assets/images/rocket.png')}
          style={styles.rocket}
          contentFit="contain"
        />
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          <Text style={styles.textRegular}>Виж каква е</Text>
          <Text style={styles.textBold}> актуалната цена</Text>
          <Text style={styles.textRegular}> на предмета!</Text>
        </Text>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorsContainer}>
        <TouchableOpacity onPress={() => router.push('/onboarding/1' as any)}>
          <Image
            source={{ uri: imgEllipse1 }}
            style={styles.indicator}
            contentFit="contain"
          />
        </TouchableOpacity>
        <Image
          source={{ uri: imgEllipse2 }}
          style={[styles.indicator, styles.indicatorSpacing]}
          contentFit="contain"
        />
        <TouchableOpacity onPress={handleNext}>
          <Image
            source={{ uri: imgEllipse3 }}
            style={[styles.indicator, styles.indicatorSpacing]}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>Пропусни</Text>
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
    left: -25,
    top: 381,
    overflow: 'hidden',
  },
  gradientBg: {
    width: '100%',
    height: '100%',
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
  rocketContainer: {
    position: 'absolute',
    width: 141,
    height: 268,
    top: 218,
    left: '50%',
    marginLeft: -70.5,
    overflow: 'hidden',
  },
  rocket: {
    width: '255.37%',
    height: '134.35%',
    left: '-81.82%',
    top: '-9.57%',
  },
  textContainer: {
    position: 'absolute',
    width: 324,
    top: 599,
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
    flexDirection: 'row',
    left: 164,
    top: 787,
    alignItems: 'center',
  },
  indicator: {
    width: 15,
    height: 15,
  },
  indicatorSpacing: {
    marginLeft: 10,
  },
  skipButton: {
    position: 'absolute',
    bottom: 69,
    right: 24,
  },
  skipButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1374f6',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
});

