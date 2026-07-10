import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Modal, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';
import api from '../../services/api';
import { getBadgePng } from '../../utils/badgeImages';

const LIGA_NEXT_NOMBRE = {
  Amauta: 'Panaca',
  Panaca: 'Auqui',
  Auqui:  'Inca',
  Inca:   null,
};

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [perfil,     setPerfil]     = useState(null);
  const [todasInsig, setTodasInsig] = useState([]);
  const [clases,     setClases]     = useState([]);
  const [xpTotal,    setXpTotal]    = useState(0);
  const [cargando,   setCargando]   = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const cargar = async () => {
    try {
      const [{ data: p }, { data: ins }, { data: cls }, { data: xp }] = await Promise.all([
        api.get('/perfil', { params: { idUsuario: usuario.id } }),       // usuario + liga + insignias ganadas
        api.get('/insignias'),    // todas las insignias disponibles
        api.get('/clases/mis-clases', { params: { idUsuario: usuario.id, rol: usuario.rol } }),
        api.get('/xp', { params: { idUsuario: usuario.id } }),           // XP total desde la tabla XP (fuente única)
      ]);
      setPerfil(p.data);
      setTodasInsig(ins.data || []);
      setClases(cls.data || []);
      setXpTotal(xp.data?.xpTotal ?? 0);
    } catch (_) {
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const nombre      = perfil?.usuario?.nombre || usuario?.nombre || '';
  const avatarUri   = perfil?.usuario?.avatar || usuario?.avatar;
  const ligaData    = perfil?.liga;
  const ligaNombre  = ligaData?.nombre ?? 'Amauta';
  const ligaMin     = ligaData?.umbralMinimo ?? 0;
  const ligaMax     = ligaData?.umbralMaximo ?? 499;
  const ganadas     = perfil?.insignias ?? [];
  const claseActual = clases[0];

  const initials   = nombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  const nextNombre = LIGA_NEXT_NOMBRE[ligaNombre] ?? null;
  const progress   = ligaMax > ligaMin ? Math.min((xpTotal - ligaMin) / (ligaMax - ligaMin), 1) : 1;
  const remaining  = ligaMax > ligaMin ? Math.max(ligaMax - xpTotal + 1, 0) : 0;

  const ganadosIds = new Set(ganadas.map(i => i.id));

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi perfil</Text>
        <TouchableOpacity onPress={() => setShowConfig(true)}>
          <Feather name="settings" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Tarjeta de perfil */}
        <View style={s.perfilRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.nombre}>{nombre}</Text>
            {claseActual ? (
              <Text style={s.claseText}>
                {claseActual.nombre}{claseActual.curso ? ` · ${claseActual.curso}` : ''}
              </Text>
            ) : null}
            <View style={s.ligaPill}>
              <Feather name="award" size={11} color="#1a1a1a" style={{ marginRight: 4 }} />
              <Text style={s.ligaPillText}>Liga {ligaNombre}</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta XP */}
        <View style={s.xpCard}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>XP total</Text>
            <Text style={s.xpValue}>
              {nextNombre ? `${xpTotal} / ${ligaMax} XP` : `${xpTotal} XP`}
            </Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          {nextNombre ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="trending-up" size={11} color="#999" />
              <Text style={s.xpHint}>{remaining} XP para subir a {nextNombre}</Text>
            </View>
          ) : (
            <Text style={s.xpHint}>Has alcanzado el nivel maximo</Text>
          )}
        </View>

        {/* Insignias */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Mis insignias</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MiColeccion')}>
            <Text style={s.verTodas}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {todasInsig.length === 0 ? (
          <Text style={s.emptyText}>
            Aun no tienes insignias. Completa modulos para ganarlas.
          </Text>
        ) : (
          <View style={s.badgeGrid}>
            {todasInsig.slice(0, 8).map((ins) => {
              const desbloqueada = ganadosIds.has(ins.id);
              const pngSource    = getBadgePng(ins); // objeto completo → criterio primero

              return (
                <TouchableOpacity
                  key={ins.id}
                  style={[s.badgeSlot, desbloqueada ? s.badgeSlotOn : s.badgeSlotOff]}
                  onPress={() => navigation.navigate('MiColeccion')}
                  activeOpacity={0.75}
                >
                  {pngSource && desbloqueada ? (
                    <Image source={pngSource} style={s.badgeImg} resizeMode="contain" />
                  ) : pngSource ? (
                    <View style={s.badgeImgLockWrap}>
                      <Image source={pngSource} style={[s.badgeImg, { opacity: 0.2 }]} resizeMode="contain" />
                      <View style={StyleSheet.absoluteFill} >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Feather name="lock" size={14} color="#999" />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Feather
                      name={desbloqueada ? 'award' : 'lock'}
                      size={20}
                      color={desbloqueada ? '#1a1a1a' : '#ccc'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Documentos de clase */}
        <View style={s.docsCard}>
          <Text style={s.docsTitle}>Documentos de clase</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Silabo')}
            style={s.docRow}
            activeOpacity={0.7}
          >
            <View style={s.docIcon}>
              <Feather name="file-text" size={16} color="#333" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docName}>Silabo</Text>
              <Text style={s.docSub}>Programa de la clase</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#bbb" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Material')}
            style={[s.docRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
          >
            <View style={s.docIcon}>
              <Feather name="book-open" size={16} color="#333" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.docName}>Material academico</Text>
              <Text style={s.docSub}>Archivos y documentos</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#bbb" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Panel de configuracion */}
      <Modal visible={showConfig} transparent animationType="slide" onRequestClose={() => setShowConfig(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowConfig(false)}
        >
          <View style={s.configSheet}>
            <View style={s.configHandle} />

            <TouchableOpacity
              style={s.configRow}
              onPress={() => { setShowConfig(false); navigation.navigate('PersonalizarPerfil'); }}
            >
              <Feather name="edit-2" size={18} color="#1a1a1a" />
              <Text style={s.configText}>Personalizar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.configRow}
              onPress={() => { setShowConfig(false); navigation.navigate('UnirseAClase'); }}
            >
              <Feather name="users" size={18} color="#1a1a1a" />
              <Text style={s.configText}>Unirse a una clase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.configRow, { borderBottomWidth: 0 }]}
              onPress={() => { setShowConfig(false); setTimeout(() => setShowLogout(true), 300); }}
            >
              <Feather name="log-out" size={18} color="#cc0000" />
              <Text style={[s.configText, { color: '#cc0000' }]}>Cerrar sesion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={async () => { setShowLogout(false); await logout(); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header:           { height: 80, paddingHorizontal: 16, paddingTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },

  perfilRow:        { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar:           { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#1a1a1a' },
  avatarFallback:   { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  avatarInitials:   { fontSize: 26, fontWeight: '700', color: '#666' },
  nombre:           { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  claseText:        { fontSize: 13, color: '#666', marginBottom: 6 },
  ligaPill:         { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  ligaPillText:     { fontSize: 11, fontWeight: '700', color: '#1a1a1a' },

  xpCard:           { borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 24 },
  xpRow:            { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel:          { fontSize: 12, color: '#666' },
  xpValue:          { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
  progressBg:       { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8 },
  progressFill:     { height: '100%', backgroundColor: '#1b5e20', borderRadius: 4 },
  xpHint:           { fontSize: 11, color: '#999' },

  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  verTodas:         { fontSize: 12, color: '#666' },
  emptyText:        { fontSize: 14, color: '#666', fontStyle: 'italic', lineHeight: 20 },

  badgeGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  badgeSlot:        { width: '22%', aspectRatio: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  badgeSlotOn:      { backgroundColor: '#fff', borderWidth: 1, borderColor: '#1a1a1a' },
  badgeSlotOff:     { backgroundColor: '#f5f5f5' },
  badgeImg:         { width: '100%', height: '100%' },
  badgeImgLockWrap: { width: '100%', height: '100%' },

  docsCard:         { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 16, marginTop: 24, overflow: 'hidden' },
  docsTitle:        { fontSize: 13, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  docRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  docIcon:          { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  docName:          { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  docSub:           { fontSize: 11, color: '#999', marginTop: 1 },

  configSheet:      { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  configHandle:     { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  configRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eaeaea', gap: 14 },
  configText:       { fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
});
