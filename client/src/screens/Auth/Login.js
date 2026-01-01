import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../constant/colors';
import SCREENS from '../index';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../../services/AuthService';

const Login = () => {
  const navigation = useNavigation();
  const { login, loginWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await login({
      email: email.trim(),
      password: password,
    });

    if (!result.success) {
      // Error đã được hiển thị trong AuthContext
      console.log('Login failed:', result.message);
    }
    // Success case được handle trong AuthContext và navigation sẽ tự động chuyển
  };

  const handleSignUp = () => {
    navigation.navigate(SCREENS.SIGNUP);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // Lấy OAuth URL từ backend
      const oauthUrl = await AuthService.getGoogleOAuthUrl();
      
      // Mở URL trong browser
      const supported = await Linking.canOpenURL(oauthUrl);
      if (supported) {
        await Linking.openURL(oauthUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể mở trình duyệt');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể đăng nhập bằng Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: null }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: null }));
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color={COLORS.GRAY} 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, authLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color={COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Hoặc</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity 
          style={[styles.googleButton, googleLoading && styles.disabledButton]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || authLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={COLORS.BLACK} size="small" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={COLORS.BLACK} />
              <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  inputError: {
    borderColor: COLORS.RED,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    color: COLORS.RED,
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    fontSize: 16,
    color: COLORS.GRAY,
  },
  signupLink: {
    fontSize: 16,
    color: COLORS.BLUE,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    gap: 10,
  },
  googleButtonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Login;