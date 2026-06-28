// MaterialDocenteScreen.js
// H.U. 417 - Visualización de material subido por el docente (solo UI)
// H.U. 407 - Eliminación de material subido por parte del docente (solo UI)

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const TIPO_CONFIG = {
  PDF:    { icon: 'file-text', color: '#dc2626' },
  Video:  { icon: 'play-circle', color: '#7c3aed' },
  Enlace: { icon: 'link',        color: '#2563eb' },
};

const MOCK_MATERIALES = [
  { id: 1, nombre: 'Guía de ejercicios - Bimestre I',  tipo: 'PDF',    url: 'https://ejemplo.com/guia-b1.pdf' },
  { id: 2, nombre: 'Video: Multiplicación paso a paso', tipo: 'Video',  url: 'https://ejemplo.com/video-mult.mp4' },
  { id: 3, nombre: 'Ejercicios interactivos',           tipo: 'Enlace', url: 'https://ejemplo.com/ejercicios' },
  { id: 4, nombre: 'Tabla de fórmulas',                 tipo: 'PDF',    url: 'https://ejemplo.com/formulas.pdf' },
  { id: 5, nombre: 'Video: Fracciones para niños',      tipo: 'Video',  url: 'https://ejemplo.com/video-fracc.mp4' },
];

export default function MaterialDocenteScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [materiales, setMateriales]     = useState(MOCK_MATERIALES);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEliminar = () => {
    // TODO: Conectar con backend — DELETE /materiales/:id
    console.log('Eliminar material', deleteTarget?.id);
    setMateriales(materiales.filter(m => m.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  const handleAbrirUrl = (url) => {
    // TODO: Validar URL antes de abrir
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

      {/* Lista de materiales */}
      {materiales.length === 0 ? (
        <View style={s.center}>
          <Feather name="folder" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
          <Text style={s.emptyTitle}>No hay materiales</Text>
          <Text style={s.emptySubtitle}>Los materiales que subas aparecerán aquí.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {materiales.map(material => {
            const cfg = TIPO_CONFIG[material.tipo] || TIPO_CONFIG.Enlace;
            return (
              <View key={material.id} style={s.card}>
                <View style={[s.tipoIcon, { backgroundColor: cfg.color + '15' }]}>
                  <Feather name={cfg.icon} size={20} color={cfg.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.materialNombre}>{material.nombre}</Text>

                  <View style={s.metaRow}>
                    <View style={[s.tipoBadge, { backgroundColor: cfg.color + '15' }]}>
                      <Text style={[s.tipoBadgeText, { color: cfg.color }]}>{material.tipo}</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => handleAbrirUrl(material.url)}>
                    <Text style={s.url} numberOfLines={1}>{material.url}</Text>
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
                style={s.modalBtnCancel}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={s.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.modalBtnDelete} onPress={handleEliminar}>
                <Text style={s.modalBtnDeleteText}>Eliminar</Text>
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

  // Empty
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

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
});
