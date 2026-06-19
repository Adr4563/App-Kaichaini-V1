// H.U. 109 - Desbloqueo de insignias al cumplir objetivos
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getBadgePng } from '../../utils/badgeImages';

export default function InsigniaDesbloqueadaScreen({ navigation, route }) {
  const { insignia, totalSerie = 1, maxSerie = 3 } = route?.params || {};

  const pngSource = getBadgePng(insignia); // objeto completo → criterio primero

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#171717' }}>
      <View style={s.container}>

        {/* Contenido central */}
        <View style={s.content}>
          <Text style={s.congrats}>¡Insignia desbloqueada!</Text>
          <Text style={s.logroTag}>LOGRO · KAICHAINI</Text>

          {/* Badge PNG o fallback */}
          <View style={s.badgeWrap}>
            {pngSource ? (
              <Image source={pngSource} style={s.badgeImg} resizeMode="contain" />
            ) : (
              <View style={s.badgeFallback}>
                <Feather name="award" size={70} color="#171717" />
              </View>
            )}
          </View>

          <Text style={s.badgeTitulo}>{insignia?.nombre ?? 'Insignia'}</Text>
          <Text style={s.badgeDesc}>{insignia?.descripcion ?? ''}</Text>

          {/* Serie de logros */}
          <View style={s.seriePill}>
            <Feather name="layers" size={13} color="#e5e5e5" style={{ marginRight: 6 }} />
            <Text style={s.serieText}>
              Logros en serie:{' '}
              <Text style={{ fontWeight: '700', color: '#fff' }}>
                {totalSerie} de {maxSerie}
              </Text>
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.btnPrimary}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MiColeccion')}
          >
            <Feather name="grid" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.btnPrimaryText}>Ver mi colección</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.btnText}>Continuar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, justifyContent: 'space-between' },
  content:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  congrats:       { fontStyle: 'italic', fontSize: 22, color: '#f1c40f', marginBottom: 4, textAlign: 'center' },
  logroTag:       { fontSize: 11, letterSpacing: 2, color: '#b5b5b5', fontWeight: '600', marginBottom: 32, textAlign: 'center' },
  badgeWrap:      {
    width: 180, height: 180,
    borderRadius: 90,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#f1c40f', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 14,
  },
  badgeImg:       { width: 180, height: 180 },
  badgeFallback:  { width: 180, height: 180, borderRadius: 90, backgroundColor: '#f39c12', justifyContent: 'center', alignItems: 'center' },
  badgeTitulo:    { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  badgeDesc:      { fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 28, maxWidth: 240 },
  seriePill:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  serieText:      { fontSize: 13, color: '#e5e5e5', fontWeight: '500' },
  actions:        { paddingHorizontal: 30, paddingBottom: 40, gap: 16 },
  btnPrimary:     { backgroundColor: '#1e7e34', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnText:        { color: '#b5b5b5', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
