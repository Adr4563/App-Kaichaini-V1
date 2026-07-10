import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import api from '../../services/api';
import { s, C } from '../../styles/screens/ClassCodeScreen.styles';

const CODE_LENGTH = 6;

export default function ClassCodeScreen({ navigation }) {
  const [chars,      setChars]      = useState(Array(CODE_LENGTH).fill(''));
  const [focusIdx,   setFocusIdx]   = useState(null);
  const [error,      setError]      = useState('');
  const [cargando,   setCargando]   = useState(false);
  const boxRefs = useRef(Array.from({ length: CODE_LENGTH }, () => React.createRef()));

  const codigo = chars.join('').toUpperCase();

  const handleCharChange = (text, idx) => {
    const ch = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...chars];
    next[idx] = ch;
    setChars(next);
    setError('');
    if (ch && idx < CODE_LENGTH - 1) boxRefs.current[idx + 1].current?.focus();
  };

  const handleKeyPress = ({ nativeEvent: { key } }, idx) => {
    if (key === 'Backspace' && !chars[idx] && idx > 0) {
      const next = [...chars];
      next[idx - 1] = '';
      setChars(next);
      boxRefs.current[idx - 1].current?.focus();
    }
  };

  const handleContinuar = async () => {
    if (codigo.length < CODE_LENGTH) { setError('Ingresa el código de clase'); return; }
    setCargando(true);
    setError('');
    try {
      const { data } = await api.post('/clases/validar-codigo', { codigo });
      navigation.navigate('Register', { claseInfo: data.data, codigo });
    } catch {
      setError('Código inválido. Verifica con tu docente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.content}>

        <Text style={s.brand}>Kachaini</Text>
        <Text style={s.title}>Ingresa el código que te dio tu profe</Text>
        <Text style={s.subtitle}>Sin código no puedes crear cuenta de estudiante.</Text>

        <View style={s.codeRow}>
          {chars.map((ch, i) => (
            <TextInput
              key={i}
              ref={boxRefs.current[i]}
              style={[s.codeBox, focusIdx === i && s.codeBoxFocus]}
              value={ch}
              onChangeText={(t) => handleCharChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              onFocus={() => setFocusIdx(i)}
              onBlur={() => setFocusIdx(null)}
              maxLength={1}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          ))}
        </View>

        <Text style={s.helper}>6 caracteres • solo letras y números</Text>

        <View style={s.btnGroup}>
          <View style={s.btnHalf}>
            <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.navigate('Login')}>
              <Text style={s.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={s.btnHalf}>
            <TouchableOpacity
              style={[s.btnDark, cargando && s.btnDisabled]}
              onPress={handleContinuar}
              disabled={cargando}
            >
              {cargando
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.btnDarkText}>Continuar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={s.errBox}>
            <Text style={s.errBoxText}>{error}</Text>
          </View>
        ) : null}

        <Text style={s.footer}>
          ¿Ya tienes cuenta?{' '}
          <Text style={s.footerBold} onPress={() => navigation.navigate('Login')}>
            Inicia sesión
          </Text>
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}
