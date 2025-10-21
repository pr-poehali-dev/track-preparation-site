import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LibrarySectionProps {
  tracks: Track[];
  onSelect: (track: Track) => void;
  onDelete: (trackId: string) => void;
  currentTrack: Track | null;
}

const LibrarySection = ({ tracks, onSelect, onDelete, currentTrack }: LibrarySectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Library" className="text-primary" />
          Библиотека треков
        </CardTitle>
        <CardDescription>
          Всего треков: {tracks.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Поиск по названию, исполнителю или альбому..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Music" size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              {tracks.length === 0
                ? 'Библиотека пуста. Загрузите треки для начала работы.'
                : 'Ничего не найдено по вашему запросу.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-2">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className={`group p-4 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${
                    currentTrack?.id === track.id
                      ? 'border-primary bg-primary/10 shadow-primary/20'
                      : 'border-border/50 bg-background/50 hover:border-primary/50'
                  }`}
                  onClick={() => onSelect(track)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      {currentTrack?.id === track.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                          <Icon name="Play" className="text-primary" size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{track.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist} • {track.album}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Disc" size={12} />
                          {track.format}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {formatDuration(track.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Music2" size={12} />
                          {track.bpm} BPM
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(track.id);
                      }}
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LibrarySection;
