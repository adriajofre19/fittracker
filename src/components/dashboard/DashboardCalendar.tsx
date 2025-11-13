import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SleepRecord, Meal } from "../../types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ca } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    sleepRecords: SleepRecord[];
    meals: Meal[];
}

const weekDays = ["DL", "DT", "DM", "DJ", "DV", "DS", "DG"];

export default function DashboardCalendar({
    selectedDate,
    onDateSelect,
    sleepRecords,
    meals,
}: DashboardCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [markedSleepDates, setMarkedSleepDates] = useState<Map<string, SleepRecord>>(new Map());
    const [markedMealDates, setMarkedMealDates] = useState<Map<string, Meal>>(new Map());

    useEffect(() => {
        const sleepMap = new Map<string, SleepRecord>();
        sleepRecords.forEach((record) => {
            sleepMap.set(record.sleep_date, record);
        });
        setMarkedSleepDates(sleepMap);

        const mealMap = new Map<string, Meal>();
        meals.forEach((meal) => {
            mealMap.set(meal.meal_date, meal);
        });
        setMarkedMealDates(mealMap);
    }, [sleepRecords, meals]);

    const getSleepQualityColor = (hours: number): string => {
        if (hours >= 8) return "bg-green-500";
        if (hours >= 7) return "bg-blue-500";
        if (hours >= 6) return "bg-yellow-500";
        return "bg-red-500";
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(startDate) || 7);
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (7 - getDay(endDate)) % 7);
    
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDateClick = (date: Date) => {
        onDateSelect(date);
    };

    const isToday = (date: Date) => {
        return isSameDay(date, new Date());
    };

    const isSelected = (date: Date) => {
        return selectedDate && isSameDay(date, selectedDate);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <Card className="bg-white border border-neutral-200 shadow-lg h-full flex flex-col">
                <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                    {/* Header amb navegació */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousMonth}
                            className="h-9 w-9 rounded-md border border-neutral-300 hover:bg-neutral-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                            {format(currentMonth, "LLLL yyyy", { locale: ca })}
                        </h2>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-9 w-9 rounded-md border border-neutral-300 hover:bg-neutral-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Dies de la setmana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs sm:text-sm font-semibold text-neutral-600 uppercase py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendari */}
                    <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
                        {daysInMonth.map((date, index) => {
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const isSelectedDate = isSelected(date);
                            const isTodayDate = isToday(date);
                            const dateStr = format(date, "yyyy-MM-dd");
                            const sleepRecord = markedSleepDates.get(dateStr);
                            const mealRecord = markedMealDates.get(dateStr);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    className={`
                                        relative flex flex-col items-center justify-center
                                        aspect-square min-h-[3rem] sm:min-h-[4rem]
                                        rounded-md transition-all
                                        ${!isCurrentMonth ? "text-neutral-300" : "text-neutral-900"}
                                        ${isSelectedDate 
                                            ? "bg-neutral-900 text-white font-semibold shadow-md" 
                                            : isTodayDate 
                                                ? "bg-neutral-100 text-neutral-900 font-bold border-2 border-neutral-400"
                                                : "hover:bg-neutral-50"
                                        }
                                    `}
                                >
                                    <span className="text-sm sm:text-base font-medium">
                                        {format(date, "d")}
                                    </span>
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        {sleepRecord && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${getSleepQualityColor(sleepRecord.total_sleep_hours)}`}></span>
                                        )}
                                        {mealRecord && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

