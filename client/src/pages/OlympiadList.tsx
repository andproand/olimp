import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, CheckCircle2, XCircle, Hourglass, AlertCircle, MinusCircle, ArrowUpDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Result {
    status: string;
}

interface Stage {
    name: string;
    startDate: string | null;
    endDate: string | null;
    results: Result[];
}

interface Profile {
    subject: string;
    level: number | null;
    priority?: string;
    academicYear?: string;
    stages: Stage[];
}

interface Olympiad {
    id: number;
    name: string;
    organizer: string | null;
    priority: string;
    contacts: string | null;
    profiles: Profile[];
    updatedAt: string;
}

const OlympiadList = () => {
    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'date' | 'name' | 'priority'>('date');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter');

    useEffect(() => {
        fetch('/api/olympiads')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOlympiads(data);
                } else {
                    console.error('API returned non-array:', data);
                    setOlympiads([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setOlympiads([]);
                setLoading(false);
            });
    }, []);

    const getPriorityWeight = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    };

    const filteredOlympiads = olympiads.filter(o => {
        const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.profiles.some(p => p.subject.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filterParam === 'current') {
            // Check if any stage is currently active
            const now = new Date();
            const hasActiveStage = o.profiles.some(p => p.stages.some(s =>
                s.startDate && s.endDate && new Date(s.startDate) <= now && new Date(s.endDate) >= now
            ));
            return matchesSearch && hasActiveStage;
        }

        if (filterParam === 'completed') {
            // Check if all stages are past
            const now = new Date();
            const allStagesPast = o.profiles.every(p => p.stages.every(s =>
                s.endDate && new Date(s.endDate) < now
            ));
            // Ensure it has stages to be considered "completed" (optional logic)
            const hasStages = o.profiles.some(p => p.stages.length > 0);
            return matchesSearch && allStagesPast && hasStages;
        }

        return matchesSearch;
    }).sort((a, b) => {
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        if (sortOrder === 'priority') return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        // Date sort: by updatedAt (most recent first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-900/50 bg-red-950/20';
            case 'medium': return 'text-yellow-400 border-yellow-900/50 bg-yellow-950/20';
            case 'low': return 'text-blue-400 border-blue-900/50 bg-blue-950/20';
            default: return 'text-slate-400 border-slate-800 bg-slate-900/50';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'Высокая';
            case 'medium': return 'Средняя';
            case 'low': return 'Низкая';
            default: return priority;
        }
    };



    const getResultIcon = (status?: string) => {
        if (!status) return null;
        const s = status.toLowerCase();
        if (s.includes('winner') || s.includes('prize') || s.includes('passed') || s.includes('победитель') || s.includes('призер')) return <CheckCircle2 className="w-3 h-3 text-green-500" />;
        if (s.includes('failed') || s.includes('не прошел')) return <XCircle className="w-3 h-3 text-red-500" />;
        if (s.includes('waiting') || s.includes('ожидание')) return <Hourglass className="w-3 h-3 text-yellow-500" />;
        if (s.includes('participant') || s.includes('участник')) return <AlertCircle className="w-3 h-3 text-blue-500" />;
        if (s.includes('not') || s.includes('не')) return <MinusCircle className="w-3 h-3 text-slate-500" />;
        return null;
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Мои Олимпиады</h2>
                    <p className="text-slate-400 mt-1">Управляй своим списком соревнований.</p>
                </div>
                <Button onClick={() => navigate('/olympiads/new')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить олимпиаду
                </Button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Поиск по названию или предмету..."
                        className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            Сортировка: {sortOrder === 'date' ? 'Дата' : sortOrder === 'name' ? 'Имя' : 'Приоритет'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                        <DropdownMenuItem onClick={() => setSortOrder('date')}>По дате обновления</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOrder('name')}>По имени</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortOrder('priority')}>По приоритету</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOlympiads.map(olympiad => (
                        <Card
                            key={olympiad.id}
                            className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                            onClick={() => navigate(`/olympiad/${olympiad.id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{olympiad.name}</h3>
                                </div>
                                {olympiad.organizer && (
                                    <p className="text-slate-400 text-sm mb-3">{olympiad.organizer}</p>
                                )}

                                <div className="space-y-6">
                                    {olympiad.profiles.map((profile, pIdx) => (
                                        <div key={pIdx} className="relative flex flex-col md:flex-row gap-4 items-start border-b border-slate-800/50 last:border-0 pb-4 last:pb-0">
                                            {/* Profile Header (Left) */}
                                            <div className="flex flex-wrap md:flex-col items-center md:items-start gap-3 md:w-1/4 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-slate-200">
                                                        {profile.subject}
                                                    </span>
                                                    {profile.level && (
                                                        <span className="text-sm text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                                            {profile.level} ур.
                                                        </span>
                                                    )}
                                                </div>
                                                {profile.priority && (
                                                    <Badge className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(profile.priority))}>
                                                        {getPriorityLabel(profile.priority)}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Stages Grid (Right) */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1 w-full">
                                                {profile.stages.map((stage, sIdx) => {
                                                    const hasResults = stage.results && stage.results.length > 0;
                                                    const firstResultStatus = hasResults ? stage.results[0].status : undefined;

                                                    return (
                                                        <div key={sIdx} className="flex flex-col p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 hover:border-indigo-500/30 transition-colors">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-base font-medium text-slate-300 truncate pr-2">
                                                                    {stage.name}
                                                                </span>
                                                                {getResultIcon(firstResultStatus)}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {stage.startDate ? new Date(stage.startDate).toLocaleDateString() : '...'}
                                                                {stage.endDate && stage.startDate !== stage.endDate && ` - ${new Date(stage.endDate).toLocaleDateString()}`}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredOlympiads.length === 0 && (
                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                            Олимпиад не найдено. Добавь новую!
                        </div>
                    )}
                </div>
            )}
        </MainLayout>
    );
};

export default OlympiadList;
