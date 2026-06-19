import { StyleSheet } from 'react-native';

export const C = {
  green:     '#1d6a40',
  textDark:  '#111111',
  textGray:  '#555555',
  bgGray:    '#f3f3f3',
  border:    '#333333',
  forgot:    '#5b7484',
  checkGray: '#cccccc',
  white:     '#ffffff',
  error:     '#cc0000',
};

export const s = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: C.white },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  logoBox:  { width: 70, height: 70, borderWidth: 1, borderColor: C.border, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  logoText: { fontSize: 36, fontStyle: 'italic', fontWeight: '500', color: C.green },

  title:    { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.textGray, marginBottom: 30 },

  formGroup:    { marginBottom: 20 },
  label:        { fontSize: 13, color: C.textGray, marginBottom: 8 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input:        { width: '100%', paddingVertical: 14, paddingHorizontal: 16, paddingRight: 40, fontSize: 15, borderWidth: 1, borderColor: C.border, borderRadius: 12, color: C.textDark },
  checkIcon:    { position: 'absolute', right: 16, fontSize: 16, color: C.checkGray },

  forgotRow:  { alignItems: 'flex-end', marginTop: -10, marginBottom: 30 },
  forgotText: { fontSize: 13, color: C.forgot },

  expiredBox:  { backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0c040', borderRadius: 10, padding: 12, marginBottom: 14 },
  expiredText: { fontSize: 13, color: '#7a5c00', lineHeight: 18 },

  errorText: { fontSize: 13, color: C.error, marginBottom: 10 },

  btnPrimary:       { backgroundColor: C.green, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  btnDisabled:      { opacity: 0.5 },
  btnPrimaryText:   { color: C.white, fontSize: 16, fontWeight: '600' },
  btnSecondary:     { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  btnSecondaryText: { color: C.textDark, fontSize: 16, fontWeight: '600' },
});
