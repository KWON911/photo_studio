import type { Frame, FrameId } from '../types/photo';

export const frames: Frame[] = [
  { id: 'studio', name: 'STUDIO', background: '#f7f5f0', color: '#242321', gap: 26, padding: 46, footerHeight: 180, label: 'GAMSUNG STUDIO · 04', showDate: true, decoration: 'studio' },
  { id: 'negative', name: 'NEGATIVE', background: '#191919', color: '#f7f4ed', gap: 26, padding: 46, footerHeight: 180, label: 'FILM 04', showDate: true, decoration: 'film' },
  { id: 'archive', name: 'ARCHIVE', background: '#e9e4da', color: '#302d28', gap: 30, padding: 52, footerHeight: 180, label: 'ARCHIVE · 2026', showDate: true, decoration: 'archive' },
  { id: 'white', name: '화이트', background: '#fff', color: '#181818', gap: 26, padding: 46, footerHeight: 180, showDate: true },
  { id: 'black', name: '블랙', background: '#202020', color: '#fff', gap: 26, padding: 46, footerHeight: 180, showDate: true },
  { id: 'cream', name: '크림', background: '#e9dfd1', color: '#302a25', gap: 30, padding: 52, footerHeight: 180, showDate: true },
  { id: 'charcoal', name: '차콜', background: '#393a39', color: '#f5f2ec', gap: 24, padding: 44, footerHeight: 165, showDate: true },
  { id: 'dusty-pink', name: '더스티 핑크', background: '#d6b9b5', color: '#392f2e', gap: 28, padding: 50, footerHeight: 175, showDate: true },
  { id: 'sage', name: '세이지', background: '#b8c3b2', color: '#283027', gap: 28, padding: 50, footerHeight: 175, showDate: true },
  { id: 'navy', name: '네이비', background: '#293747', color: '#f4f0e9', gap: 25, padding: 46, footerHeight: 175, showDate: true },
  { id: 'film', name: '필름', background: '#ece5d7', color: '#292622', gap: 18, padding: 38, footerHeight: 210, label: 'FILM 04', showDate: true, decoration: 'film' },
];

export const frameById = (id: FrameId) => frames.find((frame) => frame.id === id) ?? frames[0];
