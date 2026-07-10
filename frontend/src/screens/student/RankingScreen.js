// H.U. 113 - Sistema jerárquico de ligas - visualización
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LIGA_CONFIG = {
  Amauta: { color: '#cd7f32', nivel: 3 },
  Panaca: { color: '#9e9e9e', nivel: 2 },
  Auqui:  { color: '#f1c40f', nivel: 1 },
  Inca:   { color: '#1a1a1a', nivel: 0 },
};

const LIGA_NEXT = {
  Amauta: 'Panaca',
  Panaca: 'Auqui',
  Auqui:  'Inca',
  Inca:   null,
};

export default function RankingScreen() {
  const { usuario } = useAuth();
  const [perfil,   setPerfil]   = useState(null);
  const [ligas,    setLigas]    = useState([]);
  const [xpTotal,  setXpTotal]  = useState(0);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const [{ data: p }, { data: l }, { data: xp }] = await Promise.all([
        api.get('/perfil', { params: { idUsuario: usuario.id } }),   // usuario + liga actual
        api.get('/ligas'),    // lista de todas las ligas con umbrales del DB
        api.get('/xp', { params: { idUsuario: usuario.id } }),       // XP total desde la tabla XP (fuente única)
      ]);
      setPerfil(p.data);
      setLigas(l.data || []);
      setXpTotal(xp.data?.xpTotal ?? 0);
    } catch (_) {
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  // xpTotal viene de GET /xp (tabla XP — fuente única de verdad)
  const ligaActual      = perfil?.estadisticas?.liga;
  const nombre          = ligaActual?.nombre ?? 'Amauta';
  const min             = ligaActual?.umbralMinimo ?? 0;
  const max             = ligaActual?.umbralMaximo ?? 499;
  const siguienteNombre = LIGA_NEXT[nombre];
  const cfgActual       = LIGA_CONFIG[nombre] || LIGA_CONFIG.Amauta;
  const progress        = max > min ? Math.min((xpTotal - min) / (max - min), 1) : 1;
  const xpParaSubir     = siguienteNombre ? Math.max(max + 1 - xpTotal, 0) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi liga</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Tarjeta liga actual */}
        <View style={s.ligaCard}>
          <Text style={s.cardSubtitle}>LIGA ACTUAL</Text>

          <View style={[s.medalContainer, { backgroundColor: cfgActual.color }]}>
            <Feather name="award" size={34} color="#fff" />
          </View>

          <Text style={s.ligaTitulo}>{nombre}</Text>
          <Text style={s.ligaRango}>
            {xpTotal} XP · {min} – {max >= Number.MAX_SAFE_INTEGER ? '∞' : max}
          </Text>

          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          <View style={s.progressLabels}>
            <Text style={s.progressLabel}>{min}</Text>
            {siguienteNombre ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={s.progressNeed}>
                  <Text style={{ fontWeight: '700' }}>{xpParaSubir} XP</Text> para
                </Text>
                <Feather name="award" size={11} color="#d4af37" />
                <Text style={s.progressNeed}>{siguienteNombre}</Text>
              </View>
            ) : (
              <Text style={s.progressNeed}>Nivel máximo</Text>
            )}
            <Text style={s.progressLabel}>{max >= Number.MAX_SAFE_INTEGER ? '∞' : max}</Text>
          </View>
        </View>

        {/* Tabla de ligas */}
        <Text style={s.seccion}>Tabla de ligas</Text>
        <View style={s.listaLigas}>
          {ligas.map(liga => {
            const cfgItem   = LIGA_CONFIG[liga.nombre] || {};
            const esActual  = liga.nombre === nombre;
            const nivelItem = cfgItem.nivel ?? 4;
            const esSuper   = nivelItem > (cfgActual.nivel ?? 4);
            const esSig     = liga.nombre === siguienteNombre;
            const estaBloq  = !esActual && !esSuper && !esSig;

            let statusLabel = '';
            let statusColor = '#b5b5b5';

            if (esActual)     { statusLabel = ''; }
            else if (esSuper) { statusLabel = 'superada'; }
            else if (esSig)   { statusLabel = 'siguiente'; statusColor = '#1e7e34'; }

            return (
              <View
                key={liga.id}
                style={[s.ligaItem, esActual && s.ligaItemActual, estaBloq && { opacity: 0.55 }]}
              >
                <View style={s.ligaItemLeft}>
                  <View style={[s.ligaItemIcon, { backgroundColor: cfgItem.color || '#ccc' }]}>
                    <Feather name="award" size={18} color="#fff" />
                  </View>
                  <View>
                    <Text style={[s.ligaItemNombre, estaBloq && { color: '#666' }]}>
                      {liga.nombre}
                    </Text>
                    <Text style={s.ligaItemXP}>
                      {liga.umbralMinimo} – {liga.umbralMaximo >= Number.MAX_SAFE_INTEGER
                        ? '2000+ XP' : `${liga.umbralMaximo} XP`}
                    </Text>
                  </View>
                </View>

                {statusLabel ? (
                  <Text style={[s.ligaItemStatus, { color: statusColor }]}>{statusLabel}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Banner notificación */}
        <View style={s.banner}>
          <Feather name="bell" size={16} color="#fff" />
          <Text style={s.bannerText}>Te avisamos cuando subas o bajes de liga.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header:            { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  headerTitle:       { fontSize: 24, fontWeight: '700', color: '#111' },
  ligaCard:          { borderWidth: 2, borderColor: '#111', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 24 },
  cardSubtitle:      { fontSize: 11, letterSpacing: 1.5, color: '#666', fontWeight: '600', marginBottom: 12 },
  medalContainer:    { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  ligaTitulo:        { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 4 },
  ligaRango:         { fontSize: 14, color: '#666', marginBottom: 16 },
  progressBg:        { height: 12, backgroundColor: '#e5e5e5', borderRadius: 6, overflow: 'hidden', width: '100%', marginBottom: 6 },
  progressFill:      { height: '100%', backgroundColor: '#1e7e34', borderRadius: 6 },
  progressLabels:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  progressLabel:     { fontSize: 12, color: '#666' },
  progressNeed:      { fontSize: 12, color: '#111' },
  seccion:           { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  listaLigas:        { gap: 12, marginBottom: 16 },
  ligaItem:          { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' },
  ligaItemActual:    { backgroundColor: '#e8f4ed', borderColor: '#111' },
  ligaItemLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ligaItemIcon:      { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  ligaItemNombre:    { fontSize: 16, fontWeight: '700', color: '#111' },
  ligaItemXP:        { fontSize: 12, color: '#666', marginTop: 2 },
  ligaItemStatus:    { fontSize: 14, fontWeight: '600' },
  banner:            { backgroundColor: '#1a1a1a', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerText:        { color: '#fff', fontSize: 13, fontWeight: '500', flex: 1 },
});
