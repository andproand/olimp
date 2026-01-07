import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, CheckCircle2, XCircle, Hourglass, AlertCircle, MinusCircle, ArrowUpDown, ChevronDown, ChevronUp, Filter, ChevronsDown, ChevronsUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
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
    const [collapsedOlympiads, setCollapsedOlympiads] = useState<Set<number>>(new Set());

    // Filter States
    const [filterPriority, setFilterPriority] = useState<string>('all');

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const filterParam = searchParams.get('filter'); // 'current' | 'completed' | null
    const statusParam = searchParams.get('status');
    const stageParam = searchParams.get('stage');

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

    const toggleCollapse = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedOlympiads(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllCollapse = () => {
        if (collapsedOlympiads.size === filteredOlympiads.length && filteredOlympiads.length > 0) {
            // Expand All
            setCollapsedOlympiads(new Set());
        } else {
            // Collapse All
            const allIds = filteredOlympiads.map(o => o.id);
            setCollapsedOlympiads(new Set(allIds));
        }
    };

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

        // Priority Filter
        if (filterPriority !== 'all') {
            const p = o.priority?.toLowerCase() || 'low';
            if (p !== filterPriority) return false;
        }

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

        if (statusParam) {
            // Check if any result in any stage matches the status
            const hasStatus = o.profiles.some(p => p.stages.some(s =>
                s.results.some(r => r.status.toLowerCase().includes(statusParam.toLowerCase()))
            ));
            return matchesSearch && hasStatus;
        }

        if (stageParam) {
            // Check if any stage name matches the stage param (e.g. 'registration', 'qualifying', 'final')
            const p = stageParam.toLowerCase();
            const hasStage = o.profiles.some(profile => profile.stages.some(s => {
                const sName = s.name.toLowerCase();
                if (p === 'registration') return sName.includes('регистрация') || sName.includes('registration');
                if (p === 'qualifying') return sName.includes('отбор') || sName.includes('qualifying') || sName.includes('invitational') || sName.includes('пригласительный');
                if (p === 'final') return sName.includes('финал') || sName.includes('final') || sName.includes('заключительный');
                return sName.includes(p);
            }));
            return matchesSearch && hasStage;
        }

        return matchesSearch;
    }).sort((a, b) => {
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        if (sortOrder === 'priority') return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        // Date sort: by updatedAt (most recent first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-900/50 bg-red-950/20';
            case 'medium': return 'text-yellow-400 border-yellow-900/50 bg-yellow-950/20';
            case 'low': return 'text-slate-200 border-slate-700 bg-slate-800/50'; // White/Default
            default: return 'text-slate-200 border-slate-700 bg-slate-800/50';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'Высокая';
            case 'medium': return 'Средняя';
            case 'low': return 'Низкая';
            default: return priority || 'Низкая';
        }
    };

    const getLevelColor = (level: number | string | null) => {
        const l = String(level);
        if (l === '1') return 'text-red-400 bg-red-950/20 border-red-900/50 text-sm font-bold';
        if (l === '2') return 'text-yellow-400 bg-yellow-950/20 border-yellow-900/50 text-sm font-bold';
        if (l === '3') return 'text-green-400 bg-green-950/20 border-green-900/50 text-sm font-bold';
        return 'text-slate-300 bg-slate-800 border-slate-700 text-xs';
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

    const areAllCollapsed = filteredOlympiads.length > 0 && collapsedOlympiads.size === filteredOlympiads.length;

    const setFilterParam = (value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set('filter', value);
        else newParams.delete('filter');
        setSearchParams(newParams);
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Мои Олимпиады</h2>
                    <p className="text-slate-400 mt-1">Управляй своим списком соревнований.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/olympiads/new')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 flex gap-2">
                    <Button
                        variant="outline"
                        onClick={toggleAllCollapse}
                        className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 px-3"
                    >
                        {areAllCollapsed ? <ChevronsDown className="w-4 h-4" /> : <ChevronsUp className="w-4 h-4" />}
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Поиск по названию или предмету..."
                            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={cn("border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800", (filterParam || filterPriority !== 'all') && "text-indigo-400 border-indigo-900/50")}>
                            <Filter className="w-4 h-4 mr-2" />
                            Фильтр
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 w-56">
                        <DropdownMenuLabel>Статус</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem checked={!filterParam} onCheckedChange={() => setFilterParam(null)}>
                            Все
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterParam === 'current'} onCheckedChange={() => setFilterParam('current')}>
                            Активные
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterParam === 'completed'} onCheckedChange={() => setFilterParam('completed')}>
                            Завершенные
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator className="bg-slate-800" />

                        <DropdownMenuLabel>Приоритет</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem checked={filterPriority === 'all'} onCheckedChange={() => setFilterPriority('all')}>
                            Все
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterPriority === 'high'} onCheckedChange={() => setFilterPriority('high')}>
                            Высокий
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterPriority === 'medium'} onCheckedChange={() => setFilterPriority('medium')}>
                            Средний
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filterPriority === 'low'} onCheckedChange={() => setFilterPriority('low')}>
                            Низкий
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                    {filteredOlympiads.map(olympiad => {
                        const isCollapsed = collapsedOlympiads.has(olympiad.id);
                        return (
                            <Card
                                key={olympiad.id}
                                className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                                onClick={() => navigate(`/olympiad/${olympiad.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-slate-500 hover:text-white"
                                                    onClick={(e) => toggleCollapse(olympiad.id, e)}
                                                >
                                                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                                </Button>
                                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{olympiad.name}</h3>
                                            </div>
                                            {olympiad.organizer && (
                                                <p className="text-slate-400 text-xs mt-1">{olympiad.organizer}</p>
                                            )}
                                        </div>
                                    </div>

                                    {!isCollapsed && (
                                        <div className="space-y-6 mt-6">
                                            {olympiad.profiles.map((profile, pIdx) => (
                                                <div key={pIdx} className="relative flex flex-col md:flex-row gap-4 items-start border-b border-slate-800/50 last:border-0 pb-4 last:pb-0">
                                                    {/* Profile Header (Left) */}
                                                    <div className="flex flex-wrap md:flex-col items-center md:items-start gap-3 md:w-1/4 shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base font-bold text-slate-200">
                                                                {profile.subject}
                                                            </span>
                                                            {profile.level && (
                                                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", getLevelColor(profile.level))}>
                                                                    {profile.level} ур.
                                                                </span>
                                                            )}
                                                        </div>
                                                        {profile.priority && (
                                                            <div className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", getPriorityColor(profile.priority))}>
                                                                {getPriorityLabel(profile.priority)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Stages Grid (Right) */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                                                        {profile.stages.map((stage, sIdx) => {
                                                            const hasResults = stage.results && stage.results.length > 0;
                                                            const firstResultStatus = hasResults ? stage.results[0].status : undefined;

                                                            const now = new Date();
                                                            const isActive = stage.startDate && stage.endDate &&
                                                                new Date(stage.startDate) <= now && new Date(stage.endDate) >= now;

                                                            return (
                                                                <div
                                                                    key={sIdx}
                                                                    className={cn(
                                                                        "flex flex-col p-2 rounded-lg border transition-colors",
                                                                        isActive
                                                                            ? "bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                                                                            : "bg-slate-950/50 border-slate-800/50 hover:border-indigo-500/30"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className={cn("text-sm font-medium truncate pr-2", isActive ? "text-indigo-200" : "text-slate-300")}>
                                                                            {stage.name}
                                                                        </span>
                                                                        {getResultIcon(firstResultStatus)}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
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
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
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
