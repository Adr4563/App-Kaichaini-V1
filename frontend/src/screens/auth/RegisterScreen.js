import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { s, C } from '../../styles/screens/RegisterScreen.styles';

const checkPolicy = (p) => ({
  length:    p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  number:    /[0-9]/.test(p),
});

function ReqRow({ ok, label, last }) {
  return (
    <View style={[s.reqRow, last && s.reqRowLast]}>
      <View style={[s.reqCircle, ok ? s.reqCircleOk : s.reqCircleFail]}>
        <Text style={s.reqCircleText}>{ok ? '✓' : '✕'}</Text>
      </View>
      <Text style={s.reqLabel}>{label}</Text>
    </View>
  );
}

export default function RegisterScreen({ navigation, route }) {
  const { claseInfo, codigo } = route.params;

  const [nombre,          setNombre]          = useState('');
  const [correo,          setCorreo]          = useState('');
  const [contrasena,      setContrasena]      = useState('');
  const [colegio,         setColegio]         = useState('');
  const [terminos,        setTerminos]        = useState(false);
  const [cargando,        setCargando]        = useState(false);
  const [error,           setError]           = useState('');
  const [emailEnUso,      setEmailEnUso]      = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const correoValido  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const nombreValido  = nombre.trim().length >= 2;
  const colegioValido = colegio.trim().length > 0;
  const policy        = checkPolicy(contrasena);
  const policyOk      = policy.length && policy.uppercase && policy.number;
  const showPolicy    = contrasena.length > 0;

  const handleRegistrar = async () => {
    setError('');
    setEmailEnUso(false);
    if (!nombreValido) { setError('Ingresa tu nombre completo');              return; }
    if (!correoValido) { setError('Ingresa un correo válido');                return; }
    if (!policyOk)     { setError('La contraseña no cumple los requisitos'); return; }
    if (!terminos)     { setError('Debes aceptar los términos');              return; }

    setCargando(true);
    try {
      await api.post('/auth/register', {
        rol:         'Estudiante',
        nombre:      nombre.trim(),
        correo:      correo.trim(),
        contrasena,
        codigoClase: codigo,
        colegio:     colegio.trim() || null,
      });
      navigation.navigate('Login');
    } catch (e) {
      const msg = e.response?.data?.error?.message || e.response?.data?.message || 'Error al registrarse';
      if (msg.includes('ya está en uso')) setEmailEnUso(true);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Crea tu cuenta</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Tarjeta de clase */}
        <View style={s.classCard}>
          <Text style={s.classLabel}>Clase encontrada</Text>
          <Text style={s.classTitle}>{claseInfo.nombre}</Text>
          <Text style={s.classTeacher}>{claseInfo.curso || 'Sin curso'}</Text>
          {claseInfo.docenteNombre ? (
            <Text style={s.classTeacher}>Prof. {claseInfo.docenteNombre}</Text>
          ) : null}
        </View>

        {/* Nombre */}
        <View style={s.formGroup}>
          <Text style={s.label}>Nombre completo</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {nombreValido && <Text style={s.checkIcon}>✓</Text>}
          </View>
        </View>

        {/* Correo */}
        <View style={s.formGroup}>
          <Text style={s.label}>Correo</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={correo}
              onChangeText={(t) => { setCorreo(t); setEmailEnUso(false); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {correoValido && <Text style={s.checkIcon}>✓</Text>}
          </View>
          <Text style={s.helperText}>Te enviaremos un correo de bienvenida</Text>
        </View>

        {/* Contraseña */}
        <View style={[s.formGroup, { marginBottom: showPolicy ? 5 : 20 }]}>
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

        {/* Requisitos */}
        {showPolicy && (
          <View style={s.reqBox}>
            <ReqRow ok={policy.length}    label="8 caracteres mínimo" />
            <ReqRow ok={policy.uppercase} label="1 mayúscula" />
            <ReqRow ok={policy.number}    label="1 número" last />
          </View>
        )}

        {/* Colegio */}
        <View style={s.formGroup}>
          <Text style={s.label}>Colegio</Text>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              value={colegio}
              onChangeText={setColegio}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {colegioValido && <Text style={s.checkIcon}>✓</Text>}
          </View>
        </View>

        {/* Términos */}
        <View style={s.termsRow}>
          <TouchableOpacity
            style={[s.checkbox, !terminos && s.checkboxOff]}
            onPress={() => setTerminos(!terminos)}
          >
            {terminos && <Text style={s.checkMark}>✓</Text>}
          </TouchableOpacity>
          <Text style={s.termsText}>
            Acepto los <Text style={s.termsBold}>Términos</Text> y la{' '}
            <Text style={s.termsBold}>Política de privacidad</Text>
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.errorText}>{error}</Text>
            {emailEnUso && (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.errorLink}>Recuperar contraseña</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        <TouchableOpacity
          style={[s.btnPrimary, cargando && s.btnDisabled]}
          onPress={handleRegistrar}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.btnPrimaryText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
