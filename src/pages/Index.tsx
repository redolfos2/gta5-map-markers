import React, { useState, useCallback } from 'react';
import GTAMap from '@/components/GTAMap';
import CategoryFilter from '@/components/CategoryFilter';
import CategoryManager from '@/components/CategoryManager';
import UserPanel from '@/components/UserPanel';
import MarkerList from '@/components/MarkerList';
import ZoneManager from '@/components/ZoneManager';
import MapBackgroundManager from '@/components/MapBackgroundManager';
import { MapMarker, User, MARKER_CATEGORIES, MarkerCategory, MapZone } from '@/types/map';
import { toast } from 'sonner';

const Index = () => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Player',
    role: 'admin'
  });

  const [categories, setCategories] = useState<MarkerCategory[]>(MARKER_CATEGORIES);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [customMapBackground, setCustomMapBackground] = useState<string | null>(null);

  // Обновляем координаты меток для новых размеров карты (7x10 тайлов по 400px)
  const [markers, setMarkers] = useState<MapMarker[]>([
    {
      id: '1',
      x: 800,  // Центр левой части карты
      y: 600,
      title: 'Центральный магазин',
      description: 'Большой торговый центр с широким ассортиментом товаров',
      category: MARKER_CATEGORIES[0], // Магазины
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      x: 1400, // Центр карты
      y: 1200,
      title: 'Заправка Los Santos',
      description: 'Круглосуточная заправочная станция с мини-маркетом',
      category: MARKER_CATEGORIES[1], // Заправки
      createdAt: new Date('2024-01-16')
    },
    {
      id: '3',
      x: 600,  // Левая часть карты
      y: 1800,
      title: 'Больница общего профиля',
      description: 'Главная больница города с отделением скорой помощи',
      category: MARKER_CATEGORIES[2], // Больницы
      createdAt: new Date('2024-01-17')
    },
    {
      id: '4',
      x: 2000, // Правая часть карты
      y: 800,
      title: 'Банк Maze',
      description: 'Центральное отделение банка с банкоматами',
      category: MARKER_CATEGORIES[3], // Банки
      createdAt: new Date('2024-01-18')
    },
    {
      id: '5',
      x: 1200, // Центральная нижняя часть
      y: 2400,
      title: 'Игровой клуб',
      description: 'Развлекательный центр с игровыми автоматами и бильярдом',
      category: MARKER_CATEGORIES[4], // Развлечения
      createdAt: new Date('2024-01-19')
    }
  ]);

  const [zones, setZones] = useState<MapZone[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleAddMarker = useCallback((newMarker: Omit<MapMarker, 'id' | 'createdAt'>) => {
    const marker: MapMarker = {
      ...newMarker,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setMarkers(prev => [...prev, marker]);
  }, []);

  const handleDeleteMarker = useCallback((markerId: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
  }, []);

  const handleAddZone = useCallback((newZone: Omit<MapZone, 'id' | 'createdAt'>) => {
    const zone: MapZone = {
      ...newZone,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setZones(prev => [...prev, zone]);
  }, []);

  const handleDeleteZone = useCallback((zoneId: string) => {
    setZones(prev => prev.filter(zone => zone.id !== zoneId));
    if (focusedZone === zoneId) {
      setFocusedZone(null);
    }
  }, [focusedZone]);

  const handleEditZone = useCallback((zoneId: string, updates: Partial<MapZone>) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, ...updates } : zone
    ));
  }, []);

  const handleToggleDrawing = useCallback(() => {
    setIsDrawingMode(prev => !prev);
  }, []);

  const handleZoneSearch = useCallback((zoneId: string) => {
    setFocusedZone(zoneId);
    // Автоматически сбрасываем фокус через 5 секунд
    setTimeout(() => {
      setFocusedZone(null);
    }, 5000);
  }, []);

  const handleZoneFocus = useCallback((zoneId: string | null) => {
    setFocusedZone(zoneId);
  }, []);

  const handleAddCategory = useCallback((newCategory: Omit<MarkerCategory, 'id'>) => {
    const category: MarkerCategory = {
      ...newCategory,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, category]);
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    // Удаляем категорию только если она пользовательская
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (categoryToDelete?.isCustom) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // Удаляем все метки этой категории
      setMarkers(prev => prev.filter(marker => marker.category.id !== categoryId));
      
      // Убираем категорию из выбранных
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  }, [categories]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const handleRoleToggle = useCallback(() => {
    setUser(prev => ({
      ...prev,
      role: prev.role === 'admin' ? 'user' : 'admin'
    }));
    toast.success(`Переключено на роль: ${user.role === 'admin' ? 'Пользователь' : 'Администратор'}`);
  }, [user.role]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    toast.info(`${marker.title}: ${marker.description}`);
  }, []);

  const handleBackgroundChange = useCallback((backgroundUrl: string | null) => {
    setCustomMapBackground(backgroundUrl);
  }, []);

  return (
    <div className="min-h-screen bg-gta-darker">
      {/* Заголовок */}
      <div className="bg-gta-dark border-b border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🗺️ GTA Map - Интерактивная карта
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Управляйте метками и зонами на карте в стиле GTA 5 (7x10 тайлов)
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm">v1.1</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Боковая панель */}
        <div className="w-80 bg-gta-dark border-r border-gray-600 p-4 space-y-4 overflow-y-auto">
          <UserPanel 
            user={user}
            onRoleToggle={handleRoleToggle}
          />
          
          {user.role === 'admin' && (
            <>
              <MapBackgroundManager
                currentBackground={customMapBackground}
                onBackgroundChange={handleBackgroundChange}
              />
              
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
              
              <ZoneManager
                zones={zones}
                onAddZone={handleAddZone}
                onDeleteZone={handleDeleteZone}
                onEditZone={handleEditZone}
                isDrawingMode={isDrawingMode}
                onToggleDrawing={handleToggleDrawing}
                onZoneSearch={handleZoneSearch}
                focusedZone={focusedZone}
              />
            </>
          )}
          
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            availableCategories={categories}
          />
          
          <MarkerList
            markers={markers}
            selectedCategories={selectedCategories}
            onMarkerClick={handleMarkerClick}
            onDeleteMarker={user.role === 'admin' ? handleDeleteMarker : undefined}
          />
        </div>

        {/* Основная область с картой */}
        <div className="flex-1 p-4">
          <GTAMap
            user={user}
            markers={markers}
            zones={zones}
            onDeleteMarker={user.role === 'admin' ? handleDeleteMarker : undefined}
            onDeleteZone={user.role === 'admin' ? handleDeleteZone : undefined}
            selectedCategories={selectedCategories}
            availableCategories={categories}
            focusedZone={focusedZone}
            onZoneFocus={handleZoneFocus}
            customMapImage={customMapBackground}
          />
        </div>
      </div>

      {/* Нижняя панель с информацией */}
      <div className="bg-gta-dark border-t border-gray-600 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Меток на карте: {markers.filter(m => selectedCategories.length === 0 || selectedCategories.includes(m.category.id)).length} | Зон: {zones.length} | Размер карты: 2800x4000px (7x10 тайлов)
          </div>
          <div className="flex items-center gap-4">
            <span>🖱️ Колесико мыши - масштабирование</span>
            <span>🖱️ ЛКМ + перетаскивание - перемещение</span>
            <span>🔍 Поиск зон через боковое меню</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
