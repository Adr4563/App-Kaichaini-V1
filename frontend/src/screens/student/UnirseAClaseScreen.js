import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CODE_LEN = 6;

export default function UnirseAClaseScreen({ navigation }) {
  const { usuario } = useAuth();
  const [chars,     setChars]     = useState(Array(CODE_LEN).fill(''));
  const [focusIdx,  setFocusIdx]  = useState(null);
  const [error,     setError]     = useState('');
  const [fase,      setFase]      = useState('codigo'); // 'codigo' | 'confirmar' | 'exito'
  const [claseInfo, setClaseInfo] = useState(null);
  const [cargando,  setCargando]  = useState(false);
  const refs = useRef(Array.from({ length: CODE_LEN }, () => React.createRef()));

  const codigo = chars.join('').toUpperCase();

  const handleChar = (text, idx) => {
    const ch = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...chars];
    next[idx] = ch;
    setChars(next);
    setError('');
    if (ch && idx < CODE_LEN - 1) refs.current[idx + 1].current?.focus();
  };

  const handleKey = ({ nativeEvent: { key } }, idx) => {
    if (key === 'Backspace' && !chars[idx] && idx > 0) {
      const next = [...chars];
      next[idx - 1] = '';
      setChars(next);
      refs.current[idx - 1].current?.focus();
    }
  };

  const handleValidar = async () => {
    if (codigo.length < CODE_LEN) { setError('Ingresa el código completo'); return; }
    setCargando(true);
    setError('');
    try {
      const { data } = await api.post('/clases/validar-codigo', { codigo });
      setClaseInfo(data.data);
      setFase('confirmar');
    } catch {
      setError('Código inválido. Verifica con tu docente.');
    } finally {
      setCargando(false);
    }
  };

  const handleUnirse = async () => {
    setCargando(true);
    try {
      await api.post('/clases/unirse', { codigoUnico: codigo, idEstudiante: usuario.id });
      setFase('exito');
    } catch (e) {
      const msg = e.response?.data?.error?.message || 'Error al unirse a la clase';
      setError(msg);
      setFase('codigo');
    } finally {
      setCargando(false);
    }
  };

  if (fase === 'exito') {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Feather name="check-circle" size={60} color="#1b5e20" />
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginTop: 20, marginBottom: 8 }}>
          ¡Te uniste!
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 32 }}>
          Ahora eres parte de {claseInfo?.nombre}.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Listo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (fase === 'confirmar' && claseInfo) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 16 }}>Clase encontrada</Text>
        <View style={{ backgroundColor: '#f6f6f6', borderRadius: 12, padding: 16, marginBottom: 28 }}>
          <Text style={{ fontSize: 10, color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700', marginBottom: 4 }}>Clase</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>{claseInfo.nombre}</Text>
          {claseInfo.curso ? <Text style={{ fontSize: 13, color: '#757575', marginTop: 2 }}>{claseInfo.curso}</Text> : null}
        </View>
        {error ? <Text style={{ color: '#c62828', fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}
        <TouchableOpacity
          style={{ backgroundColor: '#1b5e20', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12, opacity: cargando ? 0.5 : 1 }}
          onPress={handleUnirse}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Unirme a la clase</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
          onPress={() => { setFase('codigo'); setChars(Array(CODE_LEN).fill('')); }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a1a' }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ height: 80, paddingHorizontal: 16, paddingTop: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eaeaea', gap: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>Unirse a una clase</Text>
      </View>

      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Ingresa el código que te dio tu docente
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 12 }}>
          {chars.map((ch, i) => (
            <TextInput
              key={i}
              ref={refs.current[i]}
              style={{
                flex: 1, height: 52,
                borderWidth: focusIdx === i ? 2 : 1,
                borderColor: focusIdx === i ? '#1b5e20' : '#1a1a1a',
                borderRadius: 10, fontSize: 18, fontWeight: '600',
                textAlign: 'center', color: '#1a1a1a',
              }}
              value={ch}
              onChangeText={t => handleChar(t, i)}
              onKeyPress={e => handleKey(e, i)}
              onFocus={() => setFocusIdx(i)}
              onBlur={() => setFocusIdx(null)}
              maxLength={1}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          ))}
        </View>

        <Text style={{ fontSize: 12, color: '#9e9e9e', marginBottom: 28 }}>
          6 caracteres · solo letras y números
        </Text>

        {error ? <Text style={{ color: '#c62828', fontSize: 13, marginBottom: 12 }}>{error}</Text> : null}

        <TouchableOpacity
          style={{ backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 16, alignItems: 'center', opacity: cargando ? 0.5 : 1 }}
          onPress={handleValidar}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Continuar</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
