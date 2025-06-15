import React, { useState } from 'react';
import { MapZone, ZONE_TYPES } from '@/types/map';
import { Trash2, Plus, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ZoneManagerProps {
  zones: MapZone[];
  onAddZone: (zone: Omit<MapZone, 'id' | 'createdAt'>) => void;
  onDeleteZone: (zoneId: string) => void;
  onEditZone: (zoneId: string, zone: Partial<MapZone>) => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
  onZoneSearch?: (zoneId: string) => void;
  focusedZone?: string | null;
}

const ZoneManager: React.FC<ZoneManagerProps> = ({
  zones,
  onAddZone,
  onDeleteZone,
  onEditZone,
  isDrawingMode,
  onToggleDrawing,
  onZoneSearch,
  focusedZone
}) => {
  const [selectedZoneType, setSelectedZoneType] = useState(ZONE_TYPES[0]);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDescription, setNewZoneDescription] = useState('');

  const handleStartEdit = (zone: MapZone) => {
    setEditingZone(zone.id);
    setEditName(zone.name);
    setEditDescription(zone.description);
  };

  const handleSaveEdit = () => {
    if (editingZone) {
      onEditZone(editingZone, {
        name: editName,
        description: editDescription
      });
      setEditingZone(null);
      toast.success('Зона обновлена!');
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditName('');
    setEditDescription('');
  };

  const handleShowAddForm = () => {
    if (!isDrawingMode) {
      onToggleDrawing();
    }
    setShowAddForm(true);
  };

  const handleAddZone = () => {
    if (newZoneName.trim() && newZoneDescription.trim()) {
      // Создаем пример зоны с правильными координатами для новой карты (2800x4000px)
      const centerX = 1400; // Центр карты по X
      const centerY = 2000; // Центр карты по Y
      const size = 300; // Размер зоны
      
      const examplePoints = [
        { x: centerX - size + Math.random() * 200, y: centerY - size + Math.random() * 200 },
        { x: centerX + size + Math.random() * 200, y: centerY - size + Math.random() * 200 },
        { x: centerX + size + Math.random() * 200, y: centerY + size + Math.random() * 200 },
        { x: centerX - size + Math.random() * 200, y: centerY + size + Math.random() * 200 }
      ];

      onAddZone({
        name: newZoneName,
        description: newZoneDescription,
        points: examplePoints,
        color: selectedZoneType.color,
        type: selectedZoneType.id as 'safe' | 'danger' | 'neutral' | 'restricted'
      });

      setNewZoneName('');
      setNewZoneDescription('');
      setShowAddForm(false);
      onToggleDrawing();
      toast.success('Зона создана в центре карты!');
    }
  };

  const handleCancelAdd = () => {
    setNewZoneName('');
    setNewZoneDescription('');
    setShowAddForm(false);
    if (isDrawingMode) {
      onToggleDrawing();
    }
  };

  const handleZoneSearch = (zoneId: string) => {
    if (onZoneSearch) {
      onZoneSearch(zoneId);
      toast.success('Перемещение к зоне');
    }
  };

  return (
    <div className="bg-gta-darker gta-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Управление зонами</h3>
        <button
          onClick={handleShowAddForm}
          className="bg-gta-green text-gta-dark px-3 py-1 rounded text-sm hover:bg-green-400 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gta-dark gta-border rounded p-4 space-y-3">
          <h4 className="text-white font-medium">Создать новую зону</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
              placeholder="Название зоны"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={newZoneDescription}
              onChange={(e) => setNewZoneDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gta-darker border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
              placeholder="Описание зоны"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Тип зоны
            </label>
            <select
              value={selectedZoneType.id}
              onChange={(e) => {
                const type = ZONE_TYPES.find(t => t.id === e.target.value);
                if (type) setSelectedZoneType(type);
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

          <div className="text-xs text-gray-400 bg-blue-900/20 p-2 rounded">
            💡 Зона будет создана в центре карты. Размер карты: 2800x4000px (7x10 тайлов по 400px)
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddZone}
              className="flex-1 bg-gta-green text-gta-dark px-3 py-2 rounded hover:bg-green-400 transition-colors"
            >
              Создать
            </button>
            <button
              onClick={handleCancelAdd}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {zones.map(zone => (
          <div 
            key={zone.id} 
            className={`bg-gta-dark gta-border rounded p-3 transition-all ${
              focusedZone === zone.id ? 'ring-2 ring-gta-blue' : ''
            }`}
          >
            {editingZone === zone.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 bg-gta-darker border gta-border rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-gta-blue"
                  placeholder="Название зоны"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-2 py-1 bg-gta-darker border gta-border rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-gta-blue"
                  placeholder="Описание зоны"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gta-green text-gta-dark px-2 py-1 rounded text-sm hover:bg-green-400 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white text-sm">{zone.name}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleZoneSearch(zone.id)}
                      className="text-gta-blue hover:text-blue-300 transition-colors"
                      title="Найти на карте"
                    >
                      <Search size={14} />
                    </button>
                    <button
                      onClick={() => handleStartEdit(zone)}
                      className="text-gta-blue hover:text-blue-300 transition-colors"
                      title="Редактировать зону"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        onDeleteZone(zone.id);
                        toast.success('Зона удалена!');
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Удалить зону"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mb-2">{zone.description}</p>
                <div className="flex items-center justify-between">
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
            )}
          </div>
        ))}
        {zones.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Нет созданных зон
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneManager;
