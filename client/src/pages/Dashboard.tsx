import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Trophy, AlertCircle } from 'lucide-react';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { MonthCalendar } from '@/components/dashboard/MonthCalendar';

interface DashboardData {
    stats: {
        totalOlympiads: number;
        currentOlympiads: number;
        onRegistration: number;
        qualifying: number;
        finals: number;
        results: {
            participant: number;
            participantFinal: number;
            prize: number;
            prizeFinal: number;
            winner: number;
            winnerFinal: number;
            waiting: number;
        };
    };
    alerts: {
        id: number;
        olympiadName: string;
        subject: string;
        stageName: string;
        date: string;
        type: 'Registration' | 'Stage';
        isStart: boolean;
    }[];
    upcoming: any[];
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(setData)
            .catch(err => {
                console.error(err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64 md:col-span-2" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white">Андрей, привет!</h2>
                <p className="text-slate-400 mt-1">Давай посмотрим на твои успехи и планы.</p>
            </div>

            <div className="space-y-6">
                {/* Top Row: Stats & Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats */}
                    <Card className="bg-slate-900/50 border-slate-800 col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                Статистика
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            {/* Main Stats (Participation/Results) - Now Top */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?status=winner')}>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Победитель</p>
                                    <p className="text-3xl font-bold text-yellow-400">
                                        {data?.stats?.results?.winner || 0}
                                    </p>
                                </div>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?status=prize')}>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Призер</p>
                                    <p className="text-3xl font-bold text-orange-400">{data?.stats?.results?.prize || 0}</p>
                                </div>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?status=participant')}>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Участник</p>
                                    <p className="text-3xl font-bold text-slate-200">{data?.stats?.results?.participant || 0}</p>
                                </div>
                                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?status=waiting')}>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ожидание</p>
                                    <p className="text-3xl font-bold text-blue-400">{data?.stats?.results?.waiting || 0}</p>
                                </div>
                            </div>

                            {/* Secondary Stats (Counts) - Now Bottom, Single Line, Compact */}
                            <div className="border-t border-slate-800 pt-4 flex justify-between items-center gap-1">
                                <div className="flex flex-col items-center min-w-[40px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads')}>
                                    <span className="text-lg font-bold text-white">{data?.stats?.totalOlympiads || 0}</span>
                                    <span className="text-[9px] text-slate-500 uppercase">Всего</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-800"></div>
                                <div className="flex flex-col items-center min-w-[40px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?filter=current')}>
                                    <span className="text-lg font-bold text-green-400">{data?.stats?.currentOlympiads || 0}</span>
                                    <span className="text-[9px] text-slate-500 uppercase">Актив</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-800"></div>
                                <div className="flex flex-col items-center min-w-[40px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?stage=registration')}>
                                    <span className="text-lg font-bold text-indigo-400">{data?.stats?.onRegistration || 0}</span>
                                    <span className="text-[9px] text-slate-500 uppercase">Регистр</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-800"></div>
                                <div className="flex flex-col items-center min-w-[40px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?stage=qualifying')}>
                                    <span className="text-lg font-bold text-orange-400">{data?.stats?.qualifying || 0}</span>
                                    <span className="text-[9px] text-slate-500 uppercase">Отбор</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-800"></div>
                                <div className="flex flex-col items-center min-w-[40px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/olympiads?stage=final')}>
                                    <span className="text-lg font-bold text-purple-400">{data?.stats?.finals || 0}</span>
                                    <span className="text-[9px] text-slate-500 uppercase">Финал</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts Widget */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                Требует внимания
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {!data?.alerts || data.alerts.length === 0 ? (
                                <div className="flex items-center justify-center h-20">
                                    <p className="text-slate-500 text-sm">Все отлично!</p>
                                </div>
                            ) : (
                                data.alerts.slice(0, 3).map((alert, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(`/olympiad/${alert.id}`)}
                                        className="p-2 bg-red-950/20 border border-red-900/30 rounded text-xs cursor-pointer hover:bg-red-950/40 transition-colors"
                                    >
                                        <div className="flex justify-between mb-1">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-red-800 text-red-300">
                                                {alert.type === 'Registration' ? 'Регистрация' : (alert.isStart ? 'Старт этапа' : 'Конец этапа')}
                                            </Badge>
                                            <span className="text-red-400 font-mono">
                                                {new Date(alert.date).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <p className="font-medium text-red-200 truncate">{alert.olympiadName}</p>
                                        <p className="text-red-300/70 truncate">{alert.subject} • {alert.stageName}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Coach Widget (Compact) */}
                    <Card className="bg-gradient-to-br from-indigo-900/50 to-slate-950 border-indigo-500/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-indigo-300">
                                <Brain className="w-4 h-4" />
                                AI Тренер
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-indigo-100 italic mb-3 line-clamp-3">
                                "Успех — это сумма небольших усилий. Ты отлично справился с физикой!"
                            </p>
                            <Button size="sm" variant="secondary" className="w-full text-xs h-7 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/50">
                                Получить совет
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row: Calendar/Timeline */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="h-[750px]">
                        <MonthCalendar events={data?.upcoming || []} />
                    </div>
                    <div className="h-[500px]">
                        <CalendarWidget events={data?.upcoming || []} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
