
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faStore, 
  faGasPump, 
  faHospital, 
  faUniversity, 
  faGamepad,
  faHome,
  faBuilding,
  faSchool,
  faUtensils,
  faCar,
  faPlane,
  faTrain,
  faShoppingCart,
  faHeart,
  faStar,
  faMapMarkerAlt,
  faWifi,
  faPhone,
  faEnvelope,
  faCamera,
  faMusic,
  faFilm,
  faBook,
  faCoffee,
  faPizzaSlice,
  faUmbrellaBeach,
  faMountain
} from '@fortawesome/free-solid-svg-icons';

interface IconSelectorProps {
  selectedIcon: IconDefinition;
  onIconSelect: (icon: IconDefinition) => void;
}

const availableIcons: IconDefinition[] = [
  faStore, faGasPump, faHospital, faUniversity, faGamepad,
  faHome, faBuilding, faSchool, faUtensils, faCar,
  faPlane, faTrain, faShoppingCart, faHeart, faStar,
  faMapMarkerAlt, faWifi, faPhone, faEnvelope, faCamera,
  faMusic, faFilm, faBook, faCoffee, faPizzaSlice,
  faUmbrellaBeach, faMountain
];

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm text-gray-300 mb-1">Иконка</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gta-dark border gta-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gta-blue flex items-center gap-2"
      >
        <FontAwesomeIcon icon={selectedIcon} />
        <span>Выберите иконку</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gta-dark border gta-border rounded max-h-48 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2 p-2">
            {availableIcons.map((icon, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onIconSelect(icon);
                  setIsOpen(false);
                }}
                className={`p-2 rounded hover:bg-gta-blue hover:text-gta-dark transition-colors ${
                  selectedIcon === icon ? 'bg-gta-blue text-gta-dark' : 'text-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={icon} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;
