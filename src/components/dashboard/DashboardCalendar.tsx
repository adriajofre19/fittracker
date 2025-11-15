import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SleepRecord, Meal, Routine } from "../../types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ca } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    sleepRecords: SleepRecord[];
    meals: Meal[];
    routines: Routine[];
}

const weekDays = ["DL", "DT", "DM", "DJ", "DV", "DS", "DG"];

export default function DashboardCalendar({
    selectedDate,
    onDateSelect,
    sleepRecords,
    meals,
    routines,
}: DashboardCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [markedSleepDates, setMarkedSleepDates] = useState<Map<string, SleepRecord>>(new Map());
    const [markedMealDates, setMarkedMealDates] = useState<Map<string, Meal>>(new Map());
    const [markedRoutineDates, setMarkedRoutineDates] = useState<Map<string, Routine[]>>(new Map());

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

        const routineMap = new Map<string, Routine[]>();
        routines.forEach((routine) => {
            const dateStr = routine.routine_date;
            if (!routineMap.has(dateStr)) {
                routineMap.set(dateStr, []);
            }
            routineMap.get(dateStr)!.push(routine);
        });
        setMarkedRoutineDates(routineMap);
    }, [sleepRecords, meals, routines]);

    const getSleepQualityColor = (hours: number): string => {
        if (hours >= 8) return "bg-green-500";
        if (hours >= 7) return "bg-blue-500";
        if (hours >= 6) return "bg-yellow-500";
        return "bg-red-500";
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    // Ajustar al dilluns: getDay() retorna 0=diumenge, 1=dilluns, etc.
    // Si és diumenge (0), retrocedir 6 dies; si és dilluns (1), retrocedir 0 dies, etc.
    startDate.setDate(startDate.getDate() - ((getDay(startDate) + 6) % 7));
    const endDate = new Date(monthEnd);
    // Ajustar al diumenge: si acaba en diumenge (0), avançar 0 dies; si acaba en dilluns (1), avançar 6 dies, etc.
    endDate.setDate(endDate.getDate() + (6 - getDay(endDate)) % 7);

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
            <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg h-full flex flex-col">
                <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                    {/* Header amb navegació */}
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousMonth}
                            className="h-9 w-9 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {format(currentMonth, "LLLL yyyy", { locale: ca })}
                        </h2>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-9 w-9 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Dies de la setmana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase py-2"
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
                            const dayRoutines = markedRoutineDates.get(dateStr) || [];

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    className={`
                                        relative flex flex-col items-center justify-center
                                        aspect-square min-h-[3rem] sm:min-h-[4rem]
                                        rounded-md transition-all
                                        ${!isCurrentMonth ? "text-neutral-300 dark:text-neutral-700" : "text-neutral-900 dark:text-neutral-100"}
                                        ${isSelectedDate
                                            ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-md"
                                            : isTodayDate
                                                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold border-2 border-neutral-400 dark:border-neutral-600"
                                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                        }
                                    `}
                                >
                                    <span className="text-sm sm:text-base font-medium">
                                        {format(date, "d")}
                                    </span>
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 flex-wrap justify-center max-w-full">
                                        {sleepRecord && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${getSleepQualityColor(sleepRecord.total_sleep_hours)}`} title={`Son: ${sleepRecord.total_sleep_hours}h`}></span>
                                        )}
                                        {mealRecord && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Àpats registrats"></span>
                                        )}
                                        {dayRoutines.length > 0 && (
                                            <>
                                                {dayRoutines.slice(0, 3).map((routine, idx) => {
                                                    const colors: Record<string, string> = {
                                                        athletics: "bg-blue-500",
                                                        running: "bg-green-500",
                                                        gym: "bg-purple-500",
                                                        steps: "bg-orange-500",
                                                    };
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className={`w-1.5 h-1.5 rounded-full ${colors[routine.routine_type] || "bg-neutral-400"}`}
                                                            title={`Rutina: ${routine.routine_type}`}
                                                        />
                                                    );
                                                })}
                                            </>
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

