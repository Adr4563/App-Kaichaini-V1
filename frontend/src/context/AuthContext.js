import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutos

export function AuthProvider({ children }) {
  const [usuario,        setUsuario]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [expiredMessage, setExpiredMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const u = await SecureStore.getItemAsync('usuario');
      if (u) {
        setUsuario(JSON.parse(u));
        _startTimer();
      }
      setLoading(false);
    })();
    return () => clearTimeout(timerRef.current);
  }, []);

  const _startTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(_autoLogout, INACTIVITY_MS);
  };

  const _autoLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    await SecureStore.deleteItemAsync('usuario');
    setUsuario(null);
    setExpiredMessage('Tu sesión ha expirado por inactividad');
  };

  const resetInactivityTimer = useCallback(() => {
    _startTimer();
  }, []);

  const login = async (data) => {
    await SecureStore.setItemAsync('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    setExpiredMessage('');
    _startTimer();
  };

  const logout = async () => {
    clearTimeout(timerRef.current);
    try { await api.post('/auth/logout'); } catch (_) {}
    await SecureStore.deleteItemAsync('usuario');
    setUsuario(null);
    setExpiredMessage('');
  };

  const updateUsuario = (data) => {
    setUsuario(data);
    SecureStore.setItemAsync('usuario', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{
      usuario, loading,
      expiredMessage, setExpiredMessage,
      login, logout, updateUsuario, resetInactivityTimer,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
