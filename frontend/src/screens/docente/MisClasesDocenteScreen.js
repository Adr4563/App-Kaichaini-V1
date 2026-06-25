// MisClasesDocenteScreen.js
// H.U. 317 - Visualizacion de clases del docente
// H.U. 317 - Cierre de sesion del docente

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';

export default function MisClasesDocenteScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [clases,     setClases]     = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  const cargarClases = async () => {
    try {
      const { data } = await api.get('/clases/mis-clases', { params: { idUsuario: usuario.id, rol: usuario.rol } });
      setClases(data.data || []);
    } catch (_) {
      setClases([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      cargarClases().finally(() => setCargando(false));
    }, []),
  );

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      <View style={{
        height: 80, paddingHorizontal: 16, paddingTop: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: '#eaeaea',
      }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a' }}>Mis clases</Text>

        {/* H.U. 317 - Cierre de sesion del docente */}
        <TouchableOpacity onPress={() => setShowLogout(true)}>
          <Feather name="log-out" size={20} color="#cc0000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {clases.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 50 }}>
            <Feather name="folder" size={48} color="#d1d5db" style={{ marginBottom: 14 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 }}>
              Aún no tienes clases
            </Text>
            <Text style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 }}>
              Las clases que crees aparecerán aquí.
            </Text>
          </View>
        ) : (
          clases.map(clase => (
            <TouchableOpacity
              key={clase.id}
              onPress={() => navigation.navigate('ModulosClaseDocente', { idClase: clase.id, nombreClase: clase.nombre })}
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
                padding: 14, marginBottom: 14,
              }}
            >
              <View style={{
                width: 45, height: 45, borderRadius: 22, backgroundColor: '#1a1a1a',
                justifyContent: 'center', alignItems: 'center', marginRight: 14,
              }}>
                <Feather name="book" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 }}>
                  {clase.nombre}
                </Text>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  {clase.curso} · Código {clase.codigoUnico}
                </Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {clase.numEstudiantes} estudiante{clase.numEstudiantes === '1' ? '' : 's'} inscrito{clase.numEstudiantes === '1' ? '' : 's'}
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color="#bbb" />
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={async () => { setShowLogout(false); await logout(); }}
      />
    </View>
  );
}
