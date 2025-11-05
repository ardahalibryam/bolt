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
  Inter_400Regular,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Figma asset URLs
const imgLine1 = 'https://www.figma.com/api/mcp/asset/7b922e1a-9e2a-42a1-8037-9003974dea6c';
const imgLine2 = 'https://www.figma.com/api/mcp/asset/46eb403e-2dcf-4f37-905f-77ab7111bc30';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

export default function RegisterScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    MontserratAlternates_400Regular,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleLogin = () => {
    router.push('/login' as any);
  };

  const handleRegister = () => {
    // Handle registration logic
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Регистрация</Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.headerLink}>Вход</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Име"
        placeholderTextColor="#4d4d4d"
        value={name}
        onChangeText={setName}
      />
      
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

      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setNewsletter(!newsletter)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, newsletter && styles.checkboxChecked]}>
          {newsletter && <View style={styles.checkboxInner} />}
        </View>
        <Text style={styles.checkboxText}>
          Абонирай се за бюлетин и получавай най-актуалните цени!
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        activeOpacity={0.8}
      >
        <Text style={styles.registerButtonText}>Регистрирай се</Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotPassword}>
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
    paddingHorizontal: 16,
  },
  header: {
    height: 36,
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  headerTitle: {
    position: 'absolute',
    left: '50%',
    marginLeft: -75,
    fontFamily: 'MontserratAlternates_400Regular',
    fontSize: 30,
    color: '#f2f2f2',
    textAlign: 'center',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginLeft: 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#f6f6f6',
    marginRight: 8,
    marginTop: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1374f6',
    borderColor: '#1374f6',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  checkboxText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#bfbfbf',
    lineHeight: 20,
  },
  registerButton: {
    height: 48,
    backgroundColor: '#1374f6',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  registerButtonText: {
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

