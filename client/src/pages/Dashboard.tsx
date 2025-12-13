import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Trophy, AlertCircle } from 'lucide-react';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { MonthCalendar } from '@/components/dashboard/MonthCalendar';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
    stats: {
        totalOlympiads: number;
        totalWins: number;
    };
    alerts: Array<{
        id: number;
        type: 'Registration' | 'Event';
        olympiadName: string;
        subject: string;
        stageName: string;
        date: string;
    }>;
    upcoming: Array<{
        id: number;
        olympiadName: string;
        subject: string;
        stageName: string;
        startDate: string;
        endDate: string;
    }>;
}

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-64 md:col-span-3" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Добро пожаловать, Чемпион! 👋</h2>
                <p className="text-slate-400 mt-2">Давай посмотрим на твои успехи и планы.</p>
            </div>

            <div className="space-y-6">
                {/* Top Row: Stats, Alerts, AI Coach (Compact) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Stats Widget */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                Статистика
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-3xl font-bold text-white">{data?.stats.totalOlympiads}</span>
                                <span className="text-xs text-slate-500 mb-1">Олимпиад</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-green-400">{data?.stats.totalWins}</span>
                                <span className="text-xs text-slate-500 mb-1">Побед</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Required (Alerts) */}
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                Требует внимания
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data?.alerts.length === 0 ? (
                                <div className="flex items-center justify-center h-20">
                                    <p className="text-slate-500 text-sm">Все отлично!</p>
                                </div>
                            ) : (
                                data?.alerts.slice(0, 2).map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => navigate(`/olympiad/${alert.id}`)}
                                        className="p-2 bg-red-950/20 border border-red-900/30 rounded text-xs cursor-pointer hover:bg-red-950/40 transition-colors"
                                    >
                                        <div className="flex justify-between mb-1">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-red-800 text-red-300">
                                                {alert.type === 'Registration' ? 'Рег.' : 'Событие'}
                                            </Badge>
                                            <span className="text-red-400 font-mono">
                                                {new Date(alert.date).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <p className="font-medium text-red-200 truncate">{alert.olympiadName}</p>
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
                    <div className="h-[500px]">
                        <MonthCalendar events={data?.upcoming || []} />
                    </div>
                    <div className="h-[400px]">
                        <CalendarWidget events={data?.upcoming || []} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
