import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const stageSchema = z.object({
    id: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
    name: z.string().min(1, "Название этапа обязательно"),
    type: z.string().default('Offline'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    regDeadline: z.string().optional(),
});

const profileSchema = z.object({
    id: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
    subject: z.string().min(1, "Предмет обязателен"),
    level: z.string().optional(),
    description: z.string().optional(),
    stages: z.array(stageSchema).default([]),
});

const olympiadSchema = z.object({
    name: z.string().min(1, "Название олимпиады обязательно"),
    website: z.string().url("Некорректный URL").optional().or(z.literal('')),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    description: z.string().optional(),
    contacts: z.string().optional(),
    profiles: z.array(profileSchema).default([]),
});

type OlympiadFormValues = z.infer<typeof olympiadSchema>;

interface OlympiadFormProps {
    initialData?: OlympiadFormValues;
    onSubmit: (data: OlympiadFormValues) => void;
    isLoading?: boolean;
}

export const OlympiadForm = ({ initialData, onSubmit, isLoading }: OlympiadFormProps) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<OlympiadFormValues>({
        resolver: zodResolver(olympiadSchema) as any,
        defaultValues: initialData || {
            name: '',
            website: '',
            priority: 'Medium',
            description: '',
            contacts: '',
            profiles: []
        }
    });

    const { fields: profileFields, append: appendProfile, remove: removeProfile } = useFieldArray({
        control,
        name: "profiles"
    });

    return (
        <form onSubmit={handleSubmit((data) => {
            console.log('FORM SUBMISSION DATA:', JSON.stringify(data, null, 2));
            onSubmit(data);
        })} className="space-y-6">
            {/* General Info */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-slate-200">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-400">Название</Label>
                            <Input id="name" {...register("name")} placeholder="Например: ВсОШ" className="bg-slate-950 border-slate-800 text-white" />
                            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-slate-400">Приоритет</Label>
                            <select
                                {...register("priority")}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="High">🔥 Высокий</option>
                                <option value="Medium">⚖️ Средний</option>
                                <option value="Low">🧊 Низкий</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="website" className="text-slate-400">Веб-сайт</Label>
                            <Input id="website" {...register("website")} placeholder="https://..." className="bg-slate-950 border-slate-800 text-white" />
                            {errors.website && <p className="text-red-400 text-xs">{errors.website.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-slate-400">Описание</Label>
                            <textarea
                                id="description"
                                {...register("description")}
                                placeholder="Краткое описание олимпиады..."
                                className="flex min-h-[80px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="contacts" className="text-slate-400">Контакты</Label>
                            <Input id="contacts" {...register("contacts")} placeholder="Email, телефон или ссылки на соцсети" className="bg-slate-950 border-slate-800 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profiles & Stages */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-slate-200">Профили и Этапы</h3>
                    <Button type="button" onClick={() => appendProfile({ subject: '', level: '-', description: '', stages: [] })} variant="outline" size="sm" className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-950">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить профиль
                    </Button>
                </div>

                {profileFields.map((field, index) => (
                    <div key={field.id}>
                        <input type="hidden" {...register(`profiles.${index}.id`)} />
                        <ProfileSection index={index} control={control} register={register} remove={() => removeProfile(index)} errors={errors} />
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
};

const ProfileSection = ({ index, control, register, remove, errors }: any) => {
    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({
        control,
        name: `profiles.${index}.stages`
    });
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card className="bg-slate-900/30 border-slate-800">
            <div className="p-4 flex items-center gap-4 border-b border-slate-800/50">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0 text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            {...register(`profiles.${index}.subject`)}
                            placeholder="Предмет (например: Физика)"
                            className="bg-transparent border-none text-lg font-medium text-white placeholder:text-slate-600 focus-visible:ring-0 px-0 h-auto"
                        />
                        {errors.profiles?.[index]?.subject && <p className="text-red-400 text-xs">{errors.profiles[index].subject.message}</p>}
                    </div>
                    <div>
                        <select
                            {...register(`profiles.${index}.level`)}
                            className="flex h-8 w-full rounded-md border border-slate-800 bg-slate-950 px-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="-">Не в перечне</option>
                            <option value="1">1 уровень</option>
                            <option value="2">2 уровень</option>
                            <option value="3">3 уровень</option>
                        </select>
                    </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={remove} className="text-slate-500 hover:text-red-400 hover:bg-red-950/20">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {isExpanded && (
                <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Описание профиля</Label>
                        <Input
                            {...register(`profiles.${index}.description`)}
                            placeholder="Дополнительная информация о профиле..."
                            className="bg-slate-950 border-slate-800 text-white text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500 mb-2 block">Этапы</Label>
                        {stageFields.map((stage, sIndex) => (
                            <div key={stage.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start p-3 bg-slate-950/50 rounded border border-slate-800/50">
                                <input type="hidden" {...register(`profiles.${index}.stages.${sIndex}.id`)} />
                                <div className="md:col-span-4 space-y-1">
                                    <Label className="text-xs text-slate-500">Название этапа</Label>
                                    <Input {...register(`profiles.${index}.stages.${sIndex}.name`)} placeholder="Отборочный" className="h-8 text-sm bg-slate-900 border-slate-800" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-xs text-slate-500">Тип</Label>
                                    <select {...register(`profiles.${index}.stages.${sIndex}.type`)} className="flex h-8 w-full rounded-md border border-slate-800 bg-slate-900 px-2 text-xs text-white">
                                        <option value="Offline">Очно</option>
                                        <option value="Online">Онлайн</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-xs text-slate-500">Начало</Label>
                                    <Input type="date" {...register(`profiles.${index}.stages.${sIndex}.startDate`)} className="h-8 text-xs bg-slate-900 border-slate-800" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-xs text-slate-500">Конец</Label>
                                    <Input type="date" {...register(`profiles.${index}.stages.${sIndex}.endDate`)} className="h-8 text-xs bg-slate-900 border-slate-800" />
                                </div>
                                <div className="md:col-span-1 flex justify-center pt-5">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStage(sIndex)} className="h-6 w-6 text-slate-600 hover:text-red-400">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button type="button" onClick={() => appendStage({ name: '', type: 'Offline' })} variant="ghost" size="sm" className="w-full border border-dashed border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30">
                            <Plus className="w-3 h-3 mr-2" />
                            Добавить этап
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
