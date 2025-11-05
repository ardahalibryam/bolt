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

// Figma asset URLs
const imgIllustration = 'https://www.figma.com/api/mcp/asset/bb0ad74f-a822-4118-a347-d74e02745390';
const imgEllipse1 = 'https://www.figma.com/api/mcp/asset/4dd50fd4-de3d-48f4-adc1-51b90791cb75';
const imgEllipse2 = 'https://www.figma.com/api/mcp/asset/cd284eeb-f226-4589-94c8-a6e438d9a22e';
const imgEllipse3 = 'https://www.figma.com/api/mcp/asset/08a3c763-32d1-4496-96b6-da08b4063219';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export default function OnboardingScreen() {
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
    router.push('/onboarding/2' as any);
  };

  const handleNext = () => {
    // Navigate to next onboarding screen
    router.push('/onboarding/2' as any);
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
          source={require('@/assets/images/gradient-bg-1.png')}
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
          <Text style={styles.textBold}>Снимай предмета,</Text>
          <Text style={styles.textRegular}> който искаш да продадеш.</Text>
        </Text>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorsContainer}>
        <Image
          source={{ uri: imgEllipse1 }}
          style={styles.indicator}
          contentFit="contain"
        />
        <TouchableOpacity onPress={handleNext} style={styles.indicatorTouchable}>
          <Image
            source={{ uri: imgEllipse2 }}
            style={styles.indicator}
            contentFit="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.indicatorTouchable}>
          <Image
            source={{ uri: imgEllipse3 }}
            style={styles.indicator}
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
    width: height, // Swapped dimensions
    height: width,  // Swapped dimensions
    left: 0,
    top: 0,
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
  illustrationContainer: {
    position: 'absolute',
    width: 230,
    height: 199,
    top: 262,
    left: '50%',
    marginLeft: -115,
    overflow: 'hidden',
  },
  illustration: {
    width: '185%',
    height: '213%',
    left: '-58%',
    top: '-90%',
  },
  textContainer: {
    position: 'absolute',
    width: 324,
    top: 591,
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
  indicatorTouchable: {
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

