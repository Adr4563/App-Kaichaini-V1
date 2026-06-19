import "./global.css";
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Auth screens
import LoginScreen            from './src/screens/auth/LoginScreen';
import ClassCodeScreen        from './src/screens/auth/ClassCodeScreen';
import RegisterScreen         from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen   from './src/screens/auth/ForgotPasswordScreen';

// Student screens (tabs)
import MapaScreen             from './src/screens/student/MapaScreen';   // H.U. 117, 123, 302
import ProgresoScreen         from './src/screens/student/ProgresoScreen';
import RankingScreen          from './src/screens/student/RankingScreen';
import PerfilScreen           from './src/screens/student/PerfilScreen';

// Student screens (stack / modal)
import PersonalizarPerfilScreen   from './src/screens/student/PersonalizarPerfilScreen';
import UnirseAClaseScreen         from './src/screens/student/UnirseAClaseScreen';
import SilaboScreen               from './src/screens/student/SilaboScreen';
import MaterialScreen             from './src/screens/student/MaterialScreen';
import MiColeccionScreen          from './src/screens/student/MiColeccionScreen';          // H.U. 118
import InsigniaDesbloqueadaScreen from './src/screens/student/InsigniaDesbloqueadaScreen'; // H.U. 109
import EjercicioScreen            from './src/screens/student/EjercicioScreen';            // H.U. 309, 311, 312, 207
import EvaluacionModuloScreen     from './src/screens/student/EvaluacionModuloScreen';     // H.U. 314
import ConfigurarFeedbackScreen   from './src/screens/docente/ConfigurarFeedbackScreen';   // H.U. 207 (docente)

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Auth (no autenticado) ──────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="ClassCode"      component={ClassCodeScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// ── Tabs inferiores ────────────────────────────────────────────────────────────
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#929294',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          letterSpacing: 0.2,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#dcdcdc',
          borderRadius: 0,
          paddingTop: 10,
          paddingBottom: 22,
          paddingHorizontal: 0,
          height: 117,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
        },
        tabBarIcon: ({ color }) => {
          const icons = {
            Inicio:   'home',
            Progreso: 'bar-chart-2',
            Ranking:  'award',
            Perfil:   'user',
          };
          return <Feather name={icons[route.name]} size={26} color={color} strokeWidth={1.8} />;
        },
      })}
    >
      <Tab.Screen name="Inicio"   component={MapaScreen} />
      <Tab.Screen name="Progreso" component={ProgresoScreen} />
      <Tab.Screen name="Ranking"  component={RankingScreen} />
      <Tab.Screen name="Perfil"   component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ── Stack principal (tabs + pantallas de detalle) ──────────────────────────────
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"               component={AppTabs} />
      <Stack.Screen name="PersonalizarPerfil"   component={PersonalizarPerfilScreen} />
      <Stack.Screen name="UnirseAClase"         component={UnirseAClaseScreen} />
      <Stack.Screen name="Silabo"               component={SilaboScreen} />
      <Stack.Screen name="Material"             component={MaterialScreen} />
      <Stack.Screen name="MiColeccion"          component={MiColeccionScreen} />
      <Stack.Screen name="InsigniaDesbloqueada" component={InsigniaDesbloqueadaScreen} />
      <Stack.Screen name="Ejercicio"            component={EjercicioScreen} />
      <Stack.Screen name="EvaluacionModulo"     component={EvaluacionModuloScreen} />
      <Stack.Screen name="ConfigurarFeedback"   component={ConfigurarFeedbackScreen} />
    </Stack.Navigator>
  );
}

// ── Wrapper de inactividad ─────────────────────────────────────────────────────
function ActivityWrapper({ children }) {
  const { resetInactivityTimer } = useAuth();
  return (
    <View style={{ flex: 1 }} onTouchStart={resetInactivityTimer}>
      {children}
    </View>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
function RootNavigator() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  return usuario
    ? <ActivityWrapper><AppStack /></ActivityWrapper>
    : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
