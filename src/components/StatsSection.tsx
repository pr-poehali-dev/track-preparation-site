import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { Track } from '@/pages/Index';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsSectionProps {
  tracks: Track[];
}

const StatsSection = ({ tracks }: StatsSectionProps) => {
  const genreStats = tracks.reduce((acc, track) => {
    acc[track.genre] = (acc[track.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genreData = Object.entries(genreStats).map(([name, value]) => ({
    name,
    value
  }));

  const formatStats = tracks.reduce((acc, track) => {
    acc[track.format] = (acc[track.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatData = Object.entries(formatStats).map(([name, value]) => ({
    name,
    count: value
  }));

  const avgBpm = tracks.length > 0
    ? Math.round(tracks.reduce((sum, t) => sum + (t.bpm || 0), 0) / tracks.length)
    : 0;

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const COLORS = ['hsl(258, 90%, 66%)', 'hsl(24, 95%, 53%)', 'hsl(220, 90%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(350, 89%, 60%)'];

  if (tracks.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Icon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Загрузите треки для просмотра статистики</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Всего треков</p>
                <p className="text-3xl font-bold text-primary">{tracks.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Icon name="Music" className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Общая длительность</p>
                <p className="text-3xl font-bold text-secondary">{formatDuration(totalDuration)}</p>
              </div>
              <div className="p-3 rounded-full bg-secondary/20">
                <Icon name="Clock" className="text-secondary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Средний BPM</p>
                <p className="text-3xl font-bold text-primary">{avgBpm}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Icon name="Activity" className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Форматов</p>
                <p className="text-3xl font-bold text-secondary">{Object.keys(formatStats).length}</p>
              </div>
              <div className="p-3 rounded-full bg-secondary/20">
                <Icon name="Disc" className="text-secondary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" className="text-primary" />
              Распределение по жанрам
            </CardTitle>
            <CardDescription>
              Количество треков в каждом жанре
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BarChart3" className="text-secondary" />
              Форматы файлов
            </CardTitle>
            <CardDescription>
              Количество треков по форматам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ListMusic" className="text-primary" />
            Детальная статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Жанры</h4>
              <div className="space-y-2">
                {Object.entries(genreStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([genre, count]) => (
                    <div key={genre} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{genre}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-secondary">Форматы</h4>
              <div className="space-y-2">
                {Object.entries(formatStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([format, count]) => (
                    <div key={format} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{format}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">Дополнительно</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">С обложками</span>
                  <span className="font-semibold">{tracks.filter(t => t.cover).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">С текстами</span>
                  <span className="font-semibold">{tracks.filter(t => t.lyrics).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">С BPM данными</span>
                  <span className="font-semibold">{tracks.filter(t => t.bpm).length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSection;
