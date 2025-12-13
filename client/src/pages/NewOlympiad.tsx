import MainLayout from '@/layouts/MainLayout';
import { OlympiadForm } from '@/components/olympiads/OlympiadForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewOlympiad = () => {
    const navigate = useNavigate();

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch('/api/olympiads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                navigate('/olympiads');
            } else {
                console.error('Failed to create olympiad');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <MainLayout>
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate('/olympiads')} className="mb-4 pl-0 hover:pl-2 transition-all text-slate-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к списку
                </Button>
                <h2 className="text-3xl font-bold text-white">Новая Олимпиада</h2>
                <p className="text-slate-400 mt-2">Заполни информацию о соревновании. Ты сможешь изменить её позже.</p>
            </div>

            <div className="max-w-3xl">
                <OlympiadForm onSubmit={handleSubmit} />
            </div>
        </MainLayout>
    );
};

export default NewOlympiad;
