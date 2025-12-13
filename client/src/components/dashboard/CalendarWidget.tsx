import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
    id: number;
    olympiadName: string;
    subject: string;
    stageName: string;
    startDate: string;
    endDate: string;
    status: 'urgent' | 'approaching' | 'done' | 'lost' | 'future';
}

// Mock data generator for visualization (until backend provides full status)
// In a real scenario, this logic might move to the backend or a utility function
const getStatus = (start: Date, end: Date): CalendarEvent['status'] => {
    const now = new Date();
    if (now > end) return 'done'; // Simplified
    if (now >= start && now <= end) return 'approaching';
    const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 3) return 'urgent';
    if (diffDays < 14) return 'approaching';
    return 'future';
};

const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
        case 'urgent': return 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse';
        case 'approaching': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
        case 'done': return 'bg-green-500/10 border-green-500/30 text-green-500/50';
        case 'lost': return 'bg-slate-700/50 border-slate-600 text-slate-500';
        case 'future': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
        default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
};

const getStatusLabel = (status: CalendarEvent['status']) => {
    switch (status) {
        case 'urgent': return '⚠️ Срочно';
        case 'approaching': return '⏳ Скоро';
        case 'done': return '✅ Завершено';
        case 'lost': return '❌ Пропущено';
        case 'future': return '⚪ Планируется';
    }
};

interface CalendarWidgetProps {
    events: Array<{
        id: number;
        olympiadName: string;
        subject: string;
        stageName: string;
        startDate: string;
        endDate: string;
    }>;
}

export const CalendarWidget = ({ events }: CalendarWidgetProps) => {
    const navigate = useNavigate();

    // 1. Transform data to include status
    const allEvents: CalendarEvent[] = events.map(e => ({
        ...e,
        status: getStatus(new Date(e.startDate), new Date(e.endDate))
    }));

    // 2. Filter and Sort
    const now = new Date();

    // Current: All events happening now
    const currentEvents = allEvents.filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return now >= start && now <= end;
    }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

    // Past: Finished events, sort by end date descending (most recent first), take top 3
    const pastEvents = allEvents.filter(e => {
        const end = new Date(e.endDate);
        return now > end;
    }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
        .slice(0, 3);

    // Future: Upcoming events, sort by start date ascending (nearest first), take top 3
    const futureEvents = allEvents.filter(e => {
        const start = new Date(e.startDate);
        return now < start;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3);

    // Combine: Past -> Current -> Future
    // If total events < 10, we might show more, but per requirements: 
    // "Current - all, Past - 2-3, Future - 2-3"
    const displayEvents = [...pastEvents.reverse(), ...currentEvents, ...futureEvents];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    Календарь событий
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayEvents.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Событий пока нет.</p>
                    ) : (
                        displayEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/olympiad/${event.id}`)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-slate-900 cursor-pointer group",
                                    getStatusColor(event.status)
                                )}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium group-hover:underline">{event.olympiadName}</span>
                                    <span className="text-xs opacity-80">{event.subject} • {event.stageName}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="outline" className="text-[10px] bg-black/20 border-white/10">
                                        {getStatusLabel(event.status)}
                                    </Badge>
                                    <span className="text-xs font-mono">
                                        {new Date(event.startDate).toLocaleDateString('ru-RU')}
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
