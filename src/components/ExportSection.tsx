import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExportSectionProps {
  track: Track | null;
}

const ExportSection = ({ track }: ExportSectionProps) => {
  const [exportFormat, setExportFormat] = useState('mp3');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeCover, setIncludeCover] = useState(true);
  const [includeLyrics, setIncludeLyrics] = useState(true);

  const handleExport = () => {
    if (!track) return;

    toast.success(`Экспорт трека "${track.title}" в формате ${exportFormat.toUpperCase()}`);
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="Download" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек из библиотеки для экспорта</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Download" className="text-primary" />
          Экспорт трека
        </CardTitle>
        <CardDescription>
          Подготовка трека к публикации на площадках
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Выбранный трек</Label>
              <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{track.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    <p className="text-xs text-muted-foreground mt-1">{track.album}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">Формат экспорта</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="space-y-2">
                  {[
                    { value: 'mp3', label: 'MP3', desc: 'Универсальный формат, совместим со всеми площадками' },
                    { value: 'wav', label: 'WAV', desc: 'Без потерь качества, для профессионального использования' },
                    { value: 'flac', label: 'FLAC', desc: 'Lossless формат с меньшим размером файла' },
                    { value: 'aac', label: 'AAC', desc: 'Оптимизирован для Apple Music и iTunes' }
                  ].map((format) => (
                    <div
                      key={format.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        exportFormat === format.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                      onClick={() => setExportFormat(format.value)}
                    >
                      <RadioGroupItem value={format.value} id={format.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={format.value} className="font-semibold cursor-pointer">
                          {format.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">{format.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Настройки экспорта</Label>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:bg-background/50 transition-colors">
                  <Checkbox
                    id="metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="metadata" className="font-semibold cursor-pointer">
                      Встроить метаданные
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Название, исполнитель, альбом, жанр, год, BPM
                    </p>
                  </div>
                  <Icon name="FileText" className="text-primary" size={20} />
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:bg-background/50 transition-colors">
                  <Checkbox
                    id="cover"
                    checked={includeCover}
                    onCheckedChange={(checked) => setIncludeCover(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="cover" className="font-semibold cursor-pointer">
                      Встроить обложку
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Изображение будет встроено в файл
                    </p>
                  </div>
                  <Icon name="Image" className="text-primary" size={20} />
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:bg-background/50 transition-colors">
                  <Checkbox
                    id="lyrics"
                    checked={includeLyrics}
                    onCheckedChange={(checked) => setIncludeLyrics(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="lyrics" className="font-semibold cursor-pointer">
                      Встроить текст песни
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Текст будет доступен в плеерах
                    </p>
                  </div>
                  <Icon name="FileText" className="text-primary" size={20} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Icon name="Sparkles" className="text-secondary" size={20} />
                Рекомендации для площадок
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Check" className="text-green-500" size={16} />
                  <span className="text-muted-foreground">Spotify: MP3 320kbps или WAV</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" className="text-green-500" size={16} />
                  <span className="text-muted-foreground">Apple Music: AAC или FLAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Check" className="text-green-500" size={16} />
                  <span className="text-muted-foreground">YouTube Music: MP3 или WAV</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-primary to-secondary text-lg py-6"
              size="lg"
            >
              <Icon name="Download" className="mr-2" size={20} />
              Экспортировать трек
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSection;
