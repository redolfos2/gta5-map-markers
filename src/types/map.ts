
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
  icon: IconDefinition;
  color: string;
  isCustom?: boolean;
}

export interface MapZone {
  id: string;
  name: string;
  description: string;
  points: { x: number; y: number }[];
  color: string;
  type: 'safe' | 'danger' | 'neutral' | 'restricted';
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

// Импортируем иконки
import { 
  faStore, 
  faGasPump, 
  faHospital, 
  faUniversity, 
  faGamepad 
} from '@fortawesome/free-solid-svg-icons';

export const MARKER_CATEGORIES: MarkerCategory[] = [
  { id: 'shop', name: 'Магазины', icon: faStore, color: '#4ECCA3' },
  { id: 'gas', name: 'Заправки', icon: faGasPump, color: '#FFC107' },
  { id: 'hospital', name: 'Больницы', icon: faHospital, color: '#FF6B35' },
  { id: 'bank', name: 'Банки', icon: faUniversity, color: '#8B5CF6' },
  { id: 'entertainment', name: 'Развлечения', icon: faGamepad, color: '#00D4FF' },
];

export const ZONE_TYPES = [
  { id: 'safe', name: 'Безопасная зона', color: '#4ECCA3' },
  { id: 'danger', name: 'Опасная зона', color: '#FF6B35' },
  { id: 'neutral', name: 'Нейтральная зона', color: '#FFC107' },
  { id: 'restricted', name: 'Закрытая зона', color: '#8B5CF6' }
];
