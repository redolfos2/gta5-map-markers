
import React, { useState, useRef, useCallback } from 'react';
import { MapMarker, MarkerCategory, User } from '@/types/map';
import { MapPin } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'sonner';

interface GTAMapProps {
  user: User;
  markers: MapMarker[];
  onAddMarker: (marker: Omit<MapMarker, 'id' | 'createdAt'>) => void;
  selectedCategories: string[];
  availableCategories: MarkerCategory[];
}

const GTAMap: React.FC<GTAMapProps> = ({ 
  user, 
  markers, 
  onAddMarker, 
  selectedCategories,
  availableCategories
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [newMarkerPos, setNewMarkerPos] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredMarkers = markers.filter(marker => 
    selectedCategories.length === 0 || selectedCategories.includes(marker.category.id)
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newScale = e.deltaY > 0 
      ? Math.max(0.5, scale - zoomFactor)
      : Math.min(3, scale + zoomFactor);
    setScale(newScale);
  }, [scale]);

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

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Добавляем метку только если пользователь админ и не было перетаскивания
    if (user.role === 'admin' && !isDragging) {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;
        setNewMarkerPos({ x, y });
        setShowAddMarker(true);
      }
    }
  }, [user.role, isDragging, position, scale]);

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

  return (
    <div className="relative w-full h-full overflow-hidden bg-gta-darker rounded-lg gta-border">
      {/* Карта */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(78, 204, 163, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, #0F1419 0%, #1a1f26 50%, #0F1419 100%)
          `,
          backgroundSize: '100px 100px, 100px 100px, 100% 100%'
        }}
      >
        {/* Сетка карты */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Метки */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
        >
          {filteredMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer gta-marker"
              style={{
                left: marker.x,
                top: marker.y,
                color: marker.category.color
              }}
              onMouseEnter={() => setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              <FontAwesomeIcon 
                icon={marker.category.icon} 
                className="text-2xl"
              />
              
              {/* Подсказка */}
              {hoveredMarker === marker.id && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gta-dark border gta-border rounded-lg p-2 min-w-[200px] z-50">
                  <div className="text-sm font-semibold text-white">{marker.title}</div>
                  <div className="text-xs text-gray-300 mt-1">{marker.description}</div>
                  <div className="text-xs text-gta-blue mt-1">{marker.category.name}</div>
                </div>
              )}
            </div>
          ))}

          {/* Предварительная метка для администратора */}
          {user.role === 'admin' && showAddMarker && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"
              style={{
                left: newMarkerPos.x,
                top: newMarkerPos.y,
                color: '#00D4FF'
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

      {/* Элементы управления */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setScale(Math.min(3, scale + 0.2))}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors"
        >
          -
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="bg-gta-dark gta-border rounded p-2 text-gta-blue hover:bg-gta-blue hover:text-gta-dark transition-colors text-xs"
        >
          Reset
        </button>
      </div>

      {/* Информация о масштабе */}
      <div className="absolute top-4 right-4 bg-gta-dark gta-border rounded px-3 py-1 text-sm text-gta-blue">
        Масштаб: {Math.round(scale * 100)}%
      </div>

      {/* Инструкция для администратора */}
      {user.role === 'admin' && (
        <div className="absolute top-4 left-4 bg-gta-dark gta-border rounded px-3 py-1 text-sm text-gta-green">
          Двойной клик на карту для добавления метки
        </div>
      )}
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

export default GTAMap;
