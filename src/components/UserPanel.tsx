
import React from 'react';
import { User } from '@/types/map';

interface UserPanelProps {
  user: User;
  onRoleToggle: () => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ user, onRoleToggle }) => {
  return (
    <div className="bg-gta-dark gta-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Панель пользователя</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Имя:</span>
          <span className="text-white font-medium">{user.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Роль:</span>
          <span 
            className={`font-semibold px-2 py-1 rounded ${
              user.role === 'admin' 
                ? 'bg-gta-green text-gta-dark' 
                : 'bg-gta-blue text-gta-dark'
            }`}
          >
            {user.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-600">
        <button
          onClick={onRoleToggle}
          className="w-full gta-button"
        >
          {user.role === 'admin' 
            ? 'Переключиться на пользователя' 
            : 'Переключиться на администратора'
          }
        </button>
      </div>

      {user.role === 'admin' && (
        <div className="mt-3 p-3 bg-gta-green bg-opacity-20 rounded border border-gta-green border-opacity-30">
          <div className="text-sm text-gta-green">
            ⚡ Режим администратора активен
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Кликните по карте для добавления меток
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
