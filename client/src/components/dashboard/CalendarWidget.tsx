import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Event {
    id: number;
    olympiadName: string;
    stageName: string;
    startDate: string;
    endDate: string;
    subject?: string;
    status?: string;
}

export const CalendarWidget = ({ events }: { events: Event[] }) => {
    const navigate = useNavigate();
    const [isRecentCollapsed, setIsRecentCollapsed] = useState(true);

    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);
    fiveDaysFromNow.setHours(23, 59, 59, 999);

    const groupedEvents = {
        recent: [] as typeof events,
        today: [] as typeof events, // Ends in <= 5 days
        soon: [] as typeof events,  // Starts in <= 5 days
        future: [] as typeof events
    };

    events.forEach(event => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const status = event.status?.toLowerCase() || '';
        const isCompleted = status.includes('winner') || status.includes('prize') || status.includes('participant') || status.includes('победитель') || status.includes('призер') || status.includes('участник') || status.includes('выполнено') || status.includes('completed');

        // Hide Registration if Completed
        if ((event.stageName.toLowerCase().includes('регистрация') || event.stageName.toLowerCase().includes('registration')) && isCompleted) {
            return;
        }

        if (end < now) { // Completed events
            groupedEvents.recent.push(event);
        } else if (end >= now && end <= fiveDaysFromNow) { // Ends within 5 days (Today/Current)
            groupedEvents.today.push(event);
        } else if (start > now && start <= fiveDaysFromNow) { // Starts within 5 days (Attention, Soon!)
            groupedEvents.soon.push(event);
        } else { // Future events
            groupedEvents.future.push(event);
        }
    });

    // Sort
    groupedEvents.recent.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    groupedEvents.today.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    groupedEvents.soon.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Sort Future: if ongoing (start <= now), use endDate; if future (start > now), use startDate
    groupedEvents.future.sort((a, b) => {
        const getSortDate = (e: Event) => {
            const s = new Date(e.startDate);
            return s <= now ? new Date(e.endDate) : s;
        };
        return getSortDate(a).getTime() - getSortDate(b).getTime();
    });

    const renderEvent = (event: Event, type: 'recent' | 'today' | 'soon' | 'future') => {
        const isReg = event.stageName.toLowerCase().includes('регистрация');
        const isFinal = event.stageName.toLowerCase().includes('финал') || event.stageName.toLowerCase().includes('заключительный');

        let dateLabel = '';
        let dateValue = new Date();

        if (type === 'recent') {
            dateLabel = 'Завершено';
            dateValue = new Date(event.endDate);
        } else if (type === 'today') {
            dateLabel = 'До';
            dateValue = new Date(event.endDate);
        } else if (type === 'soon') {
            dateLabel = 'Начало';
            dateValue = new Date(event.startDate);
        } else { // future
            const start = new Date(event.startDate);
            if (start <= now) {
                dateLabel = 'До';
                dateValue = new Date(event.endDate);
            } else {
                dateLabel = 'Начало';
                dateValue = start;
            }
        }

        const dateStr = dateValue.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

        // Calculate urgency
        const diffTime = dateValue.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let barColorClass = "bg-slate-600";
        if (isFinal) {
            barColorClass = "bg-red-500";
        } else if (diffDays < 3 && diffDays >= 0 && type !== 'recent') {
            barColorClass = "bg-red-500";
        } else if (diffDays >= 3 && diffDays <= 5 && type !== 'recent') {
            barColorClass = "bg-orange-500";
        } else if (isReg) {
            barColorClass = "bg-indigo-500";
        }

        const getStatusLabel = (s: string) => {
            if (!s) return '';
            const sl = s.toLowerCase();
            if (sl === 'participant' || sl === 'участник') return 'Участник';
            if (sl === 'winner' || sl === 'победитель') return 'Победитель';
            if (sl === 'prizewinner' || sl === 'призер') return 'Призер';
            if (sl === 'waiting' || sl === 'ожидание') return 'Ожидание';
            if (sl === 'completed' || sl === 'выполнено') return 'Выполнено';
            if (sl === 'inprogress' || sl === 'в работе') return 'В работе';
            return s;
        };

        const statusLabel = getStatusLabel(event.status || '');

        return (
            <div
                key={event.id + event.stageName}
                onClick={() => navigate(`/olympiad/${event.id}`)}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.01]",
                    "bg-slate-900/50 border-slate-800 hover:bg-slate-800/60"
                )}
            >
                <div className={cn("w-1 h-8 rounded-full", barColorClass)} />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 truncate">{event.olympiadName}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                        <span className="text-slate-500">{dateLabel} {dateStr}</span>
                        <span className="text-slate-600 mx-1.5">•</span>
                        {event.subject && (
                            <>
                                <span className="text-slate-300 font-medium">{event.subject}</span>
                                <span className="text-slate-600 mx-1.5">•</span>
                            </>
                        )}
                        {event.stageName}
                        {statusLabel && (
                            <>
                                <span className="text-slate-600 mx-1.5">•</span>
                                <span className={cn(
                                    "font-medium",
                                    statusLabel === 'Победитель' ? "text-yellow-400" :
                                        statusLabel === 'Призер' ? "text-orange-400" :
                                            statusLabel === 'Ожидание' ? "text-blue-400" :
                                                "text-slate-400"
                                )}>{statusLabel}</span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        );
    };

    const renderSection = (title: string, items: typeof events, colorClass: string, type: 'recent' | 'today' | 'soon' | 'future', isCollapsible = false, isCollapsed = false, toggleCollapse?: () => void) => {
        if (items.length === 0) return null;
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 cursor-pointer" onClick={toggleCollapse}>
                    <h4 className={cn("text-xs font-bold uppercase tracking-wider whitespace-nowrap", colorClass)}>{title}</h4>
                    <div className={cn("h-[1px] w-full opacity-30", colorClass.replace('text-', 'bg-'))}></div>
                    {isCollapsible && (
                        <div className="text-slate-500">
                            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="space-y-2">
                        {items.map(e => renderEvent(e, type))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="bg-slate-950 border-slate-800 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Calendar className="w-4 h-4" />
                    Сегодня - {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {renderSection("Внимание, скоро!", groupedEvents.soon, "text-red-400", 'soon')}
                {renderSection("Недавно завершенные", groupedEvents.recent, "text-slate-500", 'recent', true, isRecentCollapsed, () => setIsRecentCollapsed(!isRecentCollapsed))}
                {renderSection("Текущие", groupedEvents.today, "text-green-400", 'today')}
                {renderSection("Будущие", groupedEvents.future, "text-blue-400", 'future')}

                {groupedEvents.today.length === 0 &&
                    groupedEvents.soon.length === 0 &&
                    groupedEvents.future.length === 0 &&
                    groupedEvents.recent.length === 0 && (
                        <p className="text-slate-500 text-center py-8 text-xs">Активных событий нет.</p>
                    )}
            </CardContent>
        </Card>
    );
};
