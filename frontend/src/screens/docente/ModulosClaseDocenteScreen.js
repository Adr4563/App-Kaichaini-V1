// ModulosClaseDocenteScreen.js
// H.U. 318 - Visualización de los módulos de una clase (docente)

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const BIMESTRES = ['I', 'II', 'III', 'IV'];
const BIMESTRE_A_NUMERO = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};

export default function ModulosClaseDocenteScreen({ route, navigation }) {
  const { idClase, nombreClase } = route.params || {};

  const [modulos,  setModulos]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const cargarModulos = async () => {
    setError(null);
    setCargando(true);
    try {
      const { data } = await api.get('/modulos', { params: { idClase } });
      setModulos(data.data || []);
    } catch (_) {
      setError('No se pudieron cargar los módulos.');
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => { cargarModulos(); }, []),
  );

  const modulosPorBimestre = BIMESTRES.map(b => ({
    bimestre: b,
    items: modulos
      .filter(m => Number(m.bimestre) === BIMESTRE_A_NUMERO[b])
      .sort((a, c) => a.orden - c.orden),
  }));

  // ── Estado: cargando ──────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  // ── Estado: error ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={s.center}>
        <Feather name="alert-circle" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={cargarModulos}>
          <Text style={s.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{nombreClase}</Text>
          <Text style={s.headerSubtitle}>Módulos</Text>
        </View>
      </View>

      {/* ── Barra de acciones ─────────────────────────────────────────────────── */}
      <View style={s.actionsRow}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => navigation.navigate('CrearModulo', { idClase, nombreClase })}
        >
          <Feather name="plus-circle" size={16} color="#fff" />
          <Text style={s.actionBtnText}>Crear módulo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnOutline]}
          onPress={() => navigation.navigate('EditarSilabo', { idClase, nombreClase })}
        >
          <Feather name="file-text" size={16} color="#1a1a1a" />
          <Text style={[s.actionBtnText, { color: '#1a1a1a' }]}>Sílabo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, s.actionBtnOutline]}
          onPress={() => navigation.navigate('MaterialDocente', { idClase, nombreClase })}
        >
          <Feather name="paperclip" size={16} color="#1a1a1a" />
          <Text style={[s.actionBtnText, { color: '#1a1a1a' }]}>Material</Text>
        </TouchableOpacity>
      </View>

      {/* ── Estado: vacío ─────────────────────────────────────────────────────── */}
      {modulos.length === 0 ? (
        <View style={[s.center, { flex: 1 }]}>
          <Feather name="inbox" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
          <Text style={s.emptyTitle}>Esta clase aún no tiene módulos</Text>
          <Text style={s.emptySubtitle}>
            Crea un módulo para empezar a organizar{'\n'}los ejercicios por bimestre.
          </Text>
        </View>
      ) : (

        // ── Lista agrupada por bimestre ──────────────────────────────────────
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {modulosPorBimestre.map(grupo => {
            if (grupo.items.length === 0) return null;
            return (
              <View key={grupo.bimestre} style={s.bimestreGroup}>
                <View style={s.bimestreBadge}>
                  <Text style={s.bimestreBadgeText}>Bimestre {grupo.bimestre}</Text>
                </View>

                {grupo.items.map(modulo => (
                  <TouchableOpacity
                    key={modulo.id}
                    style={s.moduloCard}
                    onPress={() => navigation.navigate('CrearEjercicioClicNumero', {
                      idClase, nombreClase, idModulo: modulo.id, nombreModulo: modulo.nombre,
                    })}
                  >
                    <View style={s.moduloIcon}>
                      <Text style={s.moduloOrden}>{modulo.orden}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.moduloNombre}>{modulo.nombre}</Text>
                      <Text style={s.moduloMeta}>
                        Bimestre {modulo.bimestre} · Orden {modulo.orden}
                      </Text>
                    </View>

                    <Feather name="chevron-right" size={18} color="#bbb" />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },

  // Header
  header: {
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#eaeaea',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Actions
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    gap: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnOutline: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Empty
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Error
  errorText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 16, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#1a1a1a', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Bimestre group
  bimestreGroup: { marginBottom: 20 },
  bimestreBadge: {
    alignSelf: 'flex-start', backgroundColor: '#f3f4f6',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginBottom: 10,
  },
  bimestreBadgeText: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },

  // Module card
  moduloCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  moduloIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  moduloOrden: { fontSize: 15, fontWeight: '700', color: '#fff' },
  moduloNombre: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  moduloMeta: { fontSize: 12, color: '#888' },
});
