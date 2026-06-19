// ConfigurarFeedbackScreen.js
// H.U. 207 - Retroalimentacion automatica: personalización de plantillas (vista docente)
//
// ESTADO ACTUAL:
//   ✅ La pantalla guarda/lee mensajes localmente (expo-secure-store).
//   ⚠️  Los cambios NO llegan a los estudiantes todavía porque el backend
//       aún no expone endpoints de plantillas. Ver los TODO marcados abajo.
//
// CUANDO EL BACKEND ESTÉ LISTO:
//   Busca los comentarios "TODO BACKEND" en este archivo y en EjercicioScreen.js.
//   Solo hay que reemplazar las funciones cargarPlantillas() y guardarPlantillas()
//   por llamadas a api.get() y api.put(). El resto de la pantalla no cambia.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// ── Claves de almacenamiento local ────────────────────────────────────────────
const KEYS = {
  EXCELENTE:      'feedback_excelente',
  BUENO:          'feedback_bueno',
  NECESITA_MEJORA:'feedback_necesita_mejora',
};

// ── Mensajes por defecto (espejo de backend/src/utils/constants.js) ───────────
// Cuando el backend implemente las plantillas, estos serán solo el fallback.
const DEFAULTS = {
  excelente:       'Excelente trabajo',
  bueno:           'Buen esfuerzo, revisa estos temas',
  necesitaMejora:  'Intenta nuevamente con atención, repasa el material',
};

// ── Configuración visual de cada rango ───────────────────────────────────────
const RANGOS = [
  {
    key:       'excelente',
    storeKey:  KEYS.EXCELENTE,
    titulo:    'Rango excelente',
    rango:     '0 – 2 errores',
    color:     '#16a34a',
    bgColor:   '#f0fdf4',
    borderColor:'#bbf7d0',
    icono:     'award',
    hint:      'Mensaje cuando el estudiante comete 0, 1 o 2 errores.',
  },
  {
    key:       'bueno',
    storeKey:  KEYS.BUENO,
    titulo:    'Rango buen esfuerzo',
    rango:     '3 – 5 errores',
    color:     '#d97706',
    bgColor:   '#fffbeb',
    borderColor:'#fde68a',
    icono:     'thumbs-up',
    hint:      'Mensaje cuando el estudiante comete entre 3 y 5 errores.',
  },
  {
    key:       'necesitaMejora',
    storeKey:  KEYS.NECESITA_MEJORA,
    titulo:    'Rango necesita mejora',
    rango:     '6+ errores',
    color:     '#dc2626',
    bgColor:   '#fef2f2',
    borderColor:'#fecaca',
    icono:     'refresh-cw',
    hint:      'Mensaje cuando el estudiante comete 6 o más errores.',
  },
];

