// EditarSilaboScreen.js
// H.U. 406 - Actualización del contenido del sílabo con vista previa

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

export default function EditarSilaboScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [contenido,   setContenido]   = useState('');
  const [previewing,  setPreviewing]  = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [guardando,   setGuardando]   = useState(false);
  const [guardado,    setGuardado]    = useState(false);
  const [error,       setError]       = useState('');

  const cargarSilabo = async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get(`/silabos/${idClase}`);
      setContenido(data.data?.contenido || '');
    } catch (e) {
      if (e.response?.status !== 404) {
        setError('No se pudo cargar el sílabo.');
      }
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarSilabo(); }, [idClase]));

  const handleConfirmar = async () => {
    setGuardando(true);
    setGuardado(false);
    setError('');
    try {
      await api.put(`/silabos/${idClase}`, { contenido });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (e) {
      setError('No se pudo guardar el sílabo.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{nombreClase}</Text>
          <Text style={s.headerSubtitle}>Sílabo</Text>
        </View>
      </View>

      {/* Tabs: Editar / Vista previa */}
      <View style={s.tabsRow}>
        <TouchableOpacity
          style={[s.tab, !previewing && s.tabActive]}
          onPress={() => setPreviewing(false)}
        >
          <Feather name="edit-3" size={16} color={!previewing ? '#1a1a1a' : '#888'} />
          <Text style={[s.tabText, !previewing && s.tabTextActive]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, previewing && s.tabActive]}
          onPress={() => setPreviewing(true)}
        >
          <Feather name="eye" size={16} color={previewing ? '#1a1a1a' : '#888'} />
          <Text style={[s.tabText, previewing && s.tabTextActive]}>Vista previa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}>

        {!previewing ? (
          // ── Editor ──────────────────────────────────────────────────────────
          <TextInput
            style={s.editor}
            multiline
            value={contenido}
            onChangeText={setContenido}
            placeholder="Escribe el contenido del sílabo..."
            placeholderTextColor="#aaa"
            textAlignVertical="top"
          />
        ) : (
          // ── Vista previa ────────────────────────────────────────────────────
          <View style={s.previewBox}>
            <Text style={s.previewText}>
              {contenido || 'Sin contenido para previsualizar.'}
            </Text>
          </View>
        )}

        {error ? <Text style={s.errorText}>{error}</Text> : null}
        {guardado ? <Text style={s.successText}>Sílabo guardado correctamente.</Text> : null}

      </ScrollView>

      {/* Botón confirmar (solo visible en vista previa) */}
      {previewing && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.confirmarBtn, guardando && s.confirmarBtnDisabled]}
            onPress={handleConfirmar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={s.confirmarBtnText}>Confirmar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  header: {
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#eaeaea',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Tabs
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12,
    gap: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#1a1a1a' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#888' },
  tabTextActive: { color: '#1a1a1a', fontWeight: '700' },

  // Editor
  editor: {
    flex: 1, minHeight: 300,
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#1a1a1a', lineHeight: 22,
  },

  // Preview
  previewBox: {
    flex: 1, backgroundColor: '#f9fafb', borderRadius: 10,
    padding: 16, borderWidth: 1, borderColor: '#e0e0e0',
  },
  previewText: { fontSize: 15, color: '#1a1a1a', lineHeight: 24 },

  errorText: { color: '#c62828', fontSize: 13, marginTop: 14 },
  successText: { color: '#2e7d32', fontSize: 13, marginTop: 14 },

  // Footer
  footer: {
    padding: 16, borderTopWidth: 1, borderTopColor: '#eaeaea',
  },
  confirmarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14,
  },
  confirmarBtnDisabled: { opacity: 0.6 },
  confirmarBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
