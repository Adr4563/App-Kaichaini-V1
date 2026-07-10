// MapaScreen.js
// H.U. 117 - Vista del mapa de aprendizaje por curso/clase y bimestre
// H.U. 123 - Visualizacion de progreso por modulo
// H.U. 302 - Barra de XP dentro del mapa de cada clase

import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── Constantes ────────────────────────────────────────────────────────────────
const BIMESTRES = [
  { label: 'I',   value: 1 },
  { label: 'II',  value: 2 },
  { label: 'III', value: 3 },
  { label: 'IV',  value: 4 },
];

const LIGA_XP = {
  Amauta: { threshold: 500,  next: 'Panaca' },
  Panaca: { threshold: 1000, next: 'Auqui'  },
  Auqui:  { threshold: 2000, next: 'Inca'   },
  Inca:   { threshold: null, next: null      },
};

// Icono de curso segun nombre
function iconoCurso(nombre) {
  if (!nombre) return 'book';
  var n = nombre.toLowerCase();
  if (n.includes('mat') || n.includes('algebra') || n.includes('calculo')) return 'hash';
  if (n.includes('com') || n.includes('leng') || n.includes('lite'))       return 'book-open';
  if (n.includes('cien') || n.includes('bio') || n.includes('fis'))        return 'zap';
  if (n.includes('hist') || n.includes('geo') || n.includes('social'))     return 'globe';
  if (n.includes('arte') || n.includes('musica'))                          return 'music';
  return 'book';
}

// Config visual por estado
var CFG = {
  disponible:  { circleBg: '#111827', iconColor: '#ffffff', icon: 'star',       ring: '#111827' },
  en_progreso: { circleBg: '#f59e0b', iconColor: '#ffffff', icon: 'play',       ring: '#fcd34d' },
  completado:  { circleBg: '#16a34a', iconColor: '#ffffff', icon: 'check',      ring: '#86efac' },
  bloqueado:   { circleBg: '#e5e7eb', iconColor: '#9ca3af', icon: 'lock',       ring: '#e5e7eb' },
};

// ── Calculo de estado del modulo ──────────────────────────────────────────────
function calcularEstado(progreso, index, lista) {
  var comp  = (progreso && progreso.ejerciciosCompletados) || 0;
  var total = (progreso && progreso.totalEjercicios) || 0;

  if (comp > 0 && comp < total) return 'en_progreso';
  if (total > 0 && comp >= total) return 'completado';
  if (index === 0) return 'disponible';

  var ant      = lista[index - 1];
  var antProg  = ant && ant.progreso;
  var antComp  = (antProg && antProg.ejerciciosCompletados) || 0;
  var antTotal = (antProg && antProg.totalEjercicios) || 0;
  return (antTotal > 0 && antComp >= antTotal) ? 'disponible' : 'bloqueado';
}

