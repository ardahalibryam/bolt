import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  MontserratAlternates_400Regular,
} from '@expo-google-fonts/montserrat-alternates';
import {
  Inter_600SemiBold,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

export default function LoginScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    MontserratAlternates_400Regular,
    Inter_600SemiBold,
    Inter_500Medium,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleRegister = () => {
    router.push('/register' as any);
  };

  const handleLogin = () => {
    // Handle login logic
    router.push('/(tabs)' as any);
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
  };

  const handleAppleSignIn = () => {
    // Handle Apple sign in
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="cover"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Вход</Text>
        <TouchableOpacity onPress={handleRegister} style={styles.headerLinkContainer}>
          <Text style={styles.headerLink}>Регистрация</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Имейл"
        placeholderTextColor="#4d4d4d"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Парола"
          placeholderTextColor="#4d4d4d"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showPassword}>Покажи</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>Влез</Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Забравена парола</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ИЛИ</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={handleGoogleSignIn}
        activeOpacity={0.8}
      >
        <View style={styles.socialButtonContent}>
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialButtonText}>Продължи с Google</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={handleAppleSignIn}
        activeOpacity={0.8}
      >
        <View style={styles.socialButtonContent}>
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialButtonText}>Продължи с Apple</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    paddingHorizontal: 18,
  },
  logoContainer: {
    width: 75,
    height: 75,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 125,
    alignSelf: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  header: {
    height: 36,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'MontserratAlternates_400Regular',
    fontSize: 30,
    color: '#f2f2f2',
    textAlign: 'center',
  },
  headerLinkContainer: {
    position: 'absolute',
    right: -4,
    top: 9,
  },
  headerLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#416fe1',
    textAlign: 'right',
  },
  input: {
    height: 50,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#4d4d4d',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#f2f2f2',
  },
  passwordContainer: {
    height: 50,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#4d4d4d',
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#f2f2f2',
  },
  showPassword: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#bfbfbf',
  },
  loginButton: {
    height: 48,
    backgroundColor: '#1374f6',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1374f6',
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 9,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4d4d4d',
  },
  dividerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#d9d9d9',
    marginHorizontal: 8,
    lineHeight: 24,
  },
  socialButton: {
    height: 51,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#4d4d4d',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 9,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    fontSize: 20,
    textAlign: 'center',
  },
  socialButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#414651',
    lineHeight: 24,
  },
});

