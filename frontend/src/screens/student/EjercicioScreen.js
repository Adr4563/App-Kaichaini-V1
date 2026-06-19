// EjercicioScreen.js
// H.U. 309 - Respuesta y envio de ejercicio por parte del estudiante
// H.U. 311 - Ejercicio tipo clic en imagen o numero (vista estudiante)
// H.U. 312 - Ejercicio tipo seleccion multiple (vista estudiante)
// H.U. 207 - Retroalimentacion automatica al cerrar ejercicio

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ── Letras para seleccion multiple ───────────────────────────────────────────
const LETRAS = ['A', 'B', 'C', 'D'];

// ── Colores ───────────────────────────────────────────────────────────────────
const COLORES = {
  correctoBg:      '#dcfce7',
  correctoBorder:  '#16a34a',
  correctoText:    '#15803d',
  incorrectoBg:    '#fee2e2',
  incorrectoBorder:'#ef4444',
  incorrectoText:  '#dc2626',
  selBg:           '#111827',
  selBorder:       '#111827',
  selText:         '#ffffff',
  defBg:           '#ffffff',
  defBorder:       '#e5e7eb',
  defText:         '#111827',
};

// ── Helper: parsear opciones ──────────────────────────────────────────────────
function parsearOpciones(opcionesRaw) {
  try {
    if (Array.isArray(opcionesRaw)) return opcionesRaw;
    return JSON.parse(opcionesRaw || '[]');
  } catch {
    return [];
  }
}

// ── Componente: Barra de progreso superior ────────────────────────────────────
function BarraProgreso({ actual, total }) {
  const pct = total > 0 ? Math.round((actual / total) * 100) : 0;
  return (
    <View style={st.progressWrap}>
      <View style={st.progressBg}>
        <View style={[st.progressFill, { width: pct + '%' }]} />
      </View>
    </View>
  );
}

