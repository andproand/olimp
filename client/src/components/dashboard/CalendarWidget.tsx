import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Hourglass, AlertCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const getStatusIcon = (status?: string | null) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes('winner') || s.includes('prize') || s.includes('passed') || s.includes('победитель') || s.includes('призер')) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s.includes('failed') || s.includes('не прошел')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (s.includes('waiting') || s.includes('ожидание')) return <Hourglass className="w-4 h-4 text-yellow-500" />;
    if (s.includes('participant') || s.includes('участник')) return <AlertCircle className="w-4 h-4 text-blue-500" />;
    if (s.includes('not') || s.includes('не')) return <MinusCircle className="w-4 h-4 text-slate-500" />;
    return null;
};

const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric' };

    if (start.getTime() === end.getTime()) {
        return start.toLocaleDateString('ru-RU', options);
    }
    return `${start.toLocaleDateString('ru-RU', options)} - ${end.toLocaleDateString('ru-RU', options)}`;
};

interface CalendarWidgetProps {
    events: Array<{
        id: number;
        olympiadName: string;
        subject: string;
        stageName: string;
        startDate: string;
        endDate: string;
        status?: string | null;
    }>;
}

export const CalendarWidget = ({ events }: CalendarWidgetProps) => {
    const navigate = useNavigate();

    const now = new Date();
    const currentEvents = events.filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return now >= start && now <= end;
    }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    const pastEvents = events.filter(e => {
        const end = new Date(e.endDate);
        return now > end;
    }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()).slice(0, 3);

    const futureEvents = events.filter(e => {
        const start = new Date(e.startDate);
        return now < start;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 3);

    const displayEvents = [...pastEvents.reverse(), ...currentEvents, ...futureEvents];

    return (
        <Card className="h-full bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                    Календарь событий
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {displayEvents.length === 0 ? (
                        <p className="text-slate-500 text-center py-8 text-xs">Событий пока нет.</p>
                    ) : (
                        displayEvents.map((event, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/olympiad/${event.id}`)}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded border border-slate-800/50 bg-slate-950/30 hover:bg-slate-900 cursor-pointer group transition-colors",
                                    // Highlight current events slightly
                                    new Date(event.startDate) <= now && new Date(event.endDate) >= now ? "border-indigo-500/30 bg-indigo-950/10" : ""
                                )}
                            >
                                <div className="flex flex-col min-w-0 flex-1 mr-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                            {event.olympiadName}
                                        </span>
                                        {getStatusIcon(event.status)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1">
                                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-medium">{event.subject}</span>
                                        <span>•</span>
                                        <span className="truncate font-medium text-slate-400">{event.stageName}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                        {formatDateRange(event.startDate, event.endDate)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
