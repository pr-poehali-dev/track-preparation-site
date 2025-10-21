import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MetadataSectionProps {
  track: Track | null;
  onUpdate: (track: Track) => void;
}

const MetadataSection = ({ track, onUpdate }: MetadataSectionProps) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    bpm: '',
    key: '',
    lyrics: ''
  });

  useEffect(() => {
    if (track) {
      setFormData({
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        year: track.year,
        bpm: track.bpm?.toString() || '',
        key: track.key || '',
        lyrics: track.lyrics || ''
      });
    }
  }, [track]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!track) return;

    const updatedTrack: Track = {
      ...track,
      ...formData,
      bpm: parseInt(formData.bpm) || 120
    };

    onUpdate(updatedTrack);
    toast.success('Метаданные обновлены');
  };

  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек из библиотеки для редактирования метаданных</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileText" className="text-primary" />
          Метаданные трека
        </CardTitle>
        <CardDescription>
          Редактирование информации о треке
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название трека</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Введите название"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Исполнитель</Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => handleChange('artist', e.target.value)}
                placeholder="Введите имя исполнителя"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Альбом</Label>
              <Input
                id="album"
                value={formData.album}
                onChange={(e) => handleChange('album', e.target.value)}
                placeholder="Введите название альбома"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Жанр</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                placeholder="Введите жанр"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Год</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                placeholder="2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpm">BPM (Темп)</Label>
              <Input
                id="bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) => handleChange('bpm', e.target.value)}
                placeholder="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Тональность</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => handleChange('key', e.target.value)}
                placeholder="C Major"
              />
            </div>

            <div className="space-y-2">
              <Label>Формат файла</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-md border border-border/50">
                <Icon name="Disc" className="text-primary" size={20} />
                <span className="font-semibold">{track.format}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="lyrics">Текст песни</Label>
            <Textarea
              id="lyrics"
              value={formData.lyrics}
              onChange={(e) => handleChange('lyrics', e.target.value)}
              placeholder="Введите текст песни..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (track) {
                  setFormData({
                    title: track.title,
                    artist: track.artist,
                    album: track.album,
                    genre: track.genre,
                    year: track.year,
                    bpm: track.bpm?.toString() || '',
                    key: track.key || '',
                    lyrics: track.lyrics || ''
                  });
                }
              }}
            >
              <Icon name="RotateCcw" className="mr-2" size={16} />
              Сбросить
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary">
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataSection;
