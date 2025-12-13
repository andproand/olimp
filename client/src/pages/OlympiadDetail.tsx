import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ExternalLink, Calendar, Trophy, Edit, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    startDate: string | null;
    endDate: string | null;
    results: Result[];
}

interface Profile {
    id: number;
    subject: string;
    level: string | null;
    description: string | null;
    stages: Stage[];
}

interface Olympiad {
    id: number;
    name: string;
    website: string | null;
    priority: string;
    description: string | null;
    contacts: string | null;
    logoUrl: string | null;
    profiles: Profile[];
}

const OlympiadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [olympiad, setOlympiad] = useState<Olympiad | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOlympiad = () => {
        fetch(`/api/olympiads/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setOlympiad(data);
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
                                <Badge variant="outline" className="text-indigo-300 border-indigo-500/50">
                                    {olympiad.priority} Priority
                                </Badge>
                            </div>
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
                            </div>
                            {olympiad.description && (
                                <p className="mt-4 text-slate-300 max-w-2xl text-sm leading-relaxed">{olympiad.description}</p>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate(`/olympiad/${id}/edit`)}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Profiles & Stages */}
                <div className="lg:col-span-2 space-y-6">
                    {olympiad.profiles.map(profile => (
                        <Card key={profile.id} className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        {profile.subject}
                                    </CardTitle>
                                    {profile.level && profile.level !== '-' && (
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                            {profile.level} уровень
                                        </Badge>
                                    )}
                                </div>
                                {profile.description && (
                                    <p className="text-sm text-slate-500 mt-1">{profile.description}</p>
                                )}
                            </CardHeader>
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
                        </Card>
                    ))}
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
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{stage.type}</span>
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
                            <option value="Participant">Участник</option>
                            <option value="Winner">Победитель</option>
                            <option value="Prize-winner">Призер</option>
                            <option value="Waiting">Ожидание</option>
                            <option value="Failed">Не прошел</option>
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

import { Plus } from 'lucide-react';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Winner': return 'bg-yellow-500 text-yellow-300';
        case 'Prize-winner': return 'bg-orange-500 text-orange-300';
        case 'Participant': return 'bg-blue-500 text-blue-300';
        case 'Failed': return 'bg-red-500 text-red-300';
        case 'Waiting': return 'bg-slate-500 text-slate-300';
        default: return 'bg-slate-500 text-slate-300';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Winner': return 'Победитель';
        case 'Prize-winner': return 'Призер';
        case 'Participant': return 'Участник';
        case 'Failed': return 'Не прошел';
        case 'Waiting': return 'Ожидание';
        default: return status;
    }
};

export default OlympiadDetail;
