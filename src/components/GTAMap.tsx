import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapMarker, MarkerCategory, User, MapZone, ZONE_TYPES } from '@/types/map';
import { MapPin, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'sonner';

interface GTAMapProps {
  user: User;
  markers: MapMarker[];
  zones: MapZone[];
  onAddMarker: (marker: Omit<MapMarker, 'id' | 'createdAt'>) => void;
  onDeleteMarker?: (markerId: string) => void;
  onAddZone: (zone: Omit<MapZone, 'id' | 'createdAt'>) => void;
  onDeleteZone?: (zoneId: string) => void;
  selectedCategories: string[];
  availableCategories: MarkerCategory[];
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
}

const GTAMap: React.FC<GTAMapProps> = ({ 
  user, 
  markers, 
  zones,
  onAddMarker,
  onDeleteMarker,
  onAddZone,
  onDeleteZone,
  selectedCategories,
  availableCategories,
  isDrawingMode,
  onToggleDrawing
}) => {
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [newMarkerPos, setNewMarkerPos] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [currentZonePoints, setCurrentZonePoints] = useState<{ x: number; y: number }[]>([]);
  const [showZoneForm, setShowZoneForm] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const MAP_SIZE = 2400;

  // Инициализация позиции карты по центру
  useEffect(() => {
    if (mapRef.current) {
      const containerRect = mapRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2 - (MAP_SIZE * scale) / 2;
      const centerY = containerRect.height / 2 - (MAP_SIZE * scale) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [scale]);

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
      ? Math.max(0.2, scale - zoomFactor)
      : Math.min(2, scale + zoomFactor);
    
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

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    
    if (isDrawingMode) {
      // Добавляем точку к текущей зоне
      setCurrentZonePoints(prev => [...prev, { x, y }]);
    } else if (user.role === 'admin') {
      // Добавляем метку
      setNewMarkerPos({ x, y });
      setShowAddMarker(true);
    }
  }, [user.role, isDragging, position, scale, isDrawingMode]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isDrawingMode && currentZonePoints.length >= 3) {
      // Завершаем рисование зоны
      setShowZoneForm(true);
    }
  }, [isDrawingMode, currentZonePoints]);

  const addMarker = (title: string, description: string, category: MarkerCategory) => {
    onAddMarker({
      x: newMarkerPos.x,
      y: newMarkerPos.y,
      title,
      description,
      category
    });
    setShowAddMarker(false);
    toast.success('Метка добавлена!');
  };

  const addZone = (name: string, description: string, type: string) => {
    const zoneType = ZONE_TYPES.find(t => t.id === type) || ZONE_TYPES[0];
    onAddZone({
      name,
      description,
      points: currentZonePoints,
      color: zoneType.color,
      type: type as 'safe' | 'danger' | 'neutral' | 'restricted'
    });
    setCurrentZonePoints([]);
    setShowZoneForm(false);
    onToggleDrawing();
    toast.success('Зона создана!');
  };

  const cancelZoneDrawing = () => {
    setCurrentZonePoints([]);
    setShowZoneForm(false);
    onToggleDrawing();
  };

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
      const centerX = containerRect.width / 2 - (MAP_SIZE * 0.5) / 2;
      const centerY = containerRect.height / 2 - (MAP_SIZE * 0.5) / 2;
      setScale(0.5);
      setPosition({ x: centerX, y: centerY });
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(2, scale + 0.2);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.2, scale - 0.2);
    setScale(newScale);
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

  return (
    <div className="relative w-full h-full overflow-hidden bg-gta-darker rounded-lg gta-border">
      {/* Контейнер карты */}
      <div
        ref={mapRef}
        className={`w-full h-full relative ${isDrawingMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
        onDoubleClick={handleDoubleClick}
        style={{
          backgroundColor: '#1862ad'
        }}
      >
        {/* Контейнер для карты и меток с трансформациями */}
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Изображение карты GTA 5 */}
          <div
            className="relative"
            style={{
              backgroundImage: `url('/lovable-uploads/2b63f3e1-c58a-4feb-9d8f-019f56782f3a.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: `${MAP_SIZE}px`,
              height: `${MAP_SIZE}px`
            }}
          />

          {/* SVG для зон */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={MAP_SIZE}
            height={MAP_SIZE}
            style={{ zIndex: 1 }}
          >
            {/* Отрисовка существующих зон */}
            {zones.map(zone => (
              <path
                key={zone.id}
                d={createZonePath(zone.points)}
                fill={zone.color}
                fillOpacity={0.3}
                stroke={zone.color}
                strokeWidth={2}
                strokeOpacity={0.8}
              />
            ))}
            
            {/* Отрисовка текущей рисуемой зоны */}
            {currentZonePoints.length > 0 && (
              <>
                <path
                  d={createZonePath(currentZonePoints)}
                  fill="rgba(0, 212, 255, 0.3)"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
                {currentZonePoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill="#00D4FF"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </>
            )}
          </svg>

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

          {/* Предварительная метка для администратора */}
          {user.role === 'admin' && showAddMarker && (
            <div
              className="absolute animate-pulse-glow"
              style={{
                left: newMarkerPos.x,
                top: newMarkerPos.y,
                color: '#00D4FF',
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                zIndex: 2
              }}
            >
              <MapPin size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления метки */}
      {showAddMarker && user.role === 'admin' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gta-dark gta-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Добавить метку</h3>
            <AddMarkerForm
              onAdd={addMarker}
              onCancel={() => setShowAddMarker(false)}
              availableCategories={availableCategories}
            />
          </div>
        </div>
      )}

      {/* Модальное окно создания зоны */}
      {showZoneForm && user.role === 'admin' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gta-dark gta-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Создать зону</h3>
            <AddZoneForm
              onAdd={addZone}
              onCancel={cancelZoneDrawing}
            />
          </div>
        </div>
      )}

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
        {isDrawingMode ? (
          <span className="text-gta-green">Режим рисования зон активен</span>
        ) : user.role === 'admin' ? (
          <span className="text-gta-green">Клик на карту для добавления метки</span>
        ) : (
          <span className="text-gray-300">Просмотр карты</span>
        )}
      </div>
    </div>
  );
};

// Компонент формы добавления метки
interface AddMarkerFormProps {
  onAdd: (title: string, description: string, category: MarkerCategory) => void;
  onCancel: () => void;
  availableCategories: MarkerCategory[];
}

const AddMarkerForm: React.FC<AddMarkerFormProps> = ({ onAdd, onCancel, availableCategories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory>(availableCategories[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      onAdd(title, description, selectedCategory);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Название
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
          placeholder="Название метки"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
          placeholder="Описание метки"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Категория
        </label>
        <select
          value={selectedCategory.id}
          onChange={(e) => {
            const category = availableCategories.find(c => c.id === e.target.value);
            if (category) setSelectedCategory(category);
          }}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
        >
          {availableCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 gta-button"
        >
          Добавить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};

// Компонент формы добавления зоны
interface AddZoneFormProps {
  onAdd: (name: string, description: string, type: string) => void;
  onCancel: () => void;
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState(ZONE_TYPES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onAdd(name, description, selectedType.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Название зоны
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
          placeholder="Название зоны"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
          placeholder="Описание зоны"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Тип зоны
        </label>
        <select
          value={selectedType.id}
          onChange={(e) => {
            const type = ZONE_TYPES.find(t => t.id === e.target.value);
            if (type) setSelectedType(type);
          }}
          className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
        >
          {ZONE_TYPES.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 gta-button"
        >
          Создать зону
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};

export default GTAMap;
