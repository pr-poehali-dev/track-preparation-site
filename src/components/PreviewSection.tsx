import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PreviewSectionProps {
  track: Track | null;
}

const PreviewSection = ({ track }: PreviewSectionProps) => {
  if (!track) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="Eye" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Выберите трек из библиотеки для предпросмотра</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Eye" className="text-primary" />
          Предпросмотр трека
        </CardTitle>
        <CardDescription>
          Как будет выглядеть трек на различных платформах
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spotify" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spotify">Spotify</TabsTrigger>
            <TabsTrigger value="apple">Apple Music</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Music</TabsTrigger>
            <TabsTrigger value="soundcloud">SoundCloud</TabsTrigger>
          </TabsList>

          <TabsContent value="spotify" className="space-y-4">
            <div className="bg-[#121212] rounded-lg p-6 text-white">
              <div className="flex gap-4">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-32 h-32 rounded shadow-2xl"
                />
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-1">{track.title}</h3>
                  <p className="text-lg text-gray-400 mb-3">{track.artist}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{track.year}</span>
                    <span>•</span>
                    <span>{track.genre}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apple" className="space-y-4">
            <div className="bg-gradient-to-b from-[#FA2D48] to-[#C20029] rounded-lg p-6 text-white">
              <div className="flex gap-4">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-32 h-32 rounded-lg shadow-2xl"
                />
                <div className="flex-1">
                  <p className="text-sm opacity-80 mb-1">{track.album}</p>
                  <h3 className="text-2xl font-semibold mb-1">{track.title}</h3>
                  <p className="text-base opacity-90">{track.artist}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
                    <span>{track.genre}</span>
                    <span>•</span>
                    <span>{track.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <div className="bg-[#030303] rounded-lg p-6">
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{track.title}</h3>
              <p className="text-sm text-gray-400">{track.artist} • {track.album}</p>
            </div>
          </TabsContent>

          <TabsContent value="soundcloud" className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <div className="flex gap-4">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-24 h-24 rounded"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{track.artist}</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{track.title}</h3>
                  <div className="w-full h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-sm relative">
                    <div className="absolute inset-0 opacity-30">
                      {[...Array(100)].map((_, i) => (
                        <div
                          key={i}
                          className="inline-block w-[1%] h-full bg-white"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Info" className="text-primary" size={18} />
              Метаданные
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Название:</span>
                <span className="font-medium">{track.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Исполнитель:</span>
                <span className="font-medium">{track.artist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Альбом:</span>
                <span className="font-medium">{track.album}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Жанр:</span>
                <span className="font-medium">{track.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Год:</span>
                <span className="font-medium">{track.year}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background/50 rounded-lg border border-border/50">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Settings" className="text-secondary" size={18} />
              Технические данные
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Формат:</span>
                <span className="font-medium">{track.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BPM:</span>
                <span className="font-medium">{track.bpm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тональность:</span>
                <span className="font-medium">{track.key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Текст песни:</span>
                <span className="font-medium">{track.lyrics ? 'Есть' : 'Нет'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewSection;
