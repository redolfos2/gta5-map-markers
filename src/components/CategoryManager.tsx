
import React, { useState } from 'react';
import { MarkerCategory } from '@/types/map';
import { Plus, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { toast } from 'sonner';
import IconSelector from './IconSelector';

interface CategoryManagerProps {
  categories: MarkerCategory[];
  onAddCategory: (category: Omit<MarkerCategory, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: faStore as IconDefinition,
    color: '#4ECCA3'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      onAddCategory({
        ...newCategory,
        isCustom: true
      });
      setNewCategory({ name: '', icon: faStore, color: '#4ECCA3' });
      setShowAddForm(false);
      toast.success('Категория добавлена!');
    }
  };

  const customCategories = categories.filter(cat => cat.isCustom);

  return (
    <div className="bg-gta-dark gta-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Управление категориями</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-gta-blue text-gta-dark rounded hover:bg-opacity-80 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gta-darker rounded border border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Название</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gta-dark border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue"
                placeholder="Название категории"
                required
              />
            </div>
            <IconSelector
              selectedIcon={newCategory.icon}
              onIconSelect={(icon) => setNewCategory(prev => ({ ...prev, icon }))}
            />
            <div>
              <label className="block text-sm text-gray-300 mb-1">Цвет</label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 bg-gta-dark border gta-border rounded cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 gta-button text-sm"
              >
                Добавить
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded transition-colors text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      {customCategories.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400 mb-2">Пользовательские категории:</div>
          {customCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 bg-gta-darker rounded border border-gray-600"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon 
                  icon={category.icon} 
                  style={{ color: category.color }} 
                />
                <span className="text-white text-sm">{category.name}</span>
              </div>
              <button
                onClick={() => {
                  onDeleteCategory(category.id);
                  toast.success('Категория удалена');
                }}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
