
import React, { useState } from 'react';
import { MapZone, ZONE_TYPES } from '@/types/map';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface ZoneManagerProps {
  zones: MapZone[];
  onAddZone: (zone: Omit<MapZone, 'id' | 'createdAt'>) => void;
  onDeleteZone: (zoneId: string) => void;
  onEditZone: (zoneId: string, zone: Partial<MapZone>) => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
}

const ZoneManager: React.FC<ZoneManagerProps> = ({
  zones,
  onAddZone,
  onDeleteZone,
  onEditZone,
  isDrawingMode,
  onToggleDrawing
}) => {
  const [selectedZoneType, setSelectedZoneType] = useState(ZONE_TYPES[0]);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

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

  return (
    <div className="bg-gta-darker gta-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Управление зонами</h3>
        <button
          onClick={onToggleDrawing}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            isDrawingMode 
              ? 'bg-gta-green text-gta-dark' 
              : 'bg-gta-dark text-gta-green hover:bg-gta-green hover:text-gta-dark'
          }`}
        >
          {isDrawingMode ? 'Завершить рисование' : 'Нарисовать зону'}
        </button>
      </div>

      {isDrawingMode && (
        <div className="bg-gta-dark gta-border rounded p-3 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Тип зоны:
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
          <div className="text-xs text-gray-400">
            Кликайте на карте, чтобы создать точки зоны. Двойной клик завершит зону.
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {zones.map(zone => (
          <div key={zone.id} className="bg-gta-dark gta-border rounded p-3">
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
