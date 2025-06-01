
export interface MapMarker {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  category: MarkerCategory;
  createdAt: Date;
}

export interface MarkerCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export const MARKER_CATEGORIES: MarkerCategory[] = [
  { id: 'shop', name: 'Магазины', icon: '🏪', color: '#4ECCA3' },
  { id: 'gas', name: 'Заправки', icon: '⛽', color: '#FFC107' },
  { id: 'hospital', name: 'Больницы', icon: '🏥', color: '#FF6B35' },
  { id: 'bank', name: 'Банки', icon: '🏦', color: '#8B5CF6' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎮', color: '#00D4FF' },
];
