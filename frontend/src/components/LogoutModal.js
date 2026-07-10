import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LogoutModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>¿Cerrar sesión?</Text>
          <Text style={s.body}>
            Tu progreso ya está guardado. Volverás a la pantalla de inicio de sesión.
          </Text>
          <View style={s.btnRow}>
            <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={onCancel}>
              <Text style={s.btnSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.btnDanger]} onPress={onConfirm}>
              <Text style={s.btnDangerText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 10 },
  body:  { fontSize: 14, color: '#666666', lineHeight: 20, marginBottom: 24 },
  btnRow:          { flexDirection: 'row', gap: 12 },
  btn:             { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnSecondary:    { backgroundColor: '#fff', borderWidth: 1, borderColor: '#000' },
  btnSecondaryText:{ fontSize: 16, fontWeight: '700', color: '#111' },
  btnDanger:       { backgroundColor: '#a43e3e' },
  btnDangerText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});
