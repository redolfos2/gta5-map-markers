
import React from 'react';
import { MapMarker } from '@/types/map';

interface MarkerListProps {
  markers: MapMarker[];
  selectedCategories: string[];
  onMarkerClick?: (marker: MapMarker) => void;
}

const MarkerList: React.FC<MarkerListProps> = ({ 
  markers, 
  selectedCategories,
  onMarkerClick 
}) => {
  const filteredMarkers = markers.filter(marker => 
    selectedCategories.length === 0 || selectedCategories.includes(marker.category.id)
  );

  return (
    <div className="bg-gta-dark gta-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Список меток ({filteredMarkers.length})
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredMarkers.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <div className="text-4xl mb-2">🗺️</div>
            <div>Нет меток для отображения</div>
            {selectedCategories.length > 0 && (
              <div className="text-sm mt-1">Попробуйте изменить фильтры</div>
            )}
          </div>
        ) : (
          filteredMarkers.map((marker) => (
            <div
              key={marker.id}
              onClick={() => onMarkerClick?.(marker)}
              className="p-3 bg-gta-darker rounded border border-gray-600 hover:border-gta-blue cursor-pointer transition-all duration-200 hover:scale-102"
            >
              <div className="flex items-start gap-3">
                <span 
                  className="text-xl"
                  style={{ color: marker.category.color }}
                >
                  {marker.category.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {marker.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {marker.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: `${marker.category.color}20`,
                        color: marker.category.color,
                        border: `1px solid ${marker.category.color}40`
                      }}
                    >
                      {marker.category.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {marker.createdAt.toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarkerList;
