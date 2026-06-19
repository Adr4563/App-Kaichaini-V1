import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const getExtension = (url, tipo) => {
  if (tipo) return tipo.toUpperCase();
  if (!url) return 'DOC';
  const ext = url.split('.').pop()?.toUpperCase();
  return ['PDF', 'DOC', 'DOCX'].includes(ext) ? ext : 'DOC';
};

export default function SilaboScreen({ navigation }) {
  const { usuario } = useAuth();
  const [clases,         setClases]         = useState([]);
  const [tabActivo,      setTabActivo]      = useState(0);
  const [silabo,         setSilabo]         = useState(null);
  const [cargando,       setCargando]       = useState(true);
  const [cargandoSilabo, setCargandoSilabo] = useState(false);

  /* ── carga de clases ─────────────────────────────────────────────── */
  const cargarClases = async () => {
    try {
      const { data } = await api.get('/clases/mis-clases', { params: { idUsuario: usuario.id, rol: usuario.rol } });
      const lista = data.data || [];
      setClases(lista);
      if (lista.length > 0) await cargarSilabo(lista[0].id);
    } catch (_) {}
  };

  /* ── carga de sílabo ─────────────────────────────────────────────── */
  const cargarSilabo = async (idClase) => {
    setCargandoSilabo(true);
    setSilabo(null);
    try {
      const { data } = await api.get(`/silabos/${idClase}`);
      setSilabo(data.data);
    } catch (_) {
      setSilabo(null);
    } finally {
      setCargandoSilabo(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      cargarClases().finally(() => setCargando(false));
    }, []),
  );

  const cambiarTab = (idx) => {
    setTabActivo(idx);
    cargarSilabo(clases[idx].id);
  };

  /* ── loading ──────────────────────────────────────────────────────── */
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  const claseActiva = clases[tabActivo];
  const ext = silabo ? getExtension(silabo.archivoUrl, silabo.tipo) : 'PDF';
  const isPDF = ext === 'PDF';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={{
        height: 80, paddingHorizontal: 16, paddingTop: 24,
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#eaeaea',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>Mi clase</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── Tabs de clases ─────────────────────────────────────────── */}
        {clases.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {clases.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => cambiarTab(i)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingVertical: 8, paddingHorizontal: 16,
                  borderRadius: 20, borderWidth: 1, marginRight: 10,
                  backgroundColor: tabActivo === i ? '#1a1a1a' : '#fff',
                  borderColor:     tabActivo === i ? '#1a1a1a' : '#e0e0e0',
                }}
              >
                <Feather name="book" size={14} color={tabActivo === i ? '#fff' : '#666'} />
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: tabActivo === i ? '#fff' : '#666',
                }}>
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Info de la clase activa ────────────────────────────────── */}
        {claseActiva && (
          <View style={{
            borderWidth: 1, borderColor: '#666', borderRadius: 12,
            padding: 15, marginBottom: 25,
          }}>
            <Text style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Clase actual</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 }}>
              {claseActiva.nombre}{claseActiva.curso ? ` · ${claseActiva.curso}` : ''}
            </Text>
            <Text style={{ fontSize: 12, color: '#888' }}>2026</Text>
          </View>
        )}

        {/* ── Documentos ─────────────────────────────────────────────── */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 }}>
          Documentos
        </Text>

        {cargandoSilabo ? (
          <ActivityIndicator color="#1a1a1a" style={{ marginVertical: 20 }} />
        ) : silabo ? (
          <>
            {/* Tarjeta sílabo descargable */}
            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
                padding: 12, marginBottom: 16,
              }}
              onPress={() => silabo.archivoUrl && Linking.openURL(silabo.archivoUrl)}
              activeOpacity={0.7}
            >
              <View style={{
                width: 45, height: 55, backgroundColor: '#f5f5f5',
                borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6,
                justifyContent: 'center', alignItems: 'center', marginRight: 15,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: isPDF ? '#d32f2f' : '#1976d2' }}>
                  {ext}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '600', marginBottom: 2 }}>
                  Sílabo general
                </Text>
                <Text style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
                  {claseActiva?.nombre}{claseActiva?.curso ? ` · ${claseActiva.curso}` : ''} · 2026
                </Text>
                <Text style={{ fontSize: 10, color: '#aaa' }}>Toca para abrir / descargar</Text>
              </View>
              <Feather name="download" size={18} color="#333" style={{ paddingHorizontal: 10 }} />
            </TouchableOpacity>

            {/* Vista previa */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 }}>
              Vista previa
            </Text>
            <View style={{
              borderWidth: 1, borderColor: '#666', borderRadius: 12, paddingVertical: 15,
            }}>
              <Text style={{
                fontSize: 10, letterSpacing: 1, color: '#666',
                textTransform: 'uppercase', paddingHorizontal: 15,
                paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
              }}>
                SÍLABO · 2026
              </Text>
              <View style={{ padding: 15 }}>
                {silabo.contenido ? (
                  silabo.contenido.split('\n').filter(l => l.trim()).map((linea, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row', alignItems: 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <View style={{
                        width: 22, height: 22, borderRadius: 11,
                        backgroundColor: '#1a1a1a', justifyContent: 'center',
                        alignItems: 'center', marginRight: 10, marginTop: 1,
                        flexShrink: 0,
                      }}>
                        <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#333', lineHeight: 20, flex: 1 }}>
                        {linea.replace(/^Unidad \d+:\s*/i, '')}
                      </Text>
                    </View>
                  ))
                ) : (
                  [0.7, 0.85, 0.6, 0.8, 0.65, 0.75].map((w, i) => (
                    <View
                      key={i}
                      style={{
                        height: 8, backgroundColor: '#f0f0f0',
                        borderRadius: 4, marginBottom: 12,
                        width: `${w * 100}%`,
                      }}
                    />
                  ))
                )}
              </View>
            </View>
          </>
        ) : (
          /* Estado vacío */
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Feather name="file-text" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 }}>
              Sin sílabo aún
            </Text>
            <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 }}>
              Tu docente aún no ha publicado el sílabo para esta clase.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
