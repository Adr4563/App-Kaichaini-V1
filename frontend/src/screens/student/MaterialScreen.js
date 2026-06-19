import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const getExtension = (url, tipo) => {
  if (tipo) return tipo.toUpperCase();
  if (!url) return 'DOC';
  const ext = url.split('.').pop()?.toUpperCase();
  return ['PDF', 'DOC', 'DOCX'].includes(ext) ? ext : 'DOC';
};

/**
 * Separa resultados en exactos y parciales, ordenados alfabéticamente.
 * - Exacto  : nombre completo igual a la query (sin distinción de mayúsculas)
 * - Parcial : nombre contiene la query pero no es igual
 */
const separar = (items, query) => {
  if (!query.trim()) return { exactos: [], parciales: [], todos: items };
  const q = query.toLowerCase().trim();
  const exactos   = items
    .filter(m => m.nombre.toLowerCase() === q)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const parciales = items
    .filter(m => m.nombre.toLowerCase() !== q && m.nombre.toLowerCase().includes(q))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  return { exactos, parciales, todos: [] };
};

/* ── componente ───────────────────────────────────────────────────────────── */
export default function MaterialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [clases,      setClases]      = useState([]);
  const [tabActivo,   setTabActivo]   = useState(0);
  const [material,    setMaterial]    = useState([]);
  const [busqueda,    setBusqueda]    = useState('');
  const [cargando,    setCargando]    = useState(true);
  const [cargandoMat, setCargandoMat] = useState(false);
  const debounceRef = useRef(null);

  /* ── fetch clases ─────────────────────────────────────────────────────── */
  const cargarClases = async () => {
    try {
      const { data } = await api.get('/clases/mis-clases', { params: { idUsuario: usuario.id, rol: usuario.rol } });
      const lista = data.data || [];
      setClases(lista);
      if (lista.length > 0) await cargarMaterial(lista[0].id);
    } catch (_) {}
  };

  /* ── fetch material (con o sin búsqueda) ─────────────────────────────── */
  const cargarMaterial = async (idClase, query = '') => {
    setCargandoMat(true);
    try {
      let items;
      if (query.trim()) {
        const { data } = await api.get(
          `/material/buscar?q=${encodeURIComponent(query)}&idClase=${idClase}`,
        );
        items = data.data || [];
      } else {
        const { data } = await api.get(`/material?idClase=${idClase}`);
        items = data.data || [];
      }
      setMaterial(items);
    } catch (_) {
      setMaterial([]);
    } finally {
      setCargandoMat(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      setBusqueda('');
      cargarClases().finally(() => setCargando(false));
    }, []),
  );

  const cambiarTab = (idx) => {
    setTabActivo(idx);
    setBusqueda('');
    cargarMaterial(clases[idx].id);
  };

  const handleBusqueda = (texto) => {
    setBusqueda(texto);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (clases[tabActivo]) cargarMaterial(clases[tabActivo].id, texto);
    }, 400);
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    clearTimeout(debounceRef.current);
    if (clases[tabActivo]) cargarMaterial(clases[tabActivo].id);
  };

  /* ── render de tarjeta de documento ──────────────────────────────────── */
  const renderDoc = (item) => {
    const ext   = getExtension(item.archivoUrl, item.tipo);
    const isPDF = ext === 'PDF';
    return (
      <TouchableOpacity
        key={item.id}
        style={{
          flexDirection: 'row', alignItems: 'center',
          borderWidth: 1, borderColor: '#e0e0e0',
          borderRadius: 10, padding: 12, marginBottom: 10,
        }}
        onPress={() => item.archivoUrl && Linking.openURL(item.archivoUrl)}
        activeOpacity={0.7}
      >
        <View style={{
          width: 40, height: 45,
          backgroundColor: '#f5f5f5',
          borderWidth: 1, borderColor: '#e0e0e0',
          borderRadius: 6,
          justifyContent: 'center', alignItems: 'center',
          marginRight: 14,
        }}>
          <Text style={{ fontSize: 9, fontWeight: '700', color: isPDF ? '#d32f2f' : '#1976d2' }}>
            {ext}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: '#1a1a1a', fontWeight: '600', marginBottom: 2 }}>
            {item.nombre}
          </Text>
          <Text style={{ fontSize: 11, color: '#888' }}>
            {clases[tabActivo]?.nombre}
          </Text>
        </View>
        <Feather name="download" size={16} color="#666" style={{ paddingHorizontal: 10 }} />
      </TouchableOpacity>
    );
  };

  /* ── etiqueta de sección ──────────────────────────────────────────────── */
  const renderEtiqueta = (texto, cantidad) => (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 10,
    }}>
      <Text style={{
        fontSize: 10, color: '#999', letterSpacing: 1,
        textTransform: 'uppercase', fontWeight: '600',
      }}>
        {texto}
      </Text>
      <View style={{
        backgroundColor: '#f0f0f0', borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 2,
      }}>
        <Text style={{ fontSize: 11, color: '#666', fontWeight: '600' }}>
          {cantidad}
        </Text>
      </View>
    </View>
  );

  /* ── loading inicial ──────────────────────────────────────────────────── */
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  const { exactos, parciales, todos } = separar(material, busqueda);
  const totalResultados = busqueda.trim() ? exactos.length + parciales.length : 0;
  const hayBusqueda     = busqueda.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={{
        height: 80, paddingHorizontal: 16, paddingTop: 24,
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#eaeaea',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>
          Material academico
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── Tabs de clases ─────────────────────────────────────────────── */}
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
                <Feather name="book-open" size={14} color={tabActivo === i ? '#fff' : '#666'} />
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

        {/* ── Buscador ─────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          borderWidth: 1,
          borderColor: hayBusqueda ? '#1a1a1a' : '#666',
          borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          marginBottom: 25,
        }}>
          <Feather name="search" size={16} color={hayBusqueda ? '#1a1a1a' : '#999'} style={{ marginRight: 10 }} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: '#1a1a1a' }}
            placeholder="Buscar por nombre del archivo..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={handleBusqueda}
          />
          {hayBusqueda && (
            <TouchableOpacity onPress={limpiarBusqueda} style={{ paddingLeft: 8 }}>
              <Feather name="x" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Contenido ────────────────────────────────────────────────────── */}
        {cargandoMat ? (
          <ActivityIndicator color="#1a1a1a" style={{ marginVertical: 20 }} />

        ) : hayBusqueda ? (
          /* ── Resultados de búsqueda: exactas primero, parciales después ── */
          exactos.length === 0 && parciales.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <Feather name="search" size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 }}>
                Sin resultados
              </Text>
              <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 }}>
                No se encontró material con ese nombre.{'\n'}Intenta con otra palabra clave.
              </Text>
            </View>
          ) : (
            <>
              {exactos.length > 0 && (
                <View style={{ marginBottom: parciales.length > 0 ? 20 : 0 }}>
                  {renderEtiqueta('Coincidencia exacta', exactos.length)}
                  {exactos.map(renderDoc)}
                </View>
              )}
              {parciales.length > 0 && (
                <View>
                  {renderEtiqueta('Coincidencia parcial', parciales.length)}
                  {parciales.map(renderDoc)}
                </View>
              )}
            </>
          )

        ) : (
          /* ── Lista completa sin búsqueda ─────────────────────────────── */
          material.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Feather name="inbox" size={48} color="#d1d5db" style={{ marginBottom: 15 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 }}>
                Sin material aún
              </Text>
              <Text style={{
                fontSize: 13, color: '#888',
                textAlign: 'center', maxWidth: 250, lineHeight: 20,
              }}>
                Tu docente aún no ha subido material para esta clase.
              </Text>
            </View>
          ) : (
            <>
              {renderEtiqueta('Todo el material', material.length)}
              {todos.length > 0 ? todos.map(renderDoc) : material.map(renderDoc)}
            </>
          )
        )}

      </ScrollView>
    </View>
  );
}