// ── Componente: Ejercicio Seleccion Multiple (H.U. 312) ───────────────────────
function EjercicioSeleccionMultiple({ opciones, seleccionada, esCorrecta, confirmado, onSelect }) {
  return (
    <View style={st.opcionesWrap}>
      {opciones.map((opcion, i) => {
        const letra = LETRAS[i] || String(i + 1);
        const esEsta = seleccionada === opcion;

        let bgColor    = COLORES.defBg;
        let borderColor = COLORES.defBorder;
        let textColor  = COLORES.defText;
        let letraBg    = '#f3f4f6';
        let letraColor = '#6b7280';

        if (confirmado && esEsta) {
          if (esCorrecta) {
            bgColor     = COLORES.correctoBg;
            borderColor = COLORES.correctoBorder;
            textColor   = COLORES.correctoText;
            letraBg     = COLORES.correctoBorder;
            letraColor  = '#ffffff';
          } else {
            bgColor     = COLORES.incorrectoBg;
            borderColor = COLORES.incorrectoBorder;
            textColor   = COLORES.incorrectoText;
            letraBg     = COLORES.incorrectoBorder;
            letraColor  = '#ffffff';
          }
        } else if (!confirmado && esEsta) {
          bgColor     = '#f9fafb';
          borderColor = COLORES.selBorder;
          textColor   = COLORES.selText === '#ffffff' ? '#111827' : COLORES.selText;
          letraBg     = '#111827';
          letraColor  = '#ffffff';
        }

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={confirmado ? 1 : 0.75}
            onPress={() => !confirmado && onSelect(opcion)}
            style={[st.opcionBtn, { backgroundColor: bgColor, borderColor }]}
          >
            {/* Badge de letra */}
            <View style={[st.letraBadge, { backgroundColor: letraBg }]}>
              <Text style={[st.letraText, { color: letraColor }]}>{letra}</Text>
            </View>

            {/* Texto de la opcion */}
            <Text style={[st.opcionText, { color: textColor }]} numberOfLines={4}>
              {opcion}
            </Text>

            {/* Icono de resultado */}
            {confirmado && esEsta && (
              <Feather
                name={esCorrecta ? 'check-circle' : 'x-circle'}
                size={20}
                color={esCorrecta ? COLORES.correctoBorder : COLORES.incorrectoBorder}
                style={st.opcionIcon}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Componente: Ejercicio Clic Numero (H.U. 311) ──────────────────────────────
function EjercicioClicNumero({ opciones, seleccionada, esCorrecta, confirmado, onSelect }) {
  return (
    <View style={st.numerosGrid}>
      {opciones.map((opcion, i) => {
        const esEsta = seleccionada === opcion;

        let bgColor     = COLORES.defBg;
        let borderColor = COLORES.defBorder;
        let textColor   = COLORES.defText;

        if (confirmado && esEsta) {
          bgColor     = esCorrecta ? COLORES.correctoBg    : COLORES.incorrectoBg;
          borderColor = esCorrecta ? COLORES.correctoBorder : COLORES.incorrectoBorder;
          textColor   = esCorrecta ? COLORES.correctoText  : COLORES.incorrectoText;
        } else if (!confirmado && esEsta) {
          bgColor     = COLORES.selBg;
          borderColor = COLORES.selBorder;
          textColor   = COLORES.selText;
        }

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={confirmado ? 1 : 0.75}
            onPress={() => !confirmado && onSelect(opcion)}
            style={[st.numeroBtn, { backgroundColor: bgColor, borderColor }]}
          >
            <Text style={[st.numeroText, { color: textColor }]}>{opcion}</Text>

            {/* Indicador de correcto / incorrecto */}
            {confirmado && esEsta && (
              <View style={[
                st.numeroBadge,
                { backgroundColor: esCorrecta ? COLORES.correctoBorder : COLORES.incorrectoBorder },
              ]}>
                <Feather name={esCorrecta ? 'check' : 'x'} size={11} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────────
export default function EjercicioScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const { idModulo, moduloNombre, reintentar = false } = route.params || {};

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [ejercicios,   setEjercicios]  = useState([]);
  const [indice,       setIndice]      = useState(0);
  const [seleccionada, setSel]         = useState(null);
  const [enviando,     setEnviando]    = useState(false);
  const [resultado,    setResultado]   = useState(null);   // data del backend
  const [cargando,     setCargando]    = useState(true);
  const [error,        setError]       = useState(null);

  // Animacion XP
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Timer de auto-avance
  const timerRef = useRef(null);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  const cargarEjercicios = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await api.get('/ejercicios', { params: { idModulo } });
      const todos = (res.data && res.data.data) || [];

      // Sin ejercicios disponibles en este módulo (aún no tienen opciones)
      if (todos.length === 0) {
        setError('Este módulo no tiene ejercicios disponibles todavía.\nEl docente debe completar los ejercicios.');
        return;
      }

      // En modo reintentar se muestran todos; si no, solo los pendientes
      if (reintentar) {
        setEjercicios(todos);
        return;
      }

      // Solo los no respondidos (H.U. 309)
      const pendientes = todos.filter(e => !e.respondido);

      if (pendientes.length === 0) {
        // Todos ya respondidos → ir directo a evaluacion (H.U. 314)
        navigation.replace('EvaluacionModulo', { idModulo, moduloNombre });
        return;
      }
      setEjercicios(pendientes);
    } catch {
      setError('No se pudieron cargar los ejercicios. Verifica tu conexion.');
    } finally {
      setCargando(false);
    }
  }, [idModulo]);

  useEffect(() => {
    cargarEjercicios();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Animar entrada de nueva pregunta
  useEffect(() => {
    if (!cargando && ejercicios.length > 0) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [indice, cargando]);

  // ── Confirmar respuesta (H.U. 309) ──────────────────────────────────────────
  async function confirmarRespuesta() {
    if (!seleccionada || enviando || resultado) return;

    const ejercicio = ejercicios[indice];
    setEnviando(true);

    try {
      const res = await api.post('/respuestas', {
        idEstudiante: usuario.id,
        idEjercicio: ejercicio.id,
        respuesta: seleccionada,
        reintentar,
      });

      const data = res.data && res.data.data;
      setResultado(data);

      // Animacion XP si es correcto (H.U. 311, 312)
      if (data && data.esCorrecta && data.xpGanado > 0) {
        Animated.sequence([
          Animated.timing(xpAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.delay(1000),
          Animated.timing(xpAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }

      // Auto-avance tras 1.5s (H.U. 309)
      timerRef.current = setTimeout(() => avanzarSiguiente(), 1500);
    } catch {
      // Error silencioso: re-habilitar para que el alumno intente de nuevo
    } finally {
      setEnviando(false);
    }
  }

  // ── Avanzar al siguiente ejercicio o evaluacion ──────────────────────────────
  function avanzarSiguiente() {
    if (timerRef.current) clearTimeout(timerRef.current);

    const siguiente = indice + 1;
    if (siguiente >= ejercicios.length) {
      // Completado → Evaluacion del modulo (H.U. 314)
      navigation.replace('EvaluacionModulo', { idModulo, moduloNombre });
    } else {
      setSel(null);
      setResultado(null);
      setIndice(siguiente);
    }
  }

  // ── Pantallas de estado ──────────────────────────────────────────────────────
  if (cargando) {
    return (
      <SafeAreaView style={st.centered}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={st.loadingText}>Cargando ejercicios...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={st.centered}>
        <Feather name="wifi-off" size={44} color="#d1d5db" />
        <Text style={st.errorText}>{error}</Text>
        <TouchableOpacity style={st.retryBtn} onPress={cargarEjercicios} activeOpacity={0.8}>
          <Text style={st.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Render principal ─────────────────────────────────────────────────────────
  const ejercicioActual = ejercicios[indice];
  const opciones        = parsearOpciones(ejercicioActual?.opciones);
  const esConfirmado    = resultado !== null;
  const esCorrecta      = resultado?.esCorrecta === true;
  const xpGanado        = resultado?.xpGanado || 0;
  const retroMsg        = resultado?.retroalimentacion || null;
  const confirmarActivo = !!seleccionada && !enviando && !esConfirmado;

  // Valores animados del XP flotante
  const xpTranslate = xpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
  const xpOpacity   = xpAnim;

  return (
    <SafeAreaView style={st.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={st.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={st.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="x" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={st.headerMid}>
          <Text style={st.headerTitle} numberOfLines={1}>
            {moduloNombre || 'Ejercicios'}
          </Text>
          <Text style={st.headerCounter}>
            {indice + 1} / {ejercicios.length}
          </Text>
        </View>

        {/* Estrella de puntos */}
        <View style={st.headerRight}>
          <Feather name="star" size={14} color="#f59e0b" />
        </View>
      </View>

      {/* ── Barra de progreso (H.U. 309) ───────────────────────────────────── */}
      <BarraProgreso actual={indice} total={ejercicios.length} />

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Tarjeta del ejercicio ───────────────────────────────────────── */}
        <Animated.View
          style={[
            st.ejercicioCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Badge tipo */}
          <View style={st.tipoBadge}>
            <Feather
              name={ejercicioActual?.tipo === 'seleccion_multiple' ? 'list' : 'hash'}
              size={11}
              color="#9ca3af"
            />
            <Text style={st.tipoText}>
              {ejercicioActual?.tipo === 'seleccion_multiple'
                ? 'Selección múltiple'
                : 'Clic en número'}
            </Text>
          </View>

          {/* Enunciado */}
          <Text style={st.enunciado}>{ejercicioActual?.enunciado}</Text>
        </Animated.View>

        {/* ── Opciones de respuesta ────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {ejercicioActual?.tipo === 'seleccion_multiple' ? (
            // H.U. 312 - Seleccion multiple
            <EjercicioSeleccionMultiple
              opciones={opciones}
              seleccionada={seleccionada}
              esCorrecta={esCorrecta}
              confirmado={esConfirmado}
              onSelect={setSel}
            />
          ) : (
            // H.U. 311 - Clic en numero
            <EjercicioClicNumero
              opciones={opciones}
              seleccionada={seleccionada}
              esCorrecta={esCorrecta}
              confirmado={esConfirmado}
              onSelect={setSel}
            />
          )}
        </Animated.View>

        {/* ── Retroalimentacion (H.U. 207, 309) ─────────────────────────── */}
        {esConfirmado && (
          <View style={[
            st.feedbackCard,
            { borderColor: esCorrecta ? COLORES.correctoBorder : COLORES.incorrectoBorder },
          ]}>
            <View style={st.feedbackRow}>
              <Feather
                name={esCorrecta ? 'check-circle' : 'x-circle'}
                size={22}
                color={esCorrecta ? COLORES.correctoBorder : COLORES.incorrectoBorder}
              />
              <Text style={[
                st.feedbackTitle,
                { color: esCorrecta ? COLORES.correctoText : COLORES.incorrectoText },
              ]}>
                {esCorrecta ? '¡Correcto!' : 'Incorrecto'}
              </Text>
            </View>

            {/* Mensaje de retroalimentacion (H.U. 207) */}
            {retroMsg ? (
              <Text style={st.feedbackMsg}>{retroMsg}</Text>
            ) : null}

            {/* XP ganado (H.U. 311, 312) */}
            {esCorrecta && xpGanado > 0 && (
              <View style={st.xpChip}>
                <Feather name="zap" size={13} color="#f59e0b" />
                <Text style={st.xpChipText}>+{xpGanado} XP</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 178 }} />
      </ScrollView>

      {/* ── XP flotante animado (H.U. 311, 312) ──────────────────────────── */}
      {xpGanado > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            st.xpFloat,
            {
              opacity: xpOpacity,
              transform: [{ translateY: xpTranslate }],
            },
          ]}
        >
          <Feather name="zap" size={16} color="#fbbf24" />
          <Text style={st.xpFloatText}>+{xpGanado} XP</Text>
        </Animated.View>
      )}

      {/* ── Footer: boton Confirmar / Continuar (H.U. 309) ────────────────── */}
      <View style={st.footer}>
        {esConfirmado ? (
          // Boton Continuar (manual, aunque hay auto-avance)
          <TouchableOpacity
            style={[
              st.confirmarBtn,
              { backgroundColor: esCorrecta ? COLORES.correctoBorder : '#374151' },
            ]}
            onPress={avanzarSiguiente}
            activeOpacity={0.85}
          >
            <Text style={st.confirmarText}>
              {indice + 1 >= ejercicios.length ? 'Ver resultados' : 'Continuar'}
            </Text>
            <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          // Boton Confirmar — solo activo si hay seleccion (H.U. 309)
          <TouchableOpacity
            style={[st.confirmarBtn, !confirmarActivo && st.confirmarBtnOff]}
            onPress={confirmarRespuesta}
            disabled={!confirmarActivo}
            activeOpacity={0.85}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={[st.confirmarText, !confirmarActivo && st.confirmarTextOff]}>
                Confirmar
              </Text>
            )}
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 28 : 32,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn:    { padding: 4, marginRight: 10, paddingBottom: 4 },
  headerMid:  { flex: 1 },
  headerTitle:{ fontSize: 22, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
  headerCounter:{ fontSize: 12, color: '#9ca3af', marginTop: 2 },
  headerRight:{ paddingLeft: 10, paddingBottom: 4 },

  // Progreso
  progressWrap:{ paddingHorizontal: 0 },
  progressBg:  { height: 5, backgroundColor: '#e5e7eb' },
  progressFill:{ height: '100%', backgroundColor: '#111827', borderRadius: 0 },

  // Scroll
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 20 },

  // Tarjeta ejercicio
  ejercicioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  tipoText:  { fontSize: 11, color: '#9ca3af', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  enunciado: { fontSize: 18, fontWeight: '700', color: '#111827', lineHeight: 27, letterSpacing: -0.2 },

  // Opciones seleccion multiple
  opcionesWrap: { gap: 10, marginBottom: 16 },
  opcionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  letraBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  letraText:  { fontSize: 13, fontWeight: '800', color: '#6b7280' },
  opcionText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  opcionIcon: { flexShrink: 0 },

  // Opciones clic numero
  numerosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  numeroBtn: {
    width: '38%',
    aspectRatio: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  numeroText:  { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center' },
  numeroBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
  },

  // Feedback (H.U. 207, 309)
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  feedbackTitle: { fontSize: 16, fontWeight: '800' },
  feedbackMsg:   { fontSize: 13, color: '#6b7280', lineHeight: 20, marginTop: 2 },

  // XP chip dentro del feedback
  xpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fef9c3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  xpChipText: { fontSize: 13, fontWeight: '800', color: '#b45309' },

  // XP flotante animado
  xpFloat: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1c1917',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xpFloatText: { fontSize: 18, fontWeight: '900', color: '#fbbf24' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 105 : 97,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  confirmarBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 17,
  },
  confirmarBtnOff: {
    backgroundColor: '#f3f4f6',
  },
  confirmarText:    { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.2 },
  confirmarTextOff: { color: '#9ca3af' },

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
