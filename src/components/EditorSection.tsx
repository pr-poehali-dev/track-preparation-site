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
  onUpdate: (track: Track) => void;
}

const EditorSection = ({ track, onUpdate }: EditorSectionProps) => {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCover = () => {
    if (!track || !coverPreview) return;
    
    const updatedTrack: Track = {
      ...track,
      cover: coverPreview
    };
    
    onUpdate(updatedTrack);
    toast.success('Обложка обновлена');
    setCoverFile(null);
    setCoverPreview('');
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
              
              {coverPreview ? (
                <div className="space-y-4">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg shadow-xl border-2 border-primary"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApplyCover}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary"
                    >
                      <Icon name="Check" className="mr-2" size={16} />
                      Применить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview('');
                      }}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Icon name="Image" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Загрузите изображение для обложки
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <Icon name="Upload" className="mr-2" size={16} />
                      Выбрать файл
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Рекомендуемый размер: 3000x3000 пикселей
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
