// CrearModuloScreen.js
// H.U. 405 - Creación de módulo por parte del docente

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';

const BIMESTRES = ['I', 'II', 'III', 'IV'];
const BIMESTRE_A_NUMERO = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};

export default function CrearModuloScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [nombre, setNombre] = useState('');
  const [bimestre, setBimestre] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const puedeCrear = nombre.trim().length > 0 && bimestre !== null && !guardando;

  const handleCrear = async () => {
    console.log('[CrearModulo] handleCrear iniciado', {
      idClase,
      nombre,
      bimestre,
      guardando,
    });

    if (!idClase || !nombre.trim() || !bimestre || guardando) {
      console.log('[CrearModulo] validación bloqueó el envío', {
        idClase,
        nombreValido: nombre.trim().length > 0,
        bimestre,
        guardando,
      });
      return;
    }

    setError(null);
    setGuardando(true);
    console.log('[CrearModulo] estado guardando activado');

    try {
      const bimestreNumero = BIMESTRE_A_NUMERO[bimestre];

      // El backend no autoasigna el orden: se calcula aquí como
      // (cantidad de módulos ya existentes en ese bimestre) + 1.
      console.log('[CrearModulo] consultando módulos existentes', { idClase });
      const { data: existentes } = await api.get('/modulos', { params: { idClase } });
      console.log('[CrearModulo] respuesta GET /modulos', existentes);

      const modulosBimestre = (existentes.data || []).filter(
        m => Number(m.bimestre) === bimestreNumero
      );
      const orden = modulosBimestre.length + 1;
      console.log('[CrearModulo] cálculo de orden', {
        totalModulos: (existentes.data || []).length,
        modulosBimestre: modulosBimestre.length,
        orden,
        bimestre,
        bimestreNumero,
      });

      console.log('[CrearModulo] enviando POST /modulos/:idClase', {
        idClase,
        nombre: nombre.trim(),
        bimestre: bimestreNumero,
        orden,
      });

      await api.post(`/modulos/${idClase}`, {
        nombre: nombre.trim(),
        bimestre: bimestreNumero,
        orden,
      });

      console.log('[CrearModulo] módulo creado correctamente');

      navigation.goBack();
    } catch (error) {
      console.error('[CrearModulo] error al crear el módulo', {
        message: error?.message,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
      });
      setError('No se pudo crear el módulo. Intenta nuevamente.');
    } finally {
      setGuardando(false);
      console.log('[CrearModulo] estado guardando desactivado');
    }
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

        {/* Mensaje de error */}
        {error && <Text style={s.errorText}>{error}</Text>}

        {/* Botón crear */}
        <TouchableOpacity
          style={[s.crearBtn, !puedeCrear && s.crearBtnDisabled]}
          onPress={handleCrear}
          disabled={!puedeCrear}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="plus-circle" size={18} color="#fff" />
              <Text style={s.crearBtnText}>Crear módulo</Text>
            </>
          )}
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
  errorText: { marginTop: 14, fontSize: 13, color: '#b91c1c', fontWeight: '600' },

  crearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingVertical: 14, marginTop: 30,
  },
  crearBtnDisabled: { opacity: 0.4 },
  crearBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
