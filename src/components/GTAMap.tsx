import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapMarker, MarkerCategory, User, MapZone, ZONE_TYPES } from '@/types/map';
import { Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'sonner';

interface GTAMapProps {
  user: User;
  markers: MapMarker[];
  zones: MapZone[];
  onDeleteMarker?: (markerId: string) => void;
  onDeleteZone?: (zoneId: string) => void;
  selectedCategories: string[];
  availableCategories: MarkerCategory[];
  focusedZone?: string | null;
  onZoneFocus?: (zoneId: string | null) => void;
  customMapImage?: string;
}

const GTAMap: React.FC<GTAMapProps> = ({ 
  user, 
  markers, 
  zones,
  onDeleteMarker,
  onDeleteZone,
  selectedCategories,
  availableCategories,
  focusedZone,
  onZoneFocus,
  customMapImage
}) => {
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Увеличиваем размеры карты для правильного отображения
  const MAP_WIDTH = 7 * 400; // 7 столбцов по 400px каждый
  const MAP_HEIGHT = 10 * 400; // 10 строк по 400px каждый
  const COLUMNS = 7;
  const ROWS = 10;
  const TILE_WIDTH = MAP_WIDTH / COLUMNS;
  const TILE_HEIGHT = MAP_HEIGHT / ROWS;

  // Инициализация позиции карты по центру
  useEffect(() => {
    if (mapRef.current) {
      const containerRect = mapRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2 - (MAP_WIDTH * scale) / 2;
      const centerY = containerRect.height / 2 - (MAP_HEIGHT * scale) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [scale]);

  // Обработка фокуса на зону
  useEffect(() => {
    if (focusedZone && mapRef.current) {
      const zone = zones.find(z => z.id === focusedZone);
      if (zone && zone.points.length > 0) {
        // Находим центр зоны
        const centerX = zone.points.reduce((sum, point) => sum + point.x, 0) / zone.points.length;
        const centerY = zone.points.reduce((sum, point) => sum + point.y, 0) / zone.points.length;
        
        // Перемещаем карту к центру зоны
        const containerRect = mapRef.current.getBoundingClientRect();
        const newX = containerRect.width / 2 - centerX * scale;
        const newY = containerRect.height / 2 - centerY * scale;
        
        setPosition({ x: newX, y: newY });
      }
    }
  }, [focusedZone, zones, scale]);

  const filteredMarkers = markers.filter(marker => 
    selectedCategories.length === 0 || selectedCategories.includes(marker.category.id)
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Вычисляем точку на карте, на которую указывает курсор
    const mapX = (mouseX - position.x) / scale;
    const mapY = (mouseY - position.y) / scale;
    
    const zoomFactor = 0.1;
    const newScale = e.deltaY > 0 
      ? Math.max(0.3, scale - zoomFactor)
      : Math.min(1.5, scale + zoomFactor);
    
    // Пересчитываем позицию так, чтобы точка под курсором осталась на месте
    const newX = mouseX - mapX * newScale;
    const newY = mouseY - mapY * newScale;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [scale, position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPosition(newPosition);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDeleteMarker = (markerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteMarker) {
      onDeleteMarker(markerId);
      toast.success('Метка удалена!');
    }
    setHoveredMarker(null);
  };

  const resetView = () => {
    if (mapRef.current) {
      const containerRect = mapRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2 - (MAP_WIDTH * 0.8) / 2;
      const centerY = containerRect.height / 2 - (MAP_HEIGHT * 0.8) / 2;
      setScale(0.8);
      setPosition({ x: centerX, y: centerY });
    }
  };

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mapX = (centerX - position.x) / scale;
    const mapY = (centerY - position.y) / scale;
    
    const newScale = Math.min(1.5, scale + 0.2);
    
    const newX = centerX - mapX * newScale;
    const newY = centerY - mapY * newScale;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mapX = (centerX - position.x) / scale;
    const mapY = (centerY - position.y) / scale;
    
    const newScale = Math.max(0.3, scale - 0.2);
    
    const newX = centerX - mapX * newScale;
    const newY = centerY - mapY * newScale;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  // Функция для создания SVG пути из точек зоны
  const createZonePath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path}${command}${point.x},${point.y}`;
    }, '');
    
    return `${pathData}Z`;
  };

  // Функция для создания сетки тайлов
  const renderTileGrid = () => {
    const tiles = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const x = col * TILE_WIDTH;
        const y = row * TILE_HEIGHT;
        const tileName = `${col}x${row}`;
        
        tiles.push(
          <div
            key={tileName}
            className="absolute border border-gray-400/20"
            style={{
              left: x,
              top: y,
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
              backgroundImage: customMapImage 
                ? `url('${customMapImage}')` 
                : `url('/lovable-uploads/2b63f3e1-c58a-4feb-9d8f-019f56782f3a.png')`,
              backgroundSize: `${MAP_WIDTH}px ${MAP_HEIGHT}px`,
              backgroundPosition: `-${x}px -${y}px`,
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Название тайла при большом масштабе */}
            {scale > 0.6 && (
              <div 
                className="absolute top-1 left-1 text-xs text-white/60 font-mono bg-black/20 px-1 rounded pointer-events-none"
                style={{ fontSize: Math.max(8, 10 * scale) }}
              >
                {tileName}
              </div>
            )}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gta-darker rounded-lg gta-border">
      {/* Контейнер карты */}
      <div
        ref={mapRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ backgroundColor: '#1862ad' }}
      >
        {/* Контейнер для карты и меток с трансформациями */}
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Основа карты */}
          <div
            className="relative"
            style={{
              width: `${MAP_WIDTH}px`,
              height: `${MAP_HEIGHT}px`,
              backgroundColor: '#1862ad'
            }}
          >
            {/* Тайлы карты */}
            {renderTileGrid()}
          </div>

          {/* SVG для зон */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            style={{ zIndex: 1 }}
          >
            {/* Отрисовка зон */}
            {zones.map(zone => (
              <g key={zone.id}>
                <path
                  d={createZonePath(zone.points)}
                  fill={zone.color}
                  fillOpacity={focusedZone === zone.id ? 0.6 : 0.3}
                  stroke={zone.color}
                  strokeWidth={focusedZone === zone.id ? 4 : 2}
                  strokeOpacity={focusedZone === zone.id ? 1 : 0.8}
                  className="pointer-events-auto cursor-pointer"
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onZoneFocus && onZoneFocus(zone.id)}
                />
                {/* Анимированная обводка для выбранной зоны */}
                {focusedZone === zone.id && (
                  <path
                    d={createZonePath(zone.points)}
                    fill="none"
                    stroke="#00D4FF"
                    strokeWidth={6}
                    strokeOpacity={0.8}
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Подсказки для зон */}
          {hoveredZone && (
            <div
              className="absolute bg-gta-dark border gta-border rounded-lg p-3 min-w-[200px] z-50 pointer-events-none"
              style={{
                left: zones.find(z => z.id === hoveredZone)?.points[0]?.x || 0,
                top: (zones.find(z => z.id === hoveredZone)?.points[0]?.y || 0) - 60,
                transform: 'translate(-50%, 0)'
              }}
            >
              {(() => {
                const zone = zones.find(z => z.id === hoveredZone);
                if (!zone) return null;
                return (
                  <>
                    <div className="text-sm font-semibold text-white">{zone.name}</div>
                    <div className="text-xs text-gray-300 mt-1">{zone.description}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span 
                        className="text-xs px-2 py-1 rounded" 
                        style={{ backgroundColor: zone.color + '20', color: zone.color }}
                      >
                        {ZONE_TYPES.find(t => t.id === zone.type)?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {zone.points.length} точек
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Метки */}
          {filteredMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute gta-marker"
              style={{
                left: marker.x,
                top: marker.y,
                color: marker.category.color,
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                zIndex: 2
              }}
              onMouseEnter={() => setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              <FontAwesomeIcon 
                icon={marker.category.icon} 
                className="text-2xl cursor-pointer"
              />
              
              {/* Подсказка - показывается выше иконки */}
              {hoveredMarker === marker.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gta-dark border gta-border rounded-lg p-3 min-w-[250px] z-50 pointer-events-auto">
                  <div className="text-sm font-semibold text-white">{marker.title}</div>
                  <div className="text-xs text-gray-300 mt-1">{marker.description}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gta-blue">{marker.category.name}</span>
                    {user.role === 'admin' && onDeleteMarker && (
                      <button
                        onClick={(e) => handleDeleteMarker(marker.id, e)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Удалить метку"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {/* Стрелка указывающая на иконку */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gta-dark"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Элементы управления */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors text-xs"
        >
          Reset
        </button>
      </div>

      {/* Информация о масштабе */}
      <div className="absolute top-4 right-4 bg-gta-dark gta-border rounded px-3 py-1 text-sm text-gta-blue">
        Масштаб: {Math.round(scale * 100)}%
      </div>

      {/* Инструкция */}
      <div className="absolute top-4 left-4 bg-gta-dark gta-border rounded px-3 py-1 text-sm">
        <span className="text-gray-300">Просмотр карты • Клик на зону для выделения</span>
      </div>
    </div>
  );
};

export default GTAMap;
