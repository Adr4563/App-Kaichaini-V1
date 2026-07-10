// EvaluacionModuloScreen.js
// H.U. 314 - Evaluacion al completar un modulo con retroalimentacion general

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Componente: Circulo de puntaje animado ────────────────────────────────────
function CirculoPuntaje({ porcentaje }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const color =
    porcentaje >= 80 ? '#16a34a' :
    porcentaje >= 50 ? '#f59e0b' :
    '#ef4444';

  const iconoNombre =
    porcentaje >= 80 ? 'award' :
    porcentaje >= 50 ? 'trending-up' :
    'book-open';

  return (
    <Animated.View
      style={[
        st.circulo,
        { borderColor: color, transform: [{ scale: scaleAnim }], opacity: opacAnim },
      ]}
    >
      <Feather name={iconoNombre} size={28} color={color} style={{ marginBottom: 4 }} />
      <Text style={[st.circuloPct, { color }]}>{Math.round(porcentaje)}%</Text>
      <Text style={st.circuloLabel}>puntaje</Text>
    </Animated.View>
  );
}

// ── Componente: Stat card ─────────────────────────────────────────────────────
function StatCard({ icon, iconColor, iconBg, titulo, valor, subtitulo }) {
  return (
    <View style={st.statCard}>
      <View style={[st.statIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={st.statValor}>{valor}</Text>
      <Text style={st.statTitulo}>{titulo}</Text>
      {subtitulo ? <Text style={st.statSub}>{subtitulo}</Text> : null}
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────────
export default function EvaluacionModuloScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const { idModulo, moduloNombre } = route.params || {};

  const [evaluacion, setEvaluacion] = useState(null);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState(null);

  // Animacion del banner de desbloqueo
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cargarEvaluacion();
  }, []);

  async function cargarEvaluacion() {
    try {
      setCargando(true);
      setError(null);
      const res = await api.get(`/respuestas/evaluacion/${idModulo}`, { params: { idUsuario: usuario.id } });
      const data = res.data && res.data.data;
      setEvaluacion(data);

      // Animar banner si aproba
      if (data && data.evaluacion && data.evaluacion.porcentajeAciertos >= 80) {
        setTimeout(() => {
          Animated.spring(bannerAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }, 600);
      }
    } catch {
      setError('No se pudo cargar la evaluacion. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  // ── Pantallas de estado ──────────────────────────────────────────────────────
  if (cargando) {
    return (
      <SafeAreaView style={st.centered}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={st.loadingText}>Calculando tu puntaje...</Text>
      </SafeAreaView>
    );
  }

  if (error || !evaluacion) {
    return (
      <SafeAreaView style={st.centered}>
        <Feather name="alert-circle" size={44} color="#d1d5db" />
        <Text style={st.errorText}>{error || 'Sin datos de evaluacion'}</Text>
        <TouchableOpacity style={st.retryBtn} onPress={cargarEvaluacion} activeOpacity={0.8}>
          <Text style={st.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Datos del backend (H.U. 314) ─────────────────────────────────────────────
  const ev         = evaluacion.evaluacion || {};
  const modulo     = evaluacion.modulo || {};
  const xpEnClase  = evaluacion.xpEnClase || 0;
  const pct        = ev.porcentajeAciertos || 0;
  const aciertos   = ev.respuestasCorrectas || 0;
  const errores    = ev.respuestasIncorrectas || 0;
  const total      = ev.totalRespuestas || 0;
  const retroMsg   = ev.retroalimentacion || '';
  const aprobado   = pct >= 80;

  // Banner de desbloqueo animado
  const bannerScale = bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const bannerOpac  = bannerAnim;

  return (
    <SafeAreaView style={st.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={st.header}>
        <View style={st.headerContent}>
          <Feather name="award" size={18} color="#111827" style={{ marginRight: 8 }} />
          <Text style={st.headerTitle}>Resultados del módulo</Text>
        </View>
        <Text style={st.headerSub} numberOfLines={1}>
          {moduloNombre || modulo.nombre || ''}
        </Text>
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Circulo de puntaje ──────────────────────────────────────────── */}
        <View style={st.circuloWrap}>
          <CirculoPuntaje porcentaje={pct} />
        </View>

        {/* ── Banner de modulo desbloqueado (H.U. 314) ───────────────────── */}
        {aprobado && (
          <Animated.View
            style={[
              st.bannerDesbloqueado,
              { transform: [{ scale: bannerScale }], opacity: bannerOpac },
            ]}
          >
            <View style={st.bannerIconWrap}>
              <Feather name="unlock" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.bannerTitle}>¡Módulo superado!</Text>
              <Text style={st.bannerSub}>El siguiente módulo se ha desbloqueado.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              <Feather name="star" size={16} color="#f59e0b" />
              <Feather name="star" size={16} color="#f59e0b" />
              <Feather name="star" size={16} color="#f59e0b" />
            </View>
          </Animated.View>
        )}

        {/* ── Stats: aciertos / errores / total ─────────────────────────── */}
        <View style={st.statsRow}>
          <StatCard
            icon="check-circle"
            iconColor="#16a34a"
            iconBg="#dcfce7"
            titulo="Aciertos"
            valor={aciertos}
            subtitulo={total > 0 ? `de ${total}` : null}
          />
          <StatCard
            icon="x-circle"
            iconColor="#ef4444"
            iconBg="#fee2e2"
            titulo="Errores"
            valor={errores}
            subtitulo={null}
          />
          <StatCard
            icon="zap"
            iconColor="#f59e0b"
            iconBg="#fef9c3"
            titulo="XP total"
            valor={xpEnClase}
            subtitulo="en clase"
          />
        </View>

        {/* ── Barra de desempeno ───────────────────────────────────────────── */}
        <View style={st.barCard}>
          <View style={st.barCardHeader}>
            <Text style={st.barCardTitle}>Desempeño</Text>
            <Text style={[
              st.barCardPct,
              { color: aprobado ? '#16a34a' : '#ef4444' },
            ]}>
              {Math.round(pct)}%
            </Text>
          </View>
          <View style={st.barBg}>
            <View style={[
              st.barFill,
              {
                width: Math.min(pct, 100) + '%',
                backgroundColor: pct >= 80 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#ef4444',
              },
            ]} />
          </View>
          {/* Marca del 80% */}
          <View style={st.marcaWrap}>
            <View style={st.marca80} />
            <Text style={st.marca80Text}>80% mínimo</Text>
          </View>
        </View>

        {/* ── Retroalimentacion general (H.U. 207, 314) ──────────────────── */}
        {retroMsg ? (
          <View style={[
            st.retroCard,
            { borderColor: aprobado ? '#16a34a' : '#f59e0b' },
          ]}>
            <View style={st.retroIconWrap}>
              <Feather
                name={aprobado ? 'message-circle' : 'alert-circle'}
                size={20}
                color={aprobado ? '#16a34a' : '#f59e0b'}
              />
              <Text style={st.retroTitulo}>Retroalimentación</Text>
            </View>
            <Text style={st.retroMsg}>{retroMsg}</Text>
          </View>
        ) : null}

        {/* ── Mensaje extra si no aprobo ───────────────────────────────────── */}
        {!aprobado && (
          <View style={st.noAprobadoCard}>
            <Feather name="refresh-cw" size={18} color="#6b7280" style={{ marginRight: 10 }} />
            <Text style={st.noAprobadoText}>
              Necesitas al menos 80% para desbloquear el siguiente módulo. ¡Puedes volver a intentarlo!
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={st.footer}>
        {/* Reintentar módulo */}
        <TouchableOpacity
          style={st.botonSecundario}
          onPress={() => navigation.replace('Ejercicio', {
            idModulo,
            moduloNombre: moduloNombre || modulo.nombre,
            reintentar: true,
          })}
          activeOpacity={0.85}
        >
          <Feather name="refresh-cw" size={16} color="#374151" style={{ marginRight: 8 }} />
          <Text style={st.botonSecundarioText}>Reintentar módulo</Text>
        </TouchableOpacity>

        {/* Volver al mapa */}
        <TouchableOpacity
          style={[st.botonPrimario, { marginTop: 10 }]}
          onPress={() => navigation.navigate('Tabs')}
          activeOpacity={0.85}
        >
          <Feather name="map" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={st.botonPrimarioText}>Volver al mapa</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f9fafb' },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center',
             backgroundColor: '#f9fafb', paddingHorizontal: 32 },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  headerSub:     { fontSize: 13, color: '#6b7280', paddingLeft: 26 },

  // Scroll
  scroll: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 20 },

  // Circulo puntaje
  circuloWrap: { alignItems: 'center', marginBottom: 24 },
  circulo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  circuloEmoji: { fontSize: 30, marginBottom: 2 },
  circuloPct:   { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  circuloLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Banner desbloqueado
  bannerDesbloqueado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  bannerSub:   { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  bannerStars: { fontSize: 20 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValor:  { fontSize: 22, fontWeight: '900', color: '#111827', lineHeight: 26 },
  statTitulo: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginTop: 2, textAlign: 'center' },
  statSub:    { fontSize: 10, color: '#9ca3af', marginTop: 1 },

  // Barra de desempeno
  barCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  barCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  barCardTitle:  { fontSize: 14, fontWeight: '700', color: '#374151' },
  barCardPct:    { fontSize: 14, fontWeight: '800' },
  barBg:         { height: 10, backgroundColor: '#f3f4f6', borderRadius: 5, marginBottom: 8 },
  barFill:       { height: '100%', borderRadius: 5 },
  marcaWrap:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marca80:       { width: 2, height: 12, backgroundColor: '#9ca3af', borderRadius: 1 },
  marca80Text:   { fontSize: 11, color: '#9ca3af' },

  // Retroalimentacion (H.U. 207)
  retroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  retroIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  retroTitulo:   { fontSize: 14, fontWeight: '700', color: '#374151' },
  retroMsg:      { fontSize: 14, color: '#374151', lineHeight: 22 },

  // No aprobado
  noAprobadoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 10,
  },
  noAprobadoText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 20 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  botonPrimario: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 17,
  },
  botonPrimarioText: { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.2 },

  botonSecundario: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 15,
  },
  botonSecundarioText: { fontSize: 15, fontWeight: '700', color: '#374151', letterSpacing: 0.1 },

  // Loading / error
  loadingText: { marginTop: 14, fontSize: 14, color: '#6b7280', textAlign: 'center' },
  errorText:   { marginTop: 14, fontSize: 14, color: '#ef4444', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  retryText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
