import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PersonalizarPerfilScreen({ navigation }) {
  const { usuario, updateUsuario } = useAuth();
  const [nombre,      setNombre]      = useState(usuario?.nombre || '');
  const [avatar,      setAvatar]      = useState(usuario?.avatar || null);
  const [guardando,   setGuardando]   = useState(false);
  const [guardado,    setGuardado]    = useState(false);
  const [errAvatar,   setErrAvatar]   = useState('');

  const correo = usuario?.correo || '';

  const guardar = async (nuevoNombre, nuevoAvatar) => {
    if (!nuevoNombre.trim()) return;
    setGuardando(true);
    setGuardado(false);
    try {
      const { data } = await api.put('/auth/perfil', {
        idUsuario: usuario.id,
        nombre: nuevoNombre.trim(),
        ...(nuevoAvatar ? { avatar: nuevoAvatar } : {}),
      });
      updateUsuario(data.data);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (_) {
    } finally {
      setGuardando(false);
    }
  };

  const handlePickAvatar = async () => {
    setErrAvatar('');
    try {
      const ImagePicker = require('expo-image-picker');

      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
        setErrAvatar('Archivo muy grande · El avatar debe pesar menos de 2 MB.');
        return;
      }

      const ext = asset.uri.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        setErrAvatar('Formato inválido · Solo se permiten JPG y PNG.');
        return;
      }

      setAvatar(asset.uri);
      guardar(nombre, asset.uri);
    } catch (_) {
      setErrAvatar('No se pudo abrir la galería. Instala expo-image-picker.');
    }
  };

  const handleNombreBlur = () => {
    if (nombre.trim() && nombre.trim() !== usuario?.nombre) {
      guardar(nombre, avatar);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={{ height: 80, paddingHorizontal: 16, paddingTop: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eaeaea' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1 }}>Personalizar</Text>
        <Text style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
          {guardando ? 'guardando...' : 'guarda solo'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Avatar con badge de edición */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={handlePickAvatar} style={{ position: 'relative', marginBottom: 12 }}>
            {avatar
              ? <Image source={{ uri: avatar }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#1a1a1a' }} />
              : (
                <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#1a1a1a', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>avatar</Text>
                </View>
              )
            }
            <View style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#fff',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Feather name="edit-2" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: '#999' }}>JPG / PNG · máx. 2 MB</Text>
        </View>

        {/* Nombre visible */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Nombre visible</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, paddingRight: 40, borderWidth: 1, borderColor: '#333', borderRadius: 12, fontSize: 15, color: '#1a1a1a' }}
              value={nombre}
              onChangeText={t => { setNombre(t); setGuardado(false); }}
              onBlur={handleNombreBlur}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {nombre.trim().length >= 2 && (
              <Text style={{ position: 'absolute', right: 16, color: '#2e7d32', fontSize: 14 }}>✓</Text>
            )}
          </View>
        </View>

        {/* Correo (no editable) */}
        <View style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Correo (no editable)</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              style={{ paddingVertical: 14, paddingHorizontal: 16, paddingRight: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, fontSize: 15, color: '#1a1a1a', backgroundColor: '#fafafa' }}
              value={correo}
              editable={false}
            />
            <Text style={{ position: 'absolute', right: 16, color: '#2e7d32', fontSize: 14 }}>✓</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
          Contacta a tu docente para cambiarlo
        </Text>

        {/* Alerta éxito */}
        {guardado && (
          <View style={{ backgroundColor: '#e8f5e9', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Feather name="check" size={14} color="#2e7d32" />
            <Text style={{ fontSize: 13, color: '#2e7d32' }}>Cambios guardados automáticamente</Text>
          </View>
        )}

        {/* Alerta error avatar */}
        {errAvatar ? (
          <View style={{ backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ffcdd2', borderRadius: 10, padding: 12 }}>
            <Text style={{ fontSize: 13, color: '#c62828', lineHeight: 20 }}>{errAvatar}</Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}
