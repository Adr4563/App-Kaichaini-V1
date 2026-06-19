import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ── helper de fecha ──────────────────────────────────────────────────────── */
const formatFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-PE', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

const formatTipo = (tipo) =>
  tipo ? tipo.replace(/_/g, ' ') : '';

/* ── componente principal ─────────────────────────────────────────────────── */
export default function ProgresoScreen() {
  const { usuario } = useAuth();
  const [historial,    setHistorial]    = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  /* ── carga del historial ────────────────────────────────────────────── */
  const cargar = async () => {
    try {
      const { data } = await api.get('/respuestas', { params: { idUsuario: usuario.id } });
      setHistorial(data.data || []);
    } catch (_) {
      setHistorial([]);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      cargar();
    }, []),
  );

  /* ── estadísticas generales (por ejercicio único, no por intento) ──── */
  const ejerciciosMap = new Map(); // idEjercicio -> alguna vez correcto
  for (const r of historial) {
    const eid = r.idEjercicio || r.ejercicio?.id;
    if (!eid) continue;
    if (!ejerciciosMap.has(eid)) ejerciciosMap.set(eid, false);
    if (r.esCorrecta) ejerciciosMap.set(eid, true);
  }
  const total      = ejerciciosMap.size;
  const correctas  = [...ejerciciosMap.values()].filter(Boolean).length;
  const errores    = total - correctas;
  const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

  /* ── loading ────────────────────────────────────────────────────────── */
  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={{
        height: 80, paddingHorizontal: 16, paddingTop: 24,
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#eaeaea',
      }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>
          Mi progreso
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── Resumen general ─────────────────────────────────────────── */}
        {total > 0 && (
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
              {/* Correctas */}
              <View style={{
                flex: 1, borderWidth: 1, borderColor: '#1a1a1a',
                borderRadius: 12, padding: 14, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#1b5e20' }}>
                  {correctas}
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Correctas</Text>
              </View>
              {/* Errores */}
              <View style={{
                flex: 1, borderWidth: 1, borderColor: '#1a1a1a',
                borderRadius: 12, padding: 14, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#b71c1c' }}>
                  {errores}
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Errores</Text>
              </View>
              {/* Aciertos % */}
              <View style={{
                flex: 1, borderWidth: 1, borderColor: '#1a1a1a',
                borderRadius: 12, padding: 14, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#1a1a1a' }}>
                  {porcentaje}%
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Aciertos</Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View style={{ height: 6, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 28 }}>
              <View style={{
                width: `${porcentaje}%`, height: '100%',
                backgroundColor: '#1b5e20', borderRadius: 4,
              }} />
            </View>
          </>
        )}

        {/* ── Lista de ejercicios ─────────────────────────────────────── */}
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 }}>
          Historial de ejercicios
        </Text>

        {historial.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Feather name="file-text" size={48} color="#d1d5db" style={{ marginBottom: 15 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 }}>
              Sin historial aun
            </Text>
            <Text style={{
              fontSize: 13, color: '#888',
              textAlign: 'center', lineHeight: 20,
            }}>
              Completa ejercicios en tus clases para ver tu progreso aqui.
            </Text>
          </View>
        ) : (
          historial.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSeleccionado(item)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderWidth: 1, borderColor: '#e0e0e0',
                borderRadius: 12, padding: 14, marginBottom: 10,
              }}
            >
              {/* Icono correcto / incorrecto */}
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: item.esCorrecta ? '#e8f5e9' : '#ffebee',
                justifyContent: 'center', alignItems: 'center',
                marginRight: 12,
              }}>
                <Feather
                  name={item.esCorrecta ? 'check' : 'x'}
                  size={16}
                  color={item.esCorrecta ? '#1b5e20' : '#b71c1c'}
                />
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 }}
                  numberOfLines={2}
                >
                  {item.enunciado || 'Ejercicio'}
                </Text>
                <Text style={{ fontSize: 11, color: '#888' }}>
                  {formatFecha(item.fecha)}
                  {item.tipo ? ` · ${formatTipo(item.tipo)}` : ''}
                </Text>
              </View>

              <Feather name="chevron-right" size={16} color="#bbb" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── Modal de detalle (pregunta por pregunta) ─────────────────── */}
      <Modal
        visible={!!seleccionado}
        animationType="slide"
        transparent
        onRequestClose={() => setSeleccionado(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setSeleccionado(null)}
        >
          {/* Evitamos que el tap dentro del modal cierre el modal */}
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: 24, paddingBottom: 40, maxHeight: '82%',
            }}
          >
            {/* Asa */}
            <View style={{
              width: 40, height: 4, backgroundColor: '#ddd',
              borderRadius: 2, alignSelf: 'center', marginBottom: 20,
            }} />

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Cabecera del detalle */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 6,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 }}>
                  Detalle del ejercicio
                </Text>
                <TouchableOpacity onPress={() => setSeleccionado(null)}>
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12, color: '#888', marginBottom: 22 }}>
                {formatTipo(seleccionado?.tipo)} · {formatFecha(seleccionado?.fecha)}
              </Text>

              {/* Pregunta */}
              <Text style={{
                fontSize: 11, color: '#999', textTransform: 'uppercase',
                letterSpacing: 1, fontWeight: '600', marginBottom: 8,
              }}>
                PREGUNTA
              </Text>
              <View style={{
                backgroundColor: '#f8f8f8', borderRadius: 10,
                padding: 14, marginBottom: 20,
              }}>
                <Text style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 20 }}>
                  {seleccionado?.enunciado || '—'}
                </Text>
              </View>

              {/* Tu respuesta */}
              <Text style={{
                fontSize: 11, color: '#999', textTransform: 'uppercase',
                letterSpacing: 1, fontWeight: '600', marginBottom: 8,
              }}>
                TU RESPUESTA
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: seleccionado?.esCorrecta ? '#e8f5e9' : '#ffebee',
                borderRadius: 10, padding: 14, marginBottom: 20,
              }}>
                <Feather
                  name={seleccionado?.esCorrecta ? 'check-circle' : 'x-circle'}
                  size={18}
                  color={seleccionado?.esCorrecta ? '#1b5e20' : '#b71c1c'}
                />
                <Text style={{
                  fontSize: 14, fontWeight: '600',
                  color: seleccionado?.esCorrecta ? '#1b5e20' : '#b71c1c',
                  flex: 1,
                }}>
                  {seleccionado?.respuesta || '—'}
                </Text>
                <Text style={{ fontSize: 11, color: '#888' }}>
                  {seleccionado?.esCorrecta ? 'Correcto' : 'Incorrecto'}
                </Text>
              </View>

              {/* Retroalimentacion */}
              <Text style={{
                fontSize: 11, color: '#999', textTransform: 'uppercase',
                letterSpacing: 1, fontWeight: '600', marginBottom: 8,
              }}>
                RETROALIMENTACION
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'flex-start', gap: 10,
                padding: 14, borderRadius: 10,
                backgroundColor: seleccionado?.esCorrecta ? '#e8f5e9' : '#fff3e0',
              }}>
                <Feather
                  name={seleccionado?.esCorrecta ? 'check-circle' : 'book-open'}
                  size={18}
                  color={seleccionado?.esCorrecta ? '#16a34a' : '#f59e0b'}
                />
                <Text style={{ fontSize: 13, color: '#444', flex: 1, lineHeight: 20 }}>
                  {seleccionado?.esCorrecta
                    ? '¡Excelente! Respuesta correcta. Sigue asi.'
                    : 'Respuesta incorrecta. Revisa el material de este tema e intentalo de nuevo.'}
                </Text>
              </View>

            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}
