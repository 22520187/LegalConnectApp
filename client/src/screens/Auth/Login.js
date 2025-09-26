import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../constant/colors';
import SCREENS from '../index';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('user@gmail.com');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Tài khoản user thông thường
      if (email === 'user@gmail.com' && password === 'user123') {
        const userData = {
          id: 1,
          name: 'Nguyễn Văn An',
          email: email,
          role: 'user',
        };
        login(userData);
      }
      // Tài khoản admin
      else if (email === 'admin@gmail.com' && password === 'Admin123') {
        const userData = {
          id: 2,
          name: 'Quản Trị Viên',
          email: email,
          role: 'admin',
        };
        login(userData);
      } else {
        Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
      }
      setLoading(false);
    }, 1000);
  };

  const handleSignUp = () => {
    navigation.navigate(SCREENS.SIGNUP);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'Chức năng đăng nhập bằng Google sẽ được phát triển sau');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng bạn trở lại Legal Connect</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleSignUp}
        >
          <Text style={styles.signupButtonText}>Đăng ký tài khoản mới</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.demoText}>
        Demo User: demo@example.com / 123456{'\n'}
        Demo Admin: admin@example.com / admin123
      </Text>

      <View style={styles.socialLogin}>
        <Text style={styles.orText}>
          Hoặc đăng nhập bằng
        </Text>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  loginButton: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BLUE,
  },
  signupButtonText: {
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    fontSize: 12,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  socialLogin: {
    alignItems: 'center',
  },
  orText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    width: '100%',
    justifyContent: 'center',
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default Login;