// CrearEjercicioSeleccionScreen.js
// H.U. 316 - Creación de ejercicio tipo "selección múltiple" (solo UI)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CrearEjercicioSeleccionScreen({ route, navigation }) {
  const { idClase, nombreModulo, idModulo } = route.params || {};

  const [enunciado, setEnunciado]     = useState('');
  const [opciones,  setOpciones]      = useState([{ texto: '', id: 1 }, { texto: '', id: 2 }]);
  const [correctaId, setCorrectaId]   = useState(null);
  const [nuevoTexto, setNuevoTexto]   = useState('');

  let nextId = opciones.length > 0 ? Math.max(...opciones.map(o => o.id)) + 1 : 1;

  const agregarOpcion = () => {
    if (nuevoTexto.trim() === '') return;
    setOpciones([...opciones, { texto: nuevoTexto.trim(), id: nextId }]);
    setNuevoTexto('');
  };

  const quitarOpcion = (id) => {
    if (opciones.length <= 2) {
      Alert.alert('Mínimo 2 opciones', 'Debe haber al menos 2 opciones de texto.');
      return;
    }
    setOpciones(opciones.filter(o => o.id !== id));
    if (correctaId === id) setCorrectaId(null);
  };

  const handleGuardar = () => {
    // TODO: Conectar con backend — POST /ejercicios
    // { idModulo, tipo: 'seleccion_multiple', enunciado, opciones, correctaId }
    console.log('Guardar ejercicio selección múltiple', { idModulo, enunciado, opciones, correctaId });
  };

  const puedeGuardar = enunciado.trim().length > 0
    && opciones.length >= 2
    && opciones.every(o => o.texto !== '')
    && correctaId !== null;

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{nombreModulo || 'Módulo'}</Text>
          <Text style={s.headerSubtitle}>Ejercicio · Selección múltiple</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Enunciado */}
        <Text style={s.label}>Enunciado</Text>
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Ej. ¿Cuál es el sinónimo de 'feliz'?"
          placeholderTextColor="#aaa"
          value={enunciado}
          onChangeText={setEnunciado}
          multiline
          maxLength={300}
        />

        {/* Opciones de texto */}
        <Text style={[s.label, { marginTop: 24 }]}>Opciones de texto</Text>
        <Text style={s.hint}>Toca el círculo para marcar la respuesta correcta.</Text>

        {opciones.map(opcion => (
          <View key={opcion.id} style={s.opcionRow}>
            <TouchableOpacity
              style={[s.radio, correctaId === opcion.id && s.radioActive]}
              onPress={() => setCorrectaId(opcion.id)}
            >
              {correctaId === opcion.id && <View style={s.radioDot} />}
            </TouchableOpacity>

            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Opción de texto"
              placeholderTextColor="#aaa"
              value={opcion.texto}
              onChangeText={v => setOpciones(opciones.map(o =>
                o.id === opcion.id ? { ...o, texto: v } : o
              ))}
            />

            <TouchableOpacity onPress={() => quitarOpcion(opcion.id)} style={{ padding: 8 }}>
              <Feather name="x-circle" size={20} color="#cc0000" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Agregar opción */}
        <View style={s.agregarRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Nueva opción"
            placeholderTextColor="#aaa"
            value={nuevoTexto}
            onChangeText={setNuevoTexto}
          />
          <TouchableOpacity style={s.agregarBtn} onPress={agregarOpcion}>
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[s.guardarBtn, !puedeGuardar && s.guardarBtnDisabled]}
          onPress={handleGuardar}
          disabled={!puedeGuardar}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={s.guardarBtnText}>Guardar ejercicio</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#eaeaea',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  hint: { fontSize: 12, color: '#888', marginBottom: 12 },

  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1a1a1a',
  },

  opcionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },

  radio: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#d1d5db',
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: '#16a34a' },
  radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#16a34a' },

  agregarRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  agregarBtn: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    width: 46, justifyContent: 'center', alignItems: 'center',
  },

  guardarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingVertical: 14, marginTop: 30,
  },
  guardarBtnDisabled: { opacity: 0.4 },
  guardarBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
