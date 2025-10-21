import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditorSectionProps {
  track: Track | null;
  onUpdate: (track: Track, action?: string) => void;
}

const EditorSection = ({ track, onUpdate }: EditorSectionProps) => {
  const [coverPreviews, setCoverPreviews] = useState<string[]>([]);
  const [selectedCover, setSelectedCover] = useState<string>('');

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          canvas.width = 1500;
          canvas.height = 1500;

          const sourceSize = Math.min(img.width, img.height);
          const offsetX = (img.width - sourceSize) / 2;
          const offsetY = (img.height - sourceSize) / 2;

          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            sourceSize,
            sourceSize,
            0,
            0,
            1500,
            1500
          );

          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPreviews: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} - не изображение`);
          continue;
        }

        try {
          const resizedImage = await resizeImage(file);
          newPreviews.push(resizedImage);
        } catch (error) {
          toast.error(`Ошибка обработки ${file.name}`);
        }
      }

      if (newPreviews.length > 0) {
        setCoverPreviews(newPreviews);
        setSelectedCover(newPreviews[0]);
        toast.success(`Обложки изменены до 1500×1500`);
      }
    }
  };

  const handleApplyCover = () => {
    if (!track || !selectedCover) return;
    
    const updatedTrack: Track = {
      ...track,
      cover: selectedCover
    };
    
    onUpdate(updatedTrack, 'Обложка изменена');
    toast.success('Обложка обновлена');
    setCoverPreviews([]);
    setSelectedCover('');
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="Wand2" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек из библиотеки для редактирования</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Wand2" className="text-primary" />
          Редактор трека
        </CardTitle>
        <CardDescription>
          Изменение обложки и визуальных элементов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Текущая обложка</Label>
              <div className="relative group">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-full aspect-square object-cover rounded-lg shadow-xl border-2 border-border/50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white truncate">{track.title}</h3>
                    <p className="text-sm text-white/80 truncate">{track.artist}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-center">
                <Icon name="Disc" className="mx-auto mb-1 text-primary" size={20} />
                <p className="text-xs text-muted-foreground">Формат</p>
                <p className="font-semibold">{track.format}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-center">
                <Icon name="Music2" className="mx-auto mb-1 text-secondary" size={20} />
                <p className="text-xs text-muted-foreground">BPM</p>
                <p className="font-semibold">{track.bpm}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-center">
                <Icon name="Guitar" className="mx-auto mb-1 text-primary" size={20} />
                <p className="text-xs text-muted-foreground">Тональность</p>
                <p className="font-semibold text-xs">{track.key}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Загрузить новую обложку</Label>
              
              {coverPreviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={selectedCover}
                      alt="Selected preview"
                      className="w-full aspect-square object-cover rounded-lg shadow-xl border-2 border-primary"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
                      {coverPreviews.findIndex(c => c === selectedCover) + 1} / {coverPreviews.length}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                      <Icon name="CheckCircle2" size={12} />
                      1500×1500
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                      {coverPreviews.map((preview, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedCover(preview)}
                          className={`flex-shrink-0 w-24 h-24 rounded-lg cursor-pointer transition-all snap-start ${
                            selectedCover === preview
                              ? 'ring-2 ring-primary scale-105 shadow-lg'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApplyCover}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary"
                    >
                      <Icon name="Check" className="mr-2" size={16} />
                      Применить выбранную
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCoverPreviews([]);
                        setSelectedCover('');
                      }}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Icon name="Image" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Загрузите одно или несколько изображений
                  </p>
                  <p className="text-xs text-primary/80 mb-4 flex items-center justify-center gap-1">
                    <Icon name="Info" size={12} />
                    Автоматическое изменение до 1500×1500
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <Icon name="Upload" className="mr-2" size={16} />
                      Выбрать файлы
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Можно выбрать несколько файлов сразу
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Icon name="Info" className="text-primary mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm">
                  <p className="font-semibold text-primary mb-1">Требования к обложке:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Формат: JPG или PNG</li>
                    <li>• Минимальный размер: 1400x1400 px</li>
                    <li>• Максимальный размер файла: 10 МБ</li>
                    <li>• Квадратное соотношение сторон</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditorSection;