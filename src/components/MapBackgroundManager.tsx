
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface MapBackgroundManagerProps {
  currentBackground?: string;
  onBackgroundChange: (backgroundUrl: string | null) => void;
}

const MapBackgroundManager: React.FC<MapBackgroundManagerProps> = ({
  currentBackground,
  onBackgroundChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Создаем URL для предварительного просмотра
      const imageUrl = URL.createObjectURL(file);
      
      // Создаем Image для проверки размеров
      const img = new Image();
      img.onload = () => {
        console.log(`Загружено изображение: ${img.width}x${img.height}px`);
        onBackgroundChange(imageUrl);
        toast.success('Фон карты успешно загружен!');
        setIsUploading(false);
      };
      
      img.onerror = () => {
        toast.error('Ошибка при загрузке изображения');
        setIsUploading(false);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      toast.error('Ошибка при загрузке файла');
      setIsUploading(false);
    }

    // Сбрасываем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetBackground = () => {
    onBackgroundChange(null);
    toast.success('Фон карты сброшен к стандартному');
  };

  const handleRemoveBackground = () => {
    if (currentBackground) {
      URL.revokeObjectURL(currentBackground);
    }
    onBackgroundChange(null);
    toast.success('Пользовательский фон удален');
  };

  return (
    <Card className="bg-gta-dark gta-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-gta-blue text-sm flex items-center gap-2">
          🗺️ Управление фоном карты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-gray-400">
          Загрузите собственное изображение карты (рекомендуемый размер: 1680x2400px для 7x10 тайлов)
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            size="sm"
            className="flex-1 bg-gta-blue hover:bg-blue-600 text-white"
          >
            <Upload size={14} className="mr-1" />
            {isUploading ? 'Загрузка...' : 'Загрузить карту'}
          </Button>
          
          {currentBackground && (
            <Button
              onClick={handleRemoveBackground}
              size="sm"
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>

        <Button
          onClick={handleResetBackground}
          size="sm"
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RotateCcw size={14} className="mr-1" />
          Сбросить к стандартному
        </Button>

        {currentBackground && (
          <div className="text-xs text-green-400 bg-green-900/20 p-2 rounded border border-green-700">
            ✅ Загружен пользовательский фон карты
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default MapBackgroundManager;
