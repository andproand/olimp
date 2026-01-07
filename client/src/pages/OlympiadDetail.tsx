import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ExternalLink, Calendar, Trophy, Edit, FileText, Clock, Building2, Plus, ChevronRight, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from 'react-markdown';

const PasswordDisplay = ({ password }: { password: string }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-slate-500 text-xs uppercase w-12">Пароль:</span>
            <div className="flex items-center gap-2">
                <span className="font-mono select-all">
                    {show ? password : '••••••••'}
                </span>
                <button onClick={() => setShow(!show)} className="text-slate-500 hover:text-indigo-400 focus:outline-none">
                    {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
            </div>
        </div>
    );
};

interface Result {
    id: number;
    userScore: number | null;
    passingScore: number | null;
    status: string;
    diplomaLink: string | null;
}

interface Stage {
    id: number;
    name: string;
    type: string;
    time: string | null;
    startDate: string | null;
    endDate: string | null;
    results: Result[];
}

interface Profile {
    id: number;
    subject: string;
    level: string | null;
    description: string | null;
    priority: string | null;
    academicYear: string;
    stages: Stage[];
}

interface Olympiad {
    id: number;
    name: string;
    organizer: string | null;
    website: string | null;
    description: string | null;
    contacts: string | null;
    login: string | null;
    password: string | null;
    logoUrl: string | null;
    profiles: Profile[];
}

const OlympiadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [olympiad, setOlympiad] = useState<Olympiad | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [collapsedProfiles, setCollapsedProfiles] = useState<Set<number>>(new Set());

    const fetchOlympiad = () => {
        fetch(`/api/olympiads/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setOlympiad(data);
                // Set default year to the most recent one or "2024/2025"
                if (data.profiles && data.profiles.length > 0) {
                    const years = Array.from(new Set(data.profiles.map((p: Profile) => p.academicYear))).sort().reverse();
                    setSelectedYear(years[0] as string);
                } else {
                    setSelectedYear('2025/2026');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOlympiad();
    }, [id]);

    const toggleProfileCollapse = (profileId: number) => {
        setCollapsedProfiles(prev => {
            const next = new Set(prev);
            if (next.has(profileId)) next.delete(profileId);
            else next.add(profileId);
            return next;
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <Skeleton className="h-12 w-1/3 mb-4" />
                <Skeleton className="h-64 w-full" />
            </MainLayout>
        );
    }

    if (!olympiad) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-white">Олимпиада не найдена</h2>
                    <Button onClick={() => navigate('/olympiads')} className="mt-4">
                        Вернуться к списку
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const years = Array.from(new Set(olympiad.profiles.map(p => p.academicYear))).sort().reverse();
    const filteredProfiles = olympiad.profiles.filter(p => p.academicYear === selectedYear);

    return (
        <MainLayout>
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate('/olympiads')} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к списку
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex gap-4">
                        {olympiad.logoUrl && (
                            <img src={olympiad.logoUrl} alt="Logo" className="w-20 h-20 rounded-lg object-cover bg-white/10" />
                        )}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-white">{olympiad.name}</h2>
                            </div>

                            {olympiad.organizer && (
                                <div className="flex items-center text-slate-400 mb-2">
                                    <Building2 className="w-4 h-4 mr-1.5" />
                                    <span className="font-medium">{olympiad.organizer}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                {olympiad.website && (
                                    <a
                                        href={olympiad.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-slate-400 hover:text-blue-400 transition-colors text-sm"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        {olympiad.website}
                                    </a>
                                )}
                                {olympiad.contacts && (
                                    <p className="text-sm text-slate-500">{olympiad.contacts}</p>
                                )}
                                {(olympiad.login || olympiad.password) && (
                                    <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-800 flex flex-col gap-1">
                                        {olympiad.login && (
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <span className="text-slate-500 text-xs uppercase w-12">Логин:</span>
                                                <span className="font-mono select-all">{olympiad.login}</span>
                                            </div>
                                        )}
                                        {olympiad.password && (
                                            <PasswordDisplay password={olympiad.password} />
                                        )}
                                    </div>
                                )}
                            </div>
                            {olympiad.description && (
                                <div className="mt-4 text-slate-300 max-w-2xl text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{olympiad.description}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Button
                            onClick={() => navigate(`/olympiad/${id}/edit`)}
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                        </Button>

                        {years.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-slate-500">Учебный год:</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-8">
                                            {selectedYear}
                                            <ChevronRight className="w-4 h-4 ml-2 rotate-90" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                        {years.map(year => (
                                            <DropdownMenuItem
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={selectedYear === year ? "bg-slate-800" : ""}
                                            >
                                                {year}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Profiles & Stages */}
                <div className="lg:col-span-2 space-y-6">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map(profile => {
                            const isCollapsed = collapsedProfiles.has(profile.id);
                            return (
                                <Card key={profile.id} className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="cursor-pointer hover:bg-slate-900/30 transition-colors" onClick={() => toggleProfileCollapse(profile.id)}>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
                                                {isCollapsed ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronUp className="w-5 h-5 text-slate-500" />}
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                {profile.subject}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                {profile.priority && (
                                                    <Badge variant="outline" className={cn("border-0 bg-opacity-20",
                                                        profile.priority === 'High' ? 'bg-red-500 text-red-300' :
                                                            profile.priority === 'Medium' ? 'bg-yellow-500 text-yellow-300' :
                                                                'bg-blue-500 text-blue-300'
                                                    )}>
                                                        {profile.priority === 'High' ? 'Высокая' :
                                                            profile.priority === 'Medium' ? 'Средняя' : 'Низкая'}
                                                    </Badge>
                                                )}
                                                {profile.level && profile.level !== '-' && (
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                                        {profile.level} уровень
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {!isCollapsed && profile.description && (
                                            <div className="text-sm text-slate-500 mt-1 prose prose-invert prose-sm max-w-none pl-7">
                                                <ReactMarkdown>{profile.description}</ReactMarkdown>
                                            </div>
                                        )}
                                    </CardHeader>
                                    {!isCollapsed && (
                                        <CardContent>
                                            <div className="space-y-4">
                                                {profile.stages.length === 0 ? (
                                                    <p className="text-slate-500 text-sm italic">Этапы еще не добавлены.</p>
                                                ) : (
                                                    profile.stages.map(stage => (
                                                        <StageItem key={stage.id} stage={stage} onUpdate={fetchOlympiad} />
                                                    ))
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-500">Нет профилей для выбранного учебного года.</p>
                            <Button variant="link" className="text-indigo-400" onClick={() => navigate(`/olympiad/${id}/edit`)}>
                                Добавить профиль
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Notes / Stats (Placeholder) */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/30 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-400">Заметки</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 text-sm">Здесь можно будет оставлять личные заметки и задачи по этой олимпиаде.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

const StageItem = ({ stage, onUpdate }: { stage: Stage, onUpdate: () => void }) => {
    const result = stage.results?.[0];
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        userScore: result?.userScore?.toString() || '',
        passingScore: result?.passingScore?.toString() || '',
        status: result?.status || 'Participant',
        diplomaLink: result?.diplomaLink || ''
    });

    // Hide past stages if no result? User said "past stages (without date, but placed above current - also hide)".
    // This logic is complex to implement perfectly without more context on "placed above current".
    // For now, let's just collapse profiles as requested.
    // User also said "collapse profiles OR past stages". I implemented profile collapsing.
    // Let's stick to that for now.

    const handleSave = async () => {
        try {
            const url = result ? `/api/results/${result.id}` : '/api/results';
            const method = result ? 'PUT' : 'POST';
            const body = {
                ...formData,
                userScore: formData.userScore ? parseFloat(formData.userScore) : null,
                passingScore: formData.passingScore ? parseFloat(formData.passingScore) : null,
                stageId: stage.id
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save result');

            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error(error);
            alert('Ошибка сохранения результата. Убедитесь, что сервер обновлен.');
        }
    };

    return (
        <div className="p-4 bg-slate-950/50 rounded border border-slate-800/50">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-medium text-slate-300 text-lg">{stage.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{stage.type}</span>
                        {stage.time && (
                            <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" />
                                {stage.time}
                            </span>
                        )}
                        {stage.startDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(stage.startDate).toLocaleDateString('ru-RU')}
                                {stage.endDate && ` - ${new Date(stage.endDate).toLocaleDateString('ru-RU')}`}
                            </span>
                        )}
                    </div>
                </div>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-slate-500 hover:text-indigo-400">
                        {result ? <Edit className="w-4 h-4" /> : <PlusCircleIcon className="w-4 h-4 mr-1" text="Добавить результат" />}
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3 bg-slate-900/50 p-3 rounded border border-indigo-500/20">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Мой балл</Label>
                            <Input
                                type="number"
                                value={formData.userScore}
                                onChange={e => setFormData({ ...formData, userScore: e.target.value })}
                                className="h-8 bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-400">Проходной</Label>
                            <Input
                                type="number"
                                value={formData.passingScore}
                                onChange={e => setFormData({ ...formData, passingScore: e.target.value })}
                                className="h-8 bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Статус</Label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="flex h-8 w-full rounded-md border border-slate-800 bg-slate-950 px-2 text-xs text-white"
                        >
                            <option value="">--</option>
                            <option value="Participant">Участник</option>
                            <option value="Winner">Победитель</option>
                            <option value="PrizeWinner">Призер</option>
                            <option value="Completed">Выполнено</option>
                            <option value="InProgress">В работе</option>
                            <option value="Waiting">Ожидание результатов</option>
                            <option value="Failed">Не прошел</option>
                            <option value="NotInterested">Не интересно</option>
                            <option value="NotSuitable">Не подходит</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Ссылка на диплом/файл</Label>
                        <Input
                            value={formData.diplomaLink}
                            onChange={e => setFormData({ ...formData, diplomaLink: e.target.value })}
                            placeholder="https://..."
                            className="h-8 bg-slate-950 border-slate-800"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 text-slate-400">Отмена</Button>
                        <Button size="sm" onClick={handleSave} className="h-7 bg-indigo-600 hover:bg-indigo-700 text-white">Сохранить</Button>
                    </div>
                </div>
            ) : result ? (
                <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Баллы</p>
                        <p className="text-sm font-mono text-white">
                            <span className={result.userScore && result.passingScore && result.userScore >= result.passingScore ? "text-green-400" : "text-slate-200"}>
                                {result.userScore ?? '-'}
                            </span>
                            <span className="text-slate-600 mx-1">/</span>
                            <span className="text-slate-400">{result.passingScore ?? '-'}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Статус</p>
                        <Badge variant="outline" className={cn("mt-0.5 border-0 bg-opacity-20", getStatusColor(result.status))}>
                            {getStatusLabel(result.status)}
                        </Badge>
                    </div>
                    <div className="col-span-2 flex justify-end">
                        {result.diplomaLink && (
                            <a href={result.diplomaLink} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center text-indigo-400 hover:underline">
                                <FileText className="w-3 h-3 mr-1" />
                                Диплом
                            </a>
                        )}
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-center">
                    <p className="text-xs text-slate-600 italic">Результатов пока нет</p>
                </div>
            )}
        </div>
    );
};

const PlusCircleIcon = ({ className, text }: { className?: string, text?: string }) => (
    <div className="flex items-center">
        <div className={cn("rounded-full border border-current p-0.5", className)}>
            <Plus className="w-full h-full" />
        </div>
        {text && <span className="ml-2">{text}</span>}
    </div>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Winner': return 'bg-yellow-500 text-yellow-300';
        case 'PrizeWinner': return 'bg-orange-500 text-orange-300';
        case 'Participant': return 'bg-blue-500 text-blue-300';
        case 'Completed': return 'bg-green-500 text-green-300';
        case 'InProgress': return 'bg-indigo-500 text-indigo-300';
        case 'Failed': return 'bg-red-500 text-red-300';
        case 'Waiting': return 'bg-slate-500 text-slate-300';
        case 'NotInterested': return 'bg-gray-500 text-gray-300';
        case 'NotSuitable': return 'bg-gray-500 text-gray-300';
        default: return 'bg-slate-500 text-slate-300';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Winner': return 'Победитель';
        case 'PrizeWinner': return 'Призер';
        case 'Participant': return 'Участник';
        case 'Completed': return 'Выполнено';
        case 'InProgress': return 'В работе';
        case 'Failed': return 'Не прошел';
        case 'Waiting': return 'Ожидание';
        case 'NotInterested': return 'Не интересно';
        case 'NotSuitable': return 'Не подходит';
        default: return status;
    }
};

export default OlympiadDetail;
