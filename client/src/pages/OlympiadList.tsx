import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Filter, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Stage {
    name: string;
    startDate: string | null;
    endDate: string | null;
}

interface Profile {
    subject: string;
    level: number | null;
    stages: Stage[];
}

interface Olympiad {
    id: number;
    name: string;
    priority: string;
    contacts: string | null;
    profiles: Profile[];
}

const OlympiadList = () => {
    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

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

    const filteredOlympiads = olympiads.filter(o =>
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.profiles.some(p => p.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    const getStageStatus = (stage: Stage) => {
        if (!stage.startDate) return 'future';
        const now = new Date();
        const start = new Date(stage.startDate);
        // If no end date, assume it ends at the end of the start day
        const end = stage.endDate ? new Date(stage.endDate) : new Date(start.getTime() + 86400000);

        // Reset hours to compare dates only if needed, but for now strict comparison
        if (now > end) return 'completed';
        if (now >= start && now <= end) return 'current';
        // Also check if we are "approaching" the start date (e.g. within 3 days) could be useful, but for now:
        return 'future';
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
                <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800">
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                </Button>
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
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Left: Info & Organizer */}
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                                                {olympiad.name}
                                            </h3>
                                            <Badge variant="outline" className={`ml-2 ${getPriorityColor(olympiad.priority)}`}>
                                                {getPriorityLabel(olympiad.priority)}
                                            </Badge>
                                        </div>

                                        {olympiad.contacts && (
                                            <div className="flex items-center text-sm text-slate-500 mb-3">
                                                <User className="w-3 h-3 mr-1.5" />
                                                <span className="font-normal">{olympiad.contacts}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Profiles & Stages */}
                                    <div className="flex-[2] border-l border-slate-800/50 pl-0 md:pl-6 pt-4 md:pt-0 space-y-6">
                                        {olympiad.profiles.map((profile, pIdx) => (
                                            <div key={pIdx} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                                        {profile.subject}
                                                    </Badge>
                                                    {profile.level && (
                                                        <span className="text-xs text-slate-500 font-mono border border-slate-800 px-1.5 py-0.5 rounded">
                                                            {profile.level} ур.
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                    {profile.stages.map((stage, sIdx) => {
                                                        const status = getStageStatus(stage);
                                                        return (
                                                            <div key={sIdx} className="flex items-center shrink-0">
                                                                <div className={cn(
                                                                    "flex flex-col items-center p-2 rounded border min-w-[100px] text-center transition-all",
                                                                    status === 'current' ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]" :
                                                                        status === 'completed' ? "bg-slate-900 border-slate-800 opacity-50" :
                                                                            "bg-slate-950 border-slate-800"
                                                                )}>
                                                                    <span className={cn(
                                                                        "text-xs font-medium mb-1",
                                                                        status === 'current' ? "text-indigo-300" : "text-slate-400"
                                                                    )}>
                                                                        {stage.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                                        {stage.startDate ? new Date(stage.startDate).toLocaleDateString('ru-RU') : 'TBD'}
                                                                    </span>
                                                                </div>
                                                                {sIdx < profile.stages.length - 1 && (
                                                                    <ChevronRight className="w-4 h-4 text-slate-700 mx-1" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {(!profile.stages || profile.stages.length === 0) && (
                                                        <span className="text-sm text-slate-600 italic">Этапы не добавлены</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {olympiad.profiles.length === 0 && (
                                            <div className="text-sm text-slate-600 italic">Профили не добавлены</div>
                                        )}
                                    </div>
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
