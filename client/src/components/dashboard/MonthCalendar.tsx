import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
    id: number;
    olympiadName: string;
    subject: string;
    stageName: string;
    startDate: string;
    endDate: string;
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

    const getEventsForDay = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return events.filter(e => {
            const start = new Date(e.startDate);
            const end = new Date(e.endDate);
            // Check if date is within event range (ignoring time)
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            return checkDate >= startDate && checkDate <= endDate;
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
                        <div key={`empty-${i}`} className="h-24 bg-slate-950/30 rounded-md border border-transparent" />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-24 p-1 rounded-md border bg-slate-950/50 flex flex-col gap-1 overflow-hidden transition-colors",
                                    isToday ? "border-indigo-500/50 bg-indigo-950/10" : "border-slate-800/50 hover:border-slate-700"
                                )}
                            >
                                <span className={cn("text-xs font-medium ml-1", isToday ? "text-indigo-400" : "text-slate-400")}>
                                    {day}
                                </span>
                                <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => navigate(`/olympiad/${event.id}`)}
                                            className="text-[10px] p-1 rounded bg-indigo-500/20 text-indigo-200 truncate cursor-pointer hover:bg-indigo-500/30"
                                            title={`${event.olympiadName}: ${event.stageName}`}
                                        >
                                            {event.olympiadName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
