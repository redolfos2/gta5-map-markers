
import React from 'react';
import { MarkerCategory, MARKER_CATEGORIES } from '@/types/map';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onCategoryToggle
}) => {
  const isAllSelected = selectedCategories.length === 0;

  const handleSelectAll = () => {
    // Если все выбрано, сбрасываем выбор
    if (isAllSelected) {
      return;
    }
    // Иначе выбираем все (сбрасываем массив)
    selectedCategories.forEach(categoryId => {
      onCategoryToggle(categoryId);
    });
  };

  return (
    <div className="bg-gta-dark gta-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Категории меток</h3>
      
      {/* Кнопка "Все категории" */}
      <button
        onClick={handleSelectAll}
        className={`w-full mb-3 px-4 py-2 rounded-lg transition-all duration-200 ${
          isAllSelected
            ? 'bg-gta-blue text-gta-dark font-semibold'
            : 'bg-gta-darker text-gray-300 hover:bg-gray-600'
        }`}
      >
        🗺️ Все категории
      </button>

      {/* Список категорий */}
      <div className="space-y-2">
        {MARKER_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'text-gta-dark font-semibold scale-105'
                  : 'bg-gta-darker text-gray-300 hover:bg-gray-600 hover:scale-102'
              }`}
              style={{
                backgroundColor: isSelected ? category.color : undefined,
                boxShadow: isSelected ? `0 0 15px ${category.color}40` : undefined
              }}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="flex-1 text-left">{category.name}</span>
              {isSelected && (
                <span className="text-sm opacity-80">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Счетчик выбранных категорий */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="text-sm text-gray-400 text-center">
          {isAllSelected 
            ? 'Показаны все категории' 
            : `Выбрано: ${selectedCategories.length} из ${MARKER_CATEGORIES.length}`
          }
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
