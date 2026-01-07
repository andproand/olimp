import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X, Hourglass, AlertCircle, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
    id: number;
    olympiadName: string;
    subject: string;
    stageName: string;
    startDate: string;
    endDate: string;
    status?: string | null;
}

interface MonthCalendarProps {
    events: CalendarEvent[];
}

export const MonthCalendar = ({ events }: MonthCalendarProps) => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        // Adjust for Monday start (Russian standard)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        return { days, firstDay: adjustedFirstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const getShortName = (name: string, maxLength: number = 3) => {
        const parts = name.split(',');
        const short = parts[0].trim();
        if (maxLength <= 3) {
            return short.length > maxLength ? short.slice(0, maxLength).toUpperCase() : short.toUpperCase();
        }
        return short.length > maxLength ? short.slice(0, maxLength) + '...' : short;
    };

    const getStatusIcon = (status?: string | null) => {
        if (!status) return null;
        const s = status.toLowerCase();
        if (s.includes('winner') || s.includes('prize') || s.includes('passed') || s.includes('победитель') || s.includes('призер')) return <Check className="w-3 h-3" />;
        if (s.includes('failed') || s.includes('не прошел')) return <X className="w-3 h-3" />;
        if (s.includes('waiting') || s.includes('ожидание')) return <Hourglass className="w-3 h-3" />;
        if (s.includes('participant') || s.includes('участник')) return <AlertCircle className="w-3 h-3" />;
        if (s.includes('not') || s.includes('не')) return <Minus className="w-3 h-3" />;
        return null;
    };

    const getStatusColor = (status?: string | null) => {
        if (!status) return "bg-slate-800/50 text-slate-300 border-slate-700";
        const s = status.toLowerCase();
        if (s.includes('winner') || s.includes('prize') || s.includes('passed') || s.includes('победитель') || s.includes('призер')) return "bg-green-950/40 text-green-300 border-green-900/50";
        if (s.includes('failed') || s.includes('не прошел')) return "bg-slate-800 text-slate-500 border-slate-700";
        if (s.includes('waiting') || s.includes('ожидание')) return "bg-yellow-950/40 text-yellow-300 border-yellow-900/50";
        if (s.includes('participant') || s.includes('участник')) return "bg-blue-950/40 text-blue-300 border-blue-900/50";
        return "bg-slate-800/50 text-slate-300 border-slate-700";
    };

    const getEventsForDay = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        date.setHours(0, 0, 0, 0);

        return events.filter(event => {
            // Filter out unwanted statuses
            const status = event.status?.toLowerCase();
            if (status && (
                status.includes('failed') || status.includes('не прошел') ||
                status.includes('notinterested') || status.includes('не интересно') ||
                status.includes('notsuitable') || status.includes('не подходит')
            )) {
                return false;
            }

            if (!event.startDate) return false;
            const start = new Date(event.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(event.endDate || event.startDate);
            end.setHours(0, 0, 0, 0);

            // Show only on Start Date and End Date to avoid clutter
            const isStart = date.getTime() === start.getTime();
            const isEnd = date.getTime() === end.getTime();

            return isStart || isEnd;
        }).map(e => {
            const start = new Date(e.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(e.endDate);
            end.setHours(0, 0, 0, 0);

            const isStart = date.getTime() === start.getTime();
            const isEnd = date.getTime() === end.getTime();
            const isSameDay = start.getTime() === end.getTime();

            let label = "";
            if (isSameDay) label = "";
            else if (isStart) label = "(Начало)";
            else if (isEnd) label = "(Конец)";

            return { ...e, dayLabel: label };
        });
    };

    return (
        <Card className="h-full bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-400" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-400 hover:text-white">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 text-slate-400 hover:text-white text-xs font-medium px-2">
                        Сегодня
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-400 hover:text-white">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                    <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                </div>
                <div className="grid grid-cols-7 gap-1 auto-rows-fr">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-[115px] bg-slate-950/30 rounded-md border border-transparent" />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-[115px] p-1 rounded-md border bg-slate-950/50 flex flex-col gap-1 overflow-hidden transition-colors",
                                    isToday ? "bg-indigo-950/10 ring-1 ring-inset ring-indigo-500/50" : "border-slate-800/50 hover:border-slate-700"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium mb-1 inline-flex items-center justify-center w-6 h-6 rounded-full",
                                    isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400"
                                )}>
                                    {day}
                                </span>
                                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                    {dayEvents.map((event, idx) => {
                                        const isFinal = event.stageName.toLowerCase().includes('финал') || event.stageName.toLowerCase().includes('заключительный');
                                        const isEnd = event.dayLabel === '(Конец)';

                                        let bgClass = getStatusColor(event.status);
                                        if (isFinal) {
                                            bgClass = "bg-red-950/40 text-red-200 border-red-900/50";
                                        }

                                        return (
                                            <div
                                                key={`${event.id}-${idx}`}
                                                onClick={() => navigate(`/olympiad/${event.id}`)}
                                                className={cn(
                                                    "text-[10px] p-1 rounded border flex items-center justify-between gap-1 cursor-pointer hover:opacity-80",
                                                    bgClass,
                                                    isEnd && "border-red-500/50"
                                                )}
                                                title={`${event.olympiadName}: ${event.stageName} (${event.subject})`}
                                            >
                                                <div className="flex items-center gap-1 truncate">
                                                    {event.dayLabel === '(Начало)' && <ArrowUpRight className="w-3 h-3 text-green-400" />}
                                                    {event.dayLabel === '(Конец)' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                                                    <span className="font-bold">{getShortName(event.olympiadName, 15)}</span>
                                                    <span className="opacity-70">{getShortName(event.stageName, 3)}</span>
                                                    <span className="opacity-50">{getShortName(event.subject, 3)}</span>
                                                </div>
                                                {getStatusIcon(event.status)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
