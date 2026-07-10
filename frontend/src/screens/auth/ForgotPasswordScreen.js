import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';

const C = {
  green: '#1b5e20',
  dark:  '#1a1a1a',
  gray:  '#666',
  white: '#ffffff',
  error: '#c62828',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [correo,       setCorreo]       = useState('');
  const [newPass,      setNewPass]      = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [token,        setToken]        = useState('');
  const [loadEnviar,   setLoadEnviar]   = useState(false);
  const [loadGuardar,  setLoadGuardar]  = useState(false);
  const [errEnviar,    setErrEnviar]    = useState('');
  const [errGuardar,   setErrGuardar]   = useState('');
  const [enlaceEnviado, setEnlaceEnviado] = useState(false);
  const [tokenReset,    setTokenReset]    = useState('');

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  const handleEnviar = async () => {
    if (!correoValido) { setErrEnviar('Ingresa un correo válido'); return; }
    setLoadEnviar(true);
    setErrEnviar('');
    try {
      const { data } = await api.post('/auth/forgot-password', { correo: correo.trim() });
      setTokenReset(data.data?.token || '');
      setEnlaceEnviado(true);
    } catch (e) {
      setErrEnviar(e.response?.data?.error?.message || 'Error al enviar el enlace');
    } finally {
      setLoadEnviar(false);
    }
  };

  const handleGuardar = async () => {
    if (!token.trim())         { setErrGuardar('Pega el token del enlace recibido'); return; }
    if (newPass.length < 8)    { setErrGuardar('Mínimo 8 caracteres'); return; }
    if (newPass !== confirmPass){ setErrGuardar('Las contraseñas no coinciden'); return; }
    setLoadGuardar(true);
    setErrGuardar('');
    try {
      await api.post('/auth/reset-password', {
        token:           token.trim(),
        newPassword:     newPass,
        confirmPassword: confirmPass,
      });
      navigation.navigate('Login');
    } catch (e) {
      setErrGuardar(e.response?.data?.error?.message || 'Token inválido o expirado');
    } finally {
      setLoadGuardar(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.white }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={{ height: 80, paddingHorizontal: 16, paddingTop: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eaeaea', gap: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.dark} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.dark }}>Recuperar contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Icono */}
        <View style={{ width: 48, height: 48, backgroundColor: '#f5f5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <Feather name="lock" size={22} color={C.dark} />
        </View>

        <Text style={{ fontSize: 20, fontWeight: '700', color: C.dark, marginBottom: 8 }}>
          Te enviaremos un enlace
        </Text>
        <Text style={{ fontSize: 13, color: C.gray, lineHeight: 20, marginBottom: 24 }}>
          Ingresa el correo con el que te registraste. El enlace dura{' '}
          <Text style={{ fontWeight: '700', color: C.dark }}>1 hora</Text>.
        </Text>

        {/* Correo */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>Correo</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, paddingRight: 40, borderWidth: 1, borderColor: '#333', borderRadius: 12, fontSize: 15, color: C.dark }}
              value={correo}
              onChangeText={t => { setCorreo(t); setErrEnviar(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {correoValido && (
              <Text style={{ position: 'absolute', right: 16, color: '#2e7d32', fontSize: 14 }}>✓</Text>
            )}
          </View>
        </View>

        {errEnviar ? <Text style={{ color: C.error, fontSize: 13, marginBottom: 10 }}>{errEnviar}</Text> : null}

        {/* Botón enviar */}
        <TouchableOpacity
          style={{ backgroundColor: C.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24, opacity: (!correoValido || loadEnviar) ? 0.5 : 1 }}
          onPress={handleEnviar}
          disabled={!correoValido || loadEnviar}
        >
          {loadEnviar
            ? <ActivityIndicator color={C.white} />
            : <Text style={{ color: C.white, fontSize: 16, fontWeight: '600' }}>Enviar enlace</Text>
          }
        </TouchableOpacity>

        {enlaceEnviado && (
          <View style={{ backgroundColor: '#e8f5e9', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: tokenReset ? 10 : 0 }}>
              <Feather name="check" size={14} color="#2e7d32" />
              <Text style={{ fontSize: 13, color: '#2e7d32' }}>Solicitud enviada correctamente</Text>
            </View>
            {tokenReset ? (
              <>
                <Text style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>
                  El email aún no está configurado. Usa este token para continuar:
                </Text>
                <Text selectable style={{ fontSize: 12, fontWeight: '700', color: '#1a1a1a', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6 }}>
                  {tokenReset}
                </Text>
              </>
            ) : null}
          </View>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#eaeaea', marginBottom: 24 }} />

        {/* Sub-form para nueva contraseña */}
        <View style={{ borderWidth: 1, borderColor: '#999', borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Después del clic en el correo:</Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>Token del enlace</Text>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#333', borderRadius: 12, fontSize: 15, color: C.dark }}
              value={token}
              onChangeText={t => { setToken(t); setErrGuardar(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Pega el token aquí"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>Nueva contraseña</Text>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#333', borderRadius: 12, fontSize: 15, color: C.dark }}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>Repetir contraseña</Text>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#333', borderRadius: 12, fontSize: 15, color: C.dark }}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {errGuardar ? <Text style={{ color: C.error, fontSize: 13, marginBottom: 10 }}>{errGuardar}</Text> : null}

          <TouchableOpacity
            style={{ backgroundColor: C.dark, borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: loadGuardar ? 0.5 : 1 }}
            onPress={handleGuardar}
            disabled={loadGuardar}
          >
            {loadGuardar
              ? <ActivityIndicator color={C.white} />
              : <Text style={{ color: C.white, fontSize: 16, fontWeight: '600' }}>Guardar</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
