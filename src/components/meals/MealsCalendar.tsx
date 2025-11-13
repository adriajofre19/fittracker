import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meal } from "../../types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ca } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MealsCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    meals: Meal[];
}

const weekDays = ["DL", "DT", "DM", "DJ", "DV", "DS", "DG"];

export default function MealsCalendar({
    selectedDate,
    onDateSelect,
    meals,
}: MealsCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [markedDates, setMarkedDates] = useState<Map<string, Meal>>(new Map());

    useEffect(() => {
        const datesMap = new Map<string, Meal>();
        meals.forEach((meal) => {
            datesMap.set(meal.meal_date, meal);
        });
        setMarkedDates(datesMap);
    }, [meals]);

    const hasMeal = (date: Date): boolean => {
        const dateStr = format(date, "yyyy-MM-dd");
        return markedDates.has(dateStr);
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
                            const hasMealRecord = hasMeal(date);

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
                                    {hasMealRecord && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

