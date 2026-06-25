// ModulosClaseDocenteScreen.js
// Visualizacion de modulos de una clase (docente) - historia de usuario futura, fuera de alcance de H.U. 317
// TODO: pantalla en blanco a proposito, pendiente de implementar.

import React from 'react';
import { View } from 'react-native';

export default function ModulosClaseDocenteScreen({ route }) {
  const { idClase, nombreClase } = route.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }} />
  );
}
