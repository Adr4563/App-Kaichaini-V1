// CrearModuloScreen.js
// H.U. 405 - Creación de módulo por parte del docente (solo UI)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const BIMESTRES = ['I', 'II', 'III', 'IV'];

export default function CrearModuloScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [nombre,   setNombre]   = useState('');
  const [bimestre, setBimestre] = useState(null);

  const puedeCrear = nombre.trim().length > 0 && bimestre !== null;

  const handleCrear = () => {
    // TODO: Conectar con backend — POST /modulos { idClase, nombre, bimestre }
    // El orden se asigna automáticamente en el backend.
    console.log('Crear módulo', { idClase, nombre, bimestre });
  };

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{nombreClase}</Text>
          <Text style={s.headerSubtitle}>Crear módulo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Nombre del módulo */}
        <Text style={s.label}>Nombre del módulo</Text>
        <TextInput
          style={s.input}
          placeholder="Ej. Números naturales"
          placeholderTextColor="#aaa"
          value={nombre}
          onChangeText={setNombre}
          maxLength={100}
        />

        {/* Selector de bimestre */}
        <Text style={s.label}>Bimestre</Text>
        <View style={s.bimestreRow}>
          {BIMESTRES.map(b => (
            <TouchableOpacity
              key={b}
              style={[s.bimestreChip, bimestre === b && s.bimestreChipActive]}
              onPress={() => setBimestre(b)}
            >
              <Text style={[s.bimestreChipText, bimestre === b && s.bimestreChipTextActive]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Indicador de orden automático */}
        <View style={s.infoBox}>
          <Feather name="info" size={16} color="#6b7280" />
          <Text style={s.infoText}>
            El orden del módulo se asignará automáticamente según los módulos existentes en el bimestre seleccionado.
          </Text>
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={[s.crearBtn, !puedeCrear && s.crearBtnDisabled]}
          onPress={handleCrear}
          disabled={!puedeCrear}
        >
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={s.crearBtnText}>Crear módulo</Text>
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

  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 8, marginTop: 20 },

  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#1a1a1a',
  },

  bimestreRow: { flexDirection: 'row', gap: 10 },
  bimestreChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fff',
  },
  bimestreChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  bimestreChipText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  bimestreChipTextActive: { color: '#fff' },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#f9fafb', borderRadius: 10,
    padding: 14, marginTop: 24,
  },
  infoText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 19 },

  crearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingVertical: 14, marginTop: 30,
  },
  crearBtnDisabled: { opacity: 0.4 },
  crearBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
