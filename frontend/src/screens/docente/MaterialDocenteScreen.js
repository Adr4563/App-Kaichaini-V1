// MaterialDocenteScreen.js
// H.U. 417 - Visualización de material subido por el docente
// H.U. 407 - Eliminación de material subido por parte del docente

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Linking, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

// Config por tipo. Se busca por clave en minúscula porque la BD guarda el
// tipo como 'pdf' / 'video' / 'enlace'. El label se muestra normalizado.
const TIPO_CONFIG = {
  pdf:    { label: 'PDF',    icon: 'file-text',   color: '#dc2626' },
  video:  { label: 'Video',  icon: 'play-circle', color: '#7c3aed' },
  enlace: { label: 'Enlace', icon: 'link',        color: '#2563eb' },
  link:   { label: 'Enlace', icon: 'link',        color: '#2563eb' },
};

const configTipo = (tipo) => {
  const cfg = TIPO_CONFIG[(tipo || '').toLowerCase()];
  if (cfg) return cfg;
  return { label: (tipo || 'Archivo').toUpperCase(), icon: 'file', color: '#2563eb' };
};

export default function MaterialDocenteScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [materiales,   setMateriales]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [eliminando,   setEliminando]   = useState(false);

  // ── H.U. 417 - Cargar material de la clase ──────────────────────────────
  const cargarMateriales = async () => {
    try {
      setError('');
      const { data } = await api.get(`/material?idClase=${idClase}`);
      setMateriales(data.data || []);
    } catch (_) {
      setError('No se pudo cargar el material. Intenta de nuevo.');
      setMateriales([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!idClase) { setCargando(false); return; }
      setCargando(true);
      cargarMateriales().finally(() => setCargando(false));
    }, [idClase]),
  );

  // ── H.U. 407 - Eliminar material ────────────────────────────────────────
  const handleEliminar = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setEliminando(true);
    try {
      await api.delete(`/material/${target.id}`);
      setMateriales(prev => prev.filter(m => m.id !== target.id));
      setDeleteTarget(null);
    } catch (_) {
      setError('No se pudo eliminar el material. Intenta de nuevo.');
    } finally {
      setEliminando(false);
    }
  };

  const handleAbrirUrl = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
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
          <Text style={s.headerSubtitle}>Material</Text>
        </View>
      </View>

      {/* Contenido */}
      {cargando ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#1a1a1a" />
        </View>
      ) : error && materiales.length === 0 ? (
        <View style={s.center}>
          <Feather name="alert-circle" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
          <Text style={s.emptyTitle}>Ocurrió un error</Text>
          <Text style={s.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={s.retryBtn}
            onPress={() => { setCargando(true); cargarMateriales().finally(() => setCargando(false)); }}
          >
            <Text style={s.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : materiales.length === 0 ? (
        <View style={s.center}>
          <Feather name="folder" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
          <Text style={s.emptyTitle}>No hay materiales</Text>
          <Text style={s.emptySubtitle}>Los materiales que subas aparecerán aquí.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {materiales.map(material => {
            const cfg = configTipo(material.tipo);
            return (
              <View key={material.id} style={s.card}>
                <View style={[s.tipoIcon, { backgroundColor: cfg.color + '15' }]}>
                  <Feather name={cfg.icon} size={20} color={cfg.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.materialNombre}>{material.nombre}</Text>

                  <View style={s.metaRow}>
                    <View style={[s.tipoBadge, { backgroundColor: cfg.color + '15' }]}>
                      <Text style={[s.tipoBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => handleAbrirUrl(material.archivoUrl)}>
                    <Text style={s.url} numberOfLines={1}>{material.archivoUrl}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => setDeleteTarget(material)}
                >
                  <Feather name="trash-2" size={18} color="#cc0000" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal de confirmación de eliminación (H.U. 407) */}
      <Modal transparent visible={deleteTarget !== null} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Feather name="alert-triangle" size={32} color="#cc0000" style={{ marginBottom: 12 }} />
            <Text style={s.modalTitle}>¿Eliminar este material?</Text>
            <Text style={s.modalSubtitle}>
              «{deleteTarget?.nombre}» ya no será visible para los estudiantes de esta clase.
            </Text>

            <View style={s.modalBtns}>
              <TouchableOpacity
                style={[s.modalBtnCancel, eliminando && s.btnDisabled]}
                onPress={() => setDeleteTarget(null)}
                disabled={eliminando}
              >
                <Text style={s.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalBtnDelete, eliminando && s.btnDisabled]}
                onPress={handleEliminar}
                disabled={eliminando}
              >
                {eliminando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={s.modalBtnDeleteText}>Eliminar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  header: {
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#eaeaea',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Empty / error
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 18, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 22,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, marginBottom: 12,
  },
  tipoIcon: {
    width: 42, height: 42, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  materialNombre: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  metaRow: { flexDirection: 'row', marginBottom: 4 },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tipoBadgeText: { fontSize: 11, fontWeight: '700' },
  url: { fontSize: 12, color: '#2563eb', textDecorationLine: 'underline' },
  deleteBtn: { padding: 6 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 24, alignItems: 'center', width: '100%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: {
    flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  modalBtnDelete: {
    flex: 1, backgroundColor: '#cc0000', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnDeleteText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
});
