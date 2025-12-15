import { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Database, Download, Upload } from 'lucide-react';

const Settings = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings/username')
            .then(res => res.json())
            .then(data => {
                if (data.value) setName(data.value);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: name })
            });

            if (!res.ok) throw new Error('Failed to save');

            // Reload to update global state if needed, or just show success
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Ошибка сохранения настроек');
        } finally {
            setSaving(false);
        }
    };

    return (
        <MainLayout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">Настройки</h2>
                <p className="text-slate-400 mt-1">Управление профилем и предпочтениями.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" />
                            Профиль пользователя
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-400">Имя пользователя</Label>
                            <div className="flex gap-4">
                                <Input
                                    id="username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Как к вам обращаться?"
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                                <Button onClick={handleSave} disabled={saving || loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">Это имя будет отображаться на главной странице.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                            <Database className="w-5 h-5 text-green-400" />
                            Управление данными
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Вы можете выгрузить все данные в Excel для резервного копирования или загрузить их обратно.
                            Используйте экспорт, чтобы получить шаблон для заполнения.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/api/data/export'}
                                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Экспорт в Excel
                            </Button>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append('file', file);

                                        try {
                                            const res = await fetch('/api/data/import', {
                                                method: 'POST',
                                                body: formData
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert(`Импорт завершен!\nСоздано: ${data.created}\nОбновлено: ${data.updated}`);
                                                window.location.reload();
                                            } else {
                                                alert('Ошибка импорта: ' + data.error);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('Ошибка загрузки файла');
                                        }
                                        // Reset input
                                        e.target.value = '';
                                    }}
                                />
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 pointer-events-none">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Импорт из Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Settings;
