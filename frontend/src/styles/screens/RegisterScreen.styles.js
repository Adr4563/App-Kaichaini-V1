import { StyleSheet } from 'react-native';

export const C = {
  green:        '#1d6a40',
  textDark:     '#111111',
  textGray:     '#666666',
  textLightGray:'#888888',
  bgGray:       '#f3f3f3',
  border:       '#333333',
  white:        '#ffffff',
  error:        '#cc0000',
  reqSuccess:   '#2e7d32',
  reqError:     '#9c3333',
};

export const s = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },
  content:{ padding: 24, paddingBottom: 40 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 15,
  },
  backBtn:     { fontSize: 22, color: C.textDark, lineHeight: 28 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },

  // ── Tarjeta de clase ──────────────────────────────────────────────────────
  classCard:    { backgroundColor: '#f6f6f6', borderRadius: 12, padding: 14, marginBottom: 24, gap: 3 },
  classLabel:   { fontSize: 10, color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  classTitle:   { fontSize: 15, color: C.textDark, fontWeight: '700' },
  classTeacher: { fontSize: 12, color: '#757575' },

  // ── Formulario ────────────────────────────────────────────────────────────
  formGroup:    { marginBottom: 20 },
  label:        { fontSize: 13, color: C.textGray, marginBottom: 6 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    color: C.textDark,
  },
  checkIcon:  { position: 'absolute', right: 16, fontSize: 14, color: '#bbb' },
  helperText: { fontSize: 11, color: C.textLightGray, marginTop: 6 },

  // ── Requisitos de contraseña ──────────────────────────────────────────────
  reqBox:      { backgroundColor: C.bgGray, borderRadius: 10, padding: 12, marginBottom: 20 },
  reqRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reqRowLast:  { marginBottom: 0 },
  reqCircle:   { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reqCircleOk:   { backgroundColor: C.reqSuccess },
  reqCircleFail: { backgroundColor: C.reqError },
  reqCircleText: { color: C.white, fontSize: 9, fontWeight: '700' },
  reqLabel:    { fontSize: 13, color: C.textGray },

  // ── Términos ──────────────────────────────────────────────────────────────
  termsRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  checkbox:   { width: 22, height: 22, backgroundColor: C.textDark, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxOff:{ backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  checkMark:  { color: C.white, fontSize: 14, fontWeight: '700' },
  termsText:  { fontSize: 13, color: C.textGray, lineHeight: 18, flex: 1 },
  termsBold:  { color: C.textDark, fontWeight: '700' },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorText: { fontSize: 13, color: C.error, marginBottom: 6 },
  errorLink: { fontSize: 13, color: '#5b7484', textDecorationLine: 'underline' },

  // ── Botón ─────────────────────────────────────────────────────────────────
  btnPrimary:     { backgroundColor: C.green, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 15 },
  btnDisabled:    { opacity: 0.5 },
  btnPrimaryText: { color: C.white, fontSize: 16, fontWeight: '600' },
});
