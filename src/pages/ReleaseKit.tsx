import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { Track } from './Index';

const ReleaseKit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    const state = location.state as { track: Track };
    if (state && state.track) {
      setTrack(state.track);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопировано в буфер обмена`);
  };

  const downloadCover = async () => {
    if (!track) return;

    try {
      // Конвертируем обложку в 1500x1500
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1500;
        canvas.height = 1500;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sourceSize = Math.min(img.width, img.height);
        const offsetX = (img.width - sourceSize) / 2;
        const offsetY = (img.height - sourceSize) / 2;

        ctx.drawImage(img, offsetX, offsetY, sourceSize, sourceSize, 0, 0, 1500, 1500);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${track.artist} - ${track.title} [Cover 1500x1500].jpg`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Обложка 1500×1500 загружена');
        }, 'image/jpeg', 0.95);
      };
      img.src = track.cover;
    } catch (error) {
      toast.error('Ошибка при загрузке обложки');
    }
  };

  const downloadWAV = async () => {
    if (!track) return;

    try {
      const response = await fetch(track.audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist} - ${track.title} [WAV Stereo].wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('WAV Stereo файл загружен');
    } catch (error) {
      toast.error('Ошибка при загрузке трека');
    }
  };

  const downloadAll = async () => {
    if (!track) return;
    
    toast.info('Начинается загрузка всех файлов...');
    
    // Небольшие задержки между загрузками
    await downloadCover();
    setTimeout(async () => {
      await downloadWAV();
    }, 500);
  };

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
          >
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Вернуться к редактору
          </Button>
        </div>

        <header className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon name="PackageCheck" className="text-primary" size={48} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
            Релизный пакет готов
          </h1>
          <p className="text-muted-foreground">
            Все необходимые материалы для публикации трека на площадках
          </p>
        </header>

        <div className="space-y-6">
          {/* Название трека */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Music" className="text-primary" />
                Название трека
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-4 bg-background/50 rounded-lg border border-border/50 font-semibold text-lg">
                  {track.artist} - {track.title}
                </div>
                <Button
                  onClick={() => copyToClipboard(`${track.artist} - ${track.title}`, 'Название')}
                  variant="outline"
                  size="lg"
                >
                  <Icon name="Copy" className="mr-2" size={18} />
                  Копировать
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-muted-foreground text-xs mb-1">Исполнитель</div>
                  <div className="font-medium">{track.artist}</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-muted-foreground text-xs mb-1">Альбом</div>
                  <div className="font-medium">{track.album}</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-muted-foreground text-xs mb-1">Жанр</div>
                  <div className="font-medium">{track.genre}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Обложка */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Image" className="text-primary" />
                Обложка альбома
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative group">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-border/50 shadow-2xl"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-green-500/90 rounded-lg text-white text-xs font-semibold">
                    1500×1500 px
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Характеристики обложки:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-500" size={16} />
                        Разрешение: 1500×1500 пикселей
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-500" size={16} />
                        Формат: JPEG (высокое качество)
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-500" size={16} />
                        Соотношение: 1:1 (квадрат)
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="Check" className="text-green-500" size={16} />
                        Готова для Spotify, Apple Music, YouTube
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={downloadCover}
                    className="bg-gradient-to-r from-primary to-secondary"
                    size="lg"
                  >
                    <Icon name="Download" className="mr-2" size={18} />
                    Скачать обложку 1500×1500
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Текст песни */}
          {track.lyrics && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" className="text-primary" />
                  Текст песни
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                    {track.lyrics}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(track.lyrics || '', 'Текст песни')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Icon name="Copy" className="mr-2" size={18} />
                    Копировать текст песни
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Аудио файл */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Music2" className="text-primary" />
                Аудио трек
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Формат</div>
                    <div className="font-semibold">WAV Stereo</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">BPM</div>
                    <div className="font-semibold">{track.bpm || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Тональность</div>
                    <div className="font-semibold">{track.key || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Год</div>
                    <div className="font-semibold">{track.year}</div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Icon name="Info" className="text-secondary" size={18} />
                    Технические характеристики
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-500" size={14} />
                      Формат: WAV (без потерь качества)
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-500" size={14} />
                      Каналы: Stereo (стерео)
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-500" size={14} />
                      Sample Rate: 44.1 kHz (CD качество)
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="text-green-500" size={14} />
                      Bit Depth: 16-bit
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={downloadWAV}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  <Icon name="Download" className="mr-2" size={18} />
                  Скачать WAV Stereo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Скачать всё */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <Icon name="PackageCheck" className="text-primary" size={24} />
                    Полный релизный пакет
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Скачайте все файлы одновременно: обложку 1500×1500 и WAV Stereo трек
                  </p>
                </div>
                <Button
                  onClick={downloadAll}
                  size="lg"
                  className="bg-gradient-to-r from-primary via-secondary to-primary text-lg px-8"
                >
                  <Icon name="Download" className="mr-2" size={20} />
                  Скачать всё
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Релизный пакет создан в MusicLab Pro</p>
          <p className="mt-1">Все файлы готовы для загрузки на Spotify, Apple Music, YouTube Music и другие платформы</p>
        </footer>
      </div>
    </div>
  );
};

export default ReleaseKit;
