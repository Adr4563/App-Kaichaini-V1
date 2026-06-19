import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { s, C } from '../../styles/screens/LoginScreen.styles';

export default function LoginScreen({ navigation }) {
  const { login, expiredMessage, setExpiredMessage } = useAuth();
  const [correo,          setCorreo]          = useState('');
  const [contrasena,      setContrasena]      = useState('');
  const [cargando,        setCargando]        = useState(false);
  const [error,           setError]           = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { correo: correo.trim(), contrasena });
      await login(data.data);
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.logoBox}>
          <Text style={s.logoText}>K</Text>
        </View>

        <Text style={s.title}>Hola de nuevo</Text>
        <Text style={s.subtitle}>Ingresa para seguir aprendiendo</Text>

        <View style={s.formGroup}>
          <Text style={s.label}>Correo</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {correoValido && <Text style={s.checkIcon}>✓</Text>}
          </View>
        </View>

        <View style={s.formGroup}>
          <Text style={s.label}>Contraseña</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!mostrarPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setMostrarPassword(v => !v)}
              style={{ position: 'absolute', right: 14 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name={mostrarPassword ? 'eye-off' : 'eye'} size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {expiredMessage ? (
          <View style={s.expiredBox}>
            <Text style={s.expiredText}>{expiredMessage}</Text>
          </View>
        ) : null}

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.btnPrimary, cargando && s.btnDisabled]}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.btnPrimaryText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => navigation.navigate('ClassCode')}
        >
          <Text style={s.btnSecondaryText}>Crear cuenta con código</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
