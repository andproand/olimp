import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { OlympiadForm } from '@/components/olympiads/OlympiadForm';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditOlympiad = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<any>(undefined);

    useEffect(() => {
        fetch(`/api/olympiads/${id}`)
            .then(res => res.json())
            .then(data => {
                // Transform data to match form shape if necessary
                // The API returns structure similar to form, but we might need to handle nulls
                const formData = {
                    ...data,
                    website: data.website || '',
                    description: data.description || '',
                    contacts: data.contacts || '',
                    profiles: data.profiles.map((p: any) => ({
                        ...p,
                        level: p.level ? String(p.level) : '-',
                        description: p.description || '',
                        stages: p.stages.map((s: any) => ({
                            ...s,
                            startDate: s.startDate ? s.startDate.split('T')[0] : '',
                            endDate: s.endDate ? s.endDate.split('T')[0] : '',
                            regDeadline: s.regDeadline ? s.regDeadline.split('T')[0] : ''
                        }))
                    }))
                };
                setInitialData(formData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch(`/api/olympiads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to update');

            navigate(`/olympiad/${id}`);
        } catch (error) {
            console.error(error);
            // TODO: Show error toast
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <Skeleton className="h-12 w-1/3 mb-6" />
                <Skeleton className="h-[600px] w-full" />
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/olympiad/${id}`)} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к олимпиаде
                    </Button>
                    <h2 className="text-3xl font-bold text-white">Редактирование олимпиады</h2>
                </div>
                <Button
                    variant="destructive"
                    onClick={async () => {
                        if (confirm('Вы уверены, что хотите удалить эту олимпиаду? Это действие нельзя отменить.')) {
                            try {
                                const res = await fetch(`/api/olympiads/${id}`, { method: 'DELETE' });
                                if (res.ok) navigate('/olympiads');
                                else console.error('Failed to delete');
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }}
                >
                    Удалить олимпиаду
                </Button>
            </div>

            <OlympiadForm initialData={initialData} onSubmit={handleSubmit} />
        </MainLayout>
    );
};

export default EditOlympiad;
