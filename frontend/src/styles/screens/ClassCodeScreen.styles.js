import { StyleSheet } from 'react-native';

export const C = {
  green:    '#1d6a40',
  textDark: '#111111',
  textGray: '#666666',
  border:   '#333333',
  white:    '#ffffff',
  errBg:    '#fdeeed',
  errBorder:'#e5b3b3',
  errText:  '#9c3333',
  placeholder: '#9e9e9e',
};

export const s = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: C.white },
  content: { flex: 1, padding: 30, paddingBottom: 40 },

  brand:    { fontSize: 24, fontStyle: 'italic', fontWeight: '700', color: C.green, marginBottom: 24 },
  title:    { fontSize: 24, fontWeight: '700', color: C.textDark, lineHeight: 30, marginBottom: 12 },
  subtitle: { fontSize: 14, color: C.textGray, lineHeight: 20, marginBottom: 24 },

  codeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 12 },
  codeBox: {
    width: 45,
    height: 52,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: C.textDark,
  },
  codeBoxFocus: { borderColor: C.green, borderWidth: 2 },

  helper: { fontSize: 12, color: C.placeholder, marginBottom: 24 },

  btnGroup: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btnHalf:  { flex: 1 },

  btnSecondary:     { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: C.textDark, fontSize: 15, fontWeight: '600' },

  btnDark:     { backgroundColor: '#1c1c1e', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnDarkText: { color: C.white, fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },

  errBox:     { backgroundColor: C.errBg, borderWidth: 1, borderColor: C.errBorder, borderRadius: 10, padding: 12, marginBottom: 24 },
  errBoxText: { fontSize: 13, color: C.errText, lineHeight: 18 },

  footer:     { textAlign: 'center', fontSize: 14, color: C.textGray, marginTop: 'auto' },
  footerBold: { color: C.textDark, fontWeight: '700' },
});