// ── Componente: Tarjeta de plantilla editable ─────────────────────────────────
function TarjetaPlantilla({ config, valor, onChange, editando, onEditar, onCancelar }) {
  const inputRef = useRef(null);

  // Enfocar el input al entrar en modo edicion
  useEffect(() => {
    if (editando && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [editando]);

  return (
    <View style={[tc.card, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      {/* Cabecera */}
      <View style={tc.cabecera}>
        <View style={[tc.iconoWrap, { backgroundColor: config.color }]}>
          <Feather name={config.icono} size={15} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[tc.titulo, { color: config.color }]}>{config.titulo}</Text>
          <Text style={tc.rango}>{config.rango}</Text>
        </View>
        {/* Boton editar / cancelar */}
        {editando ? (
          <TouchableOpacity onPress={onCancelar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onEditar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="edit-2" size={16} color={config.color} />
          </TouchableOpacity>
        )}
      </View>

      {/* Hint */}
      <Text style={tc.hint}>{config.hint}</Text>

      {/* Cuerpo: vista o input */}
      {editando ? (
        <TextInput
          ref={inputRef}
          style={[tc.input, { borderColor: config.color }]}
          value={valor}
          onChangeText={onChange}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder={DEFAULTS[config.key]}
          placeholderTextColor="#9ca3af"
          maxLength={200}
        />
      ) : (
        <View style={[tc.mensajeWrap, { borderColor: config.borderColor }]}>
          <Feather name="message-square" size={14} color={config.color} style={{ marginTop: 2 }} />
          <Text style={[tc.mensajeText, { color: config.color }]}>{valor || DEFAULTS[config.key]}</Text>
        </View>
      )}

      {/* Contador de caracteres en modo edicion */}
      {editando && (
        <Text style={tc.contador}>{(valor || '').length} / 200 caracteres</Text>
      )}
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────────
export default function ConfigurarFeedbackScreen({ navigation }) {
  // Estado de los tres mensajes
  const [mensajes, setMensajes] = useState({
    excelente:      '',
    bueno:          '',
    necesitaMejora: '',
  });

  // Cual tarjeta esta en modo edicion (null = ninguna)
  const [editando, setEditando] = useState(null);

  // Copia de seguridad para cancelar edicion
  const [backup, setBackup] = useState(null);

  const [cargando,  setCargando]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado,  setGuardado]  = useState(false);

  // Animacion del toast de guardado
  const toastAnim = useRef(new Animated.Value(0)).current;

  // ── Carga al montar ────────────────────────────────────────────────────────
  useEffect(() => {
    cargarPlantillas();
  }, []);

  async function cargarPlantillas() {
    setCargando(true);
    try {
      // TODO BACKEND: cuando el endpoint esté disponible, reemplazar este bloque por:
      //
      //   const res = await api.get('/feedback-templates');
      //   const data = res.data.data;
      //   setMensajes({
      //     excelente:      data.excelente      || DEFAULTS.excelente,
      //     bueno:          data.bueno          || DEFAULTS.bueno,
      //     necesitaMejora: data.necesitaMejora || DEFAULTS.necesitaMejora,
      //   });
      //
      // ── Lectura local (temporal) ──────────────────────────────────────────
      const [e, b, n] = await Promise.all([
        SecureStore.getItemAsync(KEYS.EXCELENTE),
        SecureStore.getItemAsync(KEYS.BUENO),
        SecureStore.getItemAsync(KEYS.NECESITA_MEJORA),
      ]);
      setMensajes({
        excelente:      e || DEFAULTS.excelente,
        bueno:          b || DEFAULTS.bueno,
        necesitaMejora: n || DEFAULTS.necesitaMejora,
      });
      // ── Fin lectura local ─────────────────────────────────────────────────
    } catch {
      // Si falla, usar defaults
      setMensajes({
        excelente:      DEFAULTS.excelente,
        bueno:          DEFAULTS.bueno,
        necesitaMejora: DEFAULTS.necesitaMejora,
      });
    } finally {
      setCargando(false);
    }
  }

  // ── Guardar plantillas ─────────────────────────────────────────────────────
  async function guardarPlantillas() {
    if (editando !== null) {
      // Hay una tarjeta abierta: cerrarla primero
      setEditando(null);
      setBackup(null);
    }

    setGuardando(true);
    try {
      // TODO BACKEND: cuando el endpoint esté disponible, reemplazar este bloque por:
      //
      //   await api.put('/feedback-templates', {
      //     excelente:      mensajes.excelente,
      //     bueno:          mensajes.bueno,
      //     necesitaMejora: mensajes.necesitaMejora,
      //   });
      //
      // ── Guardado local (temporal) ─────────────────────────────────────────
      await Promise.all([
        SecureStore.setItemAsync(KEYS.EXCELENTE,       mensajes.excelente),
        SecureStore.setItemAsync(KEYS.BUENO,           mensajes.bueno),
        SecureStore.setItemAsync(KEYS.NECESITA_MEJORA, mensajes.necesitaMejora),
      ]);
      // ── Fin guardado local ────────────────────────────────────────────────

      mostrarToast();
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los mensajes. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  // ── Toast de guardado exitoso ─────────────────────────────────────────────
  function mostrarToast() {
    setGuardado(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setGuardado(false));
  }

  // ── Handlers de edicion ───────────────────────────────────────────────────
  function iniciarEdicion(key) {
    setBackup(mensajes[key]);
    setEditando(key);
  }

  function cancelarEdicion(key) {
    setMensajes(prev => ({ ...prev, [key]: backup }));
    setEditando(null);
    setBackup(null);
  }

  function cambiarMensaje(key, valor) {
    setMensajes(prev => ({ ...prev, [key]: valor }));
  }

  // ── Resetear un mensaje al default ───────────────────────────────────────
  function resetearDefault(key) {
    Alert.alert(
      'Restablecer mensaje',
      '¿Quieres volver al mensaje por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setMensajes(prev => ({ ...prev, [key]: DEFAULTS[key] }));
            setEditando(null);
            setBackup(null);
          },
        },
      ]
    );
  }

  // ── Hay cambios pendientes ────────────────────────────────────────────────
  const haycambios = editando !== null ||
    mensajes.excelente !== DEFAULTS.excelente ||
    mensajes.bueno     !== DEFAULTS.bueno ||
    mensajes.necesitaMejora !== DEFAULTS.necesitaMejora;

  // ── Render ────────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <SafeAreaView style={st.centered}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={st.loadingText}>Cargando plantillas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={st.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={st.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Configurar feedback</Text>
          <Text style={st.headerSub}>H.U. 207 — mensajes automáticos</Text>
        </View>
      </View>

      {/* ── Banner de estado del backend ───────────────────────────────────── */}
      <View style={st.bannerPendiente}>
        <Feather name="alert-triangle" size={15} color="#d97706" style={{ marginRight: 8, flexShrink: 0 }} />
        <Text style={st.bannerText}>
          Los cambios se guardan en este dispositivo. Para que lleguen a los estudiantes,
          el backend debe implementar el endpoint <Text style={st.bannerCode}>/feedback-templates</Text>.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Explicacion ────────────────────────────────────────────────── */}
          <Text style={st.seccionTitulo}>Plantillas de mensaje</Text>
          <Text style={st.seccionDesc}>
            Personaliza el mensaje que recibe el estudiante según cuántos errores comete al terminar un módulo.
            Toca el ícono de edición en cada tarjeta para modificar el texto.
          </Text>

          {/* ── Tarjetas de plantilla ──────────────────────────────────────── */}
          {RANGOS.map(config => (
            <View key={config.key}>
              <TarjetaPlantilla
                config={config}
                valor={mensajes[config.key]}
                onChange={(v) => cambiarMensaje(config.key, v)}
                editando={editando === config.key}
                onEditar={() => iniciarEdicion(config.key)}
                onCancelar={() => cancelarEdicion(config.key)}
              />
              {/* Boton restablecer (visible solo si el valor difiere del default) */}
              {mensajes[config.key] !== DEFAULTS[config.key] && editando !== config.key && (
                <TouchableOpacity
                  onPress={() => resetearDefault(config.key)}
                  style={st.resetBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="rotate-ccw" size={12} color="#9ca3af" />
                  <Text style={st.resetText}>Restablecer mensaje por defecto</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* ── Vista previa ────────────────────────────────────────────────── */}
          <View style={st.previsualizacion}>
            <Text style={st.prevTitulo}>
              <Feather name="eye" size={13} color="#6b7280" /> {'  '}Vista previa
            </Text>
            {RANGOS.map(config => (
              <View key={config.key} style={st.prevFila}>
                <View style={[st.prevDot, { backgroundColor: config.color }]} />
                <Text style={st.prevRango}>{config.rango}:</Text>
                <Text style={st.prevMsg} numberOfLines={2}>
                  {mensajes[config.key] || DEFAULTS[config.key]}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Toast de guardado ──────────────────────────────────────────────── */}
      {guardado && (
        <Animated.View style={[st.toast, { opacity: toastAnim }]}>
          <Feather name="check-circle" size={16} color="#4ade80" />
          <Text style={st.toastText}>Mensajes guardados correctamente</Text>
        </Animated.View>
      )}

      {/* ── Footer: boton Guardar ──────────────────────────────────────────── */}
      <View style={st.footer}>
        <TouchableOpacity
          style={[st.guardarBtn, guardando && st.guardarBtnOff]}
          onPress={guardarPlantillas}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="save" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={st.guardarText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ── Estilos de TarjetaPlantilla ───────────────────────────────────────────────
const tc = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cabecera:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  iconoWrap:  { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  titulo:     { fontSize: 13, fontWeight: '800', letterSpacing: 0.1 },
  rango:      { fontSize: 11, color: '#9ca3af', marginTop: 1, fontWeight: '600' },
  hint:       { fontSize: 11, color: '#9ca3af', marginBottom: 12, lineHeight: 16 },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 90,
    lineHeight: 21,
  },
  mensajeWrap:{ flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.6)' },
  mensajeText:{ flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  contador:   { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 6 },
});

// ── Estilos de pantalla ───────────────────────────────────────────────────────
const st = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827', letterSpacing: -0.2 },
  headerSub:   { fontSize: 11, color: '#9ca3af', marginTop: 1 },

  // Banner pendiente de backend
  bannerPendiente: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  bannerText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  bannerCode: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700' },

  // Scroll
  scroll: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 20 },

  seccionTitulo: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 6, letterSpacing: -0.2 },
  seccionDesc:   { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 20 },

  // Reset button
  resetBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginBottom: 14, marginTop: 2 },
  resetText: { fontSize: 11, color: '#9ca3af' },

  // Vista previa
  previsualizacion: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  prevTitulo: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 12, letterSpacing: 0.3, textTransform: 'uppercase' },
  prevFila:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  prevDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  prevRango:  { fontSize: 12, fontWeight: '700', color: '#374151', flexShrink: 0, marginTop: 1 },
  prevMsg:    { flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18 },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c1917',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },

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
  guardarBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 17,
  },
  guardarBtnOff: { backgroundColor: '#9ca3af' },
  guardarText: { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 0.2 },

  loadingText: { marginTop: 14, fontSize: 14, color: '#6b7280' },
});