// ── Nodo del modulo (circulo estilo Duolingo) ─────────────────────────────────
function ModuloNodo({ item, index, lista, screenWidth }) {
  var navigation = useNavigation();
  var modulo  = item.modulo;
  var progreso = item.progreso;
  var estado  = calcularEstado(progreso, index, lista);
  var cfg     = CFG[estado];
  var comp    = (progreso && progreso.ejerciciosCompletados) || 0;
  var total   = (progreso && progreso.totalEjercicios) || 0;
  var pct     = total > 0 ? Math.round((comp / total) * 100) : 0;
  var bloq    = estado === 'bloqueado';

  // Posicion horizontal alternada: izquierda / derecha
  var isLeft  = index % 2 === 0;
  var nodeSize = 72;
  var padding  = 36;

  function handlePress() {
    if (bloq) return;
    navigation.navigate('Ejercicio', {
      idModulo: modulo.id,
      moduloNombre: modulo.nombre,
    });
  }

  return (
    <View>
      {/* Nodo */}
      <View style={[st.nodoRow, { justifyContent: isLeft ? 'flex-start' : 'flex-end' }]}>
        <TouchableOpacity
          activeOpacity={bloq ? 1 : 0.75}
          onPress={handlePress}
          disabled={bloq}
          style={{ alignItems: 'center' }}
        >
          {/* Anillo exterior (pulsante visual para disponible) */}
          <View style={[
            st.ring,
            {
              borderColor: cfg.ring,
              width: nodeSize + 12,
              height: nodeSize + 12,
              borderRadius: (nodeSize + 12) / 2,
              borderWidth: estado === 'disponible' || estado === 'en_progreso' ? 3 : 0,
            },
          ]}>
            {/* Circulo del nodo */}
            <View style={[
              st.nodoCirculo,
              {
                width: nodeSize,
                height: nodeSize,
                borderRadius: nodeSize / 2,
                backgroundColor: cfg.circleBg,
              },
            ]}>
              <Feather name={cfg.icon} size={28} color={cfg.iconColor} />
            </View>
          </View>

          {/* Numero del modulo */}
          <View style={[st.numBadge, { backgroundColor: bloq ? '#d1d5db' : '#111827' }]}>
            <Text style={st.numBadgeText}>{modulo.orden != null ? modulo.orden : index + 1}</Text>
          </View>

          {/* Nombre */}
          <Text
            style={[st.nodoNombre, { color: bloq ? '#9ca3af' : '#111827' }]}
            numberOfLines={2}
          >
            {modulo.nombre}
          </Text>

          {/* H.U. 123 - Progreso */}
          {!bloq && total > 0 && (
            <View style={st.progresoWrap}>
              <View style={st.barBg}>
                <View style={[
                  st.barFill,
                  {
                    width: pct + '%',
                    backgroundColor: pct === 100 ? '#16a34a' : '#f59e0b',
                  },
                ]} />
              </View>
              <Text style={st.progresoTxt}>{comp}/{total}</Text>
            </View>
          )}

          {/* Indicador de tap para modulos disponibles */}
          {(estado === 'disponible' || estado === 'en_progreso') && (
            <View style={st.tapBadge}>
              <Feather name="play" size={9} color="#ffffff" />
              <Text style={st.tapBadgeText}>
                {estado === 'completado' ? 'Repasar' : 'Iniciar'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Conector entre nodos (camino zigzag) ──────────────────────────────────────
function Conector({ fromLeft, screenWidth }) {
  // fromLeft: el nodo anterior estaba a la izquierda
  // El camino va diagonalmente al otro lado
  var nodeSize  = 72;
  var padding   = 36;
  var leftCX    = padding + nodeSize / 2;         // centro X del nodo izquierdo
  var rightCX   = screenWidth - padding - nodeSize / 2; // centro X del nodo derecho
  var height    = 80;
  var dotCount  = 6;

  return (
    <View style={{ height: height, position: 'relative' }}>
      {Array.from({ length: dotCount }).map(function(_, i) {
        var t   = i / (dotCount - 1); // 0..1
        var cx  = fromLeft
          ? leftCX  + t * (rightCX - leftCX)
          : rightCX + t * (leftCX  - rightCX);
        var cy  = t * height;
        return (
          <View
            key={i}
            style={[
              st.dot,
              {
                left: cx - 5,
                top:  cy,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function MapaScreen() {
  var { usuario } = useAuth();
  var { width } = useWindowDimensions();

  var [clases,       setClases]       = useState([]);
  var [tabActivo,    setTabActivo]    = useState(0);
  var [bimestre,     setBimestre]     = useState(1);
  var [modulos,      setModulos]      = useState([]);
  var [xpClase,      setXpClase]      = useState(0);
  var [ligaNombre,   setLigaNombre]   = useState('Amauta');
  var [cargando,     setCargando]     = useState(true);
  var [cargandoMapa, setCargandoMapa] = useState(false);
  var [errorMapa,    setErrorMapa]    = useState(null);

  function cargarMapa(idClase, bim) {
    setCargandoMapa(true);
    setModulos([]);
    setErrorMapa(null);
    api.get('/mapa/clase/' + idClase + '/bimestre/' + bim, { params: { idUsuario: usuario.id } })
      .then(function(res) {
        var data = res.data && res.data.data;
        setModulos((data && data.modulos) || []);
      })
      .catch(function(err) {
        var msg = (err.response && err.response.data && err.response.data.error && err.response.data.error.message)
          || err.message || 'Error al cargar modulos';
        setErrorMapa(msg);
      })
      .finally(function() { setCargandoMapa(false); });
  }

  function cargarXP(idClase) {
    api.get('/xp/clase/' + idClase, { params: { idUsuario: usuario.id } })
      .then(function(res) {
        var data = res.data && res.data.data;
        setXpClase((data && data.xpTotal) || 0);
      })
      .catch(function() { setXpClase(0); });
  }

  function cargarClases() {
    return api.get('/clases/mis-clases', { params: { idUsuario: usuario.id, rol: usuario.rol } })
      .then(function(res) {
        var lista = (res.data && res.data.data) || [];
        setClases(lista);
        if (lista.length > 0) {
          cargarMapa(lista[0].id, 1);
          cargarXP(lista[0].id);
        }
      })
      .catch(function() {});
  }

  function cargarLiga() {
    return api.get('/perfil', { params: { idUsuario: usuario.id } })
      .then(function(res) {
        var liga = res.data && res.data.data && res.data.data.liga;
        setLigaNombre((liga && liga.nombre) || 'Amauta');
      })
      .catch(function() {});
  }

  useFocusEffect(
    useCallback(function() {
      setCargando(true);
      Promise.all([cargarClases(), cargarLiga()]).finally(function() {
        setCargando(false);
      });
    }, []),
  );

  function cambiarClase(idx) {
    setTabActivo(idx);
    setBimestre(1);
    if (clases[idx]) {
      cargarMapa(clases[idx].id, 1);
      cargarXP(clases[idx].id);
    }
  }

  function cambiarBimestre(bim) {
    setBimestre(bim);
    if (clases[tabActivo]) cargarMapa(clases[tabActivo].id, bim);
  }

  if (cargando) {
    return (
      <View style={st.centered}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  var claseActiva   = clases[tabActivo];
  var ligaInfo      = LIGA_XP[ligaNombre] || LIGA_XP.Amauta;
  var xpMax         = ligaInfo.threshold || (xpClase > 0 ? xpClase : 1);
  var xpPct         = ligaInfo.threshold
    ? Math.min(Math.round((xpClase / xpMax) * 100), 100)
    : 100;
  var bimestreLabel = (BIMESTRES.find(function(b) { return b.value === bimestre; }) || {}).label;

  return (
    <View style={st.root}>

      {/* ── Header ─────────────────────────────────────── */}
      <View style={st.header}>
        <View style={st.headerLeft}>
          <Feather name="map" size={20} color="#111827" style={{ marginRight: 8 }} />
          <Text style={st.headerTitle}>Mapa</Text>
        </View>
        {claseActiva && (
          <Text style={st.headerSub} numberOfLines={1}>{claseActiva.nombre}</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Tabs de clase ──────────────────────────────── */}
        {clases.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.tabsWrap}
          >
            {clases.map(function(c, i) {
              var activo = tabActivo === i;
              var icono  = iconoCurso(c.curso || c.nombre);
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={function() { cambiarClase(i); }}
                  activeOpacity={0.8}
                  style={[st.tab, activo ? st.tabOn : st.tabOff]}
                >
                  <Feather name={icono} size={14} color={activo ? '#ffffff' : '#6b7280'} />
                  <Text style={[st.tabText, { color: activo ? '#ffffff' : '#6b7280' }]}>
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Tarjeta XP (H.U. 302) ─────────────────────── */}
        {claseActiva && (
          <View style={st.xpCard}>
            <View style={st.xpRow}>
              <View style={st.xpLeft}>
                <View style={st.xpLigaRow}>
                  <Feather name="award" size={13} color="#fcd34d" />
                  <Text style={st.xpLigaText}>{ligaNombre}</Text>
                </View>
                <Text style={st.xpClaseText}>{claseActiva.nombre}</Text>
              </View>
              <View style={st.xpRight}>
                <Text style={st.xpNum}>{xpClase}</Text>
                <Text style={st.xpXp}>XP</Text>
              </View>
            </View>
            <View style={st.xpBarBg}>
              <View style={[st.xpBarFill, { width: xpPct + '%' }]} />
            </View>
            <View style={st.xpMetaRow}>
              {ligaInfo.next ? (
                <Text style={st.xpMetaText}>
                  {Math.max(xpMax - xpClase, 0)} XP para {ligaInfo.next}
                </Text>
              ) : (
                <Text style={st.xpMetaText}>Nivel maximo alcanzado</Text>
              )}
              <Text style={st.xpPctText}>{xpPct}%</Text>
            </View>
          </View>
        )}

        {/* ── Selector de bimestre ───────────────────────── */}
        <View style={st.bimRow}>
          {BIMESTRES.map(function(b) {
            var on = bimestre === b.value;
            return (
              <TouchableOpacity
                key={b.value}
                onPress={function() { cambiarBimestre(b.value); }}
                activeOpacity={0.8}
                style={[st.bimBtn, on && st.bimBtnOn]}
              >
                <Text style={[st.bimText, on && st.bimTextOn]}>Bim {b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Cuerpo del mapa ────────────────────────────── */}
        {cargandoMapa ? (
          <View style={st.mapaCenter}>
            <ActivityIndicator size="large" color="#111827" />
            <Text style={st.mapaCenterText}>Cargando modulos...</Text>
          </View>

        ) : errorMapa ? (
          <View style={st.mapaCenter}>
            <Feather name="alert-circle" size={40} color="#ef4444" />
            <Text style={[st.mapaCenterText, { color: '#ef4444', marginTop: 10 }]}>{errorMapa}</Text>
          </View>

        ) : modulos.length === 0 ? (
          <View style={st.mapaCenter}>
            <Feather name="map" size={52} color="#d1d5db" />
            <Text style={st.emptyTitle}>Sin modulos</Text>
            <Text style={st.emptySub}>El docente aun no asigno modulos para el Bimestre {bimestreLabel}.</Text>
          </View>

        ) : (
          <View style={{ paddingBottom: 20, paddingTop: 8 }}>
            {/* Encabezado del bimestre */}
            <View style={st.bimHeader}>
              <View style={st.bimHeaderLine} />
              <Text style={st.bimHeaderText}>Bimestre {bimestreLabel}</Text>
              <View style={st.bimHeaderLine} />
            </View>

            {/* Camino de modulos */}
            {modulos.map(function(item, index) {
              var isLast = index === modulos.length - 1;
              var isLeft = index % 2 === 0;
              return (
                <View key={item.modulo.id}>
                  <ModuloNodo
                    item={item}
                    index={index}
                    lista={modulos}
                    screenWidth={width}
                  />
                  {!isLast && (
                    <Conector fromLeft={isLeft} screenWidth={width} />
                  )}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
var st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f3f4f6' },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  headerSub:   { fontSize: 13, color: '#6b7280', maxWidth: '50%' },

  // Tabs
  tabsWrap: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  tab:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  tabOn:    { backgroundColor: '#111827', borderColor: '#111827' },
  tabOff:   { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  tabText:  { fontSize: 13, fontWeight: '600' },

  // XP card
  xpCard:      { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#111827', borderRadius: 20, padding: 18 },
  xpRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  xpLeft:      { flex: 1 },
  xpLigaRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  xpLigaText:  { fontSize: 11, color: '#fcd34d', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  xpClaseText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  xpRight:     { alignItems: 'flex-end' },
  xpNum:       { fontSize: 30, fontWeight: '800', color: '#ffffff', lineHeight: 34 },
  xpXp:        { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  xpBarBg:     { height: 7, backgroundColor: '#374151', borderRadius: 4, marginBottom: 10 },
  xpBarFill:   { height: '100%', backgroundColor: '#4ade80', borderRadius: 4 },
  xpMetaRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  xpMetaText:  { fontSize: 12, color: '#9ca3af' },
  xpPctText:   { fontSize: 12, color: '#4ade80', fontWeight: '700' },

  // Bimestre
  bimRow:    { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 4 },
  bimBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', backgroundColor: '#ffffff' },
  bimBtnOn:  { backgroundColor: '#111827', borderColor: '#111827' },
  bimText:   { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  bimTextOn: { color: '#ffffff' },

  // Cuerpo vacio / loading
  mapaCenter:    { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  mapaCenterText:{ marginTop: 14, fontSize: 14, color: '#6b7280', textAlign: 'center' },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 14, marginBottom: 6 },
  emptySub:      { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

  // Encabezado bimestre
  bimHeader:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  bimHeaderLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  bimHeaderText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1 },

  // Nodo
  nodoRow:     { paddingHorizontal: 20 },
  ring:        { justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
  nodoCirculo: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
  numBadge:    { marginTop: -8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, zIndex: 1 },
  numBadgeText:{ fontSize: 10, fontWeight: '800', color: '#ffffff' },
  nodoNombre:  { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 6, maxWidth: 130, lineHeight: 18 },

  // Progreso bajo el nodo (H.U. 123)
  progresoWrap: { marginTop: 8, alignItems: 'center', width: 120 },
  barBg:        { width: '100%', height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 4 },
  barFill:      { height: '100%', borderRadius: 3 },
  progresoTxt:  { fontSize: 10, color: '#6b7280', fontWeight: '600' },

  // Conector / puntos del camino
  dot: {
    position: 'absolute',
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
  },

  // Badge "Iniciar" bajo el nodo presionable
  tapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tapBadgeText: { fontSize: 9, fontWeight: '700', color: '#ffffff', letterSpacing: 0.4 },
});
