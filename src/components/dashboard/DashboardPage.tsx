import { useState, useEffect } from "react";
import DashboardCalendar from "./DashboardCalendar";
import DaySummary from "./DaySummary";
import type { SleepRecord, Meal, Routine } from "../../types";
import { format } from "date-fns";

export default function DashboardPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [sleepResponse, mealsResponse, routinesResponse] = await Promise.all([
                fetch("/api/sleep?limit=365"),
                fetch("/api/meals?limit=365"),
                fetch("/api/routines?limit=365"),
            ]);

            if (sleepResponse.ok) {
                const sleepResult = await sleepResponse.json();
                setSleepRecords(sleepResult.data || []);
            }

            if (mealsResponse.ok) {
                const mealsResult = await mealsResponse.json();
                setMeals(mealsResult.data || []);
            }

            if (routinesResponse.ok) {
                const routinesResult = await routinesResponse.json();
                setRoutines(routinesResult.data || []);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedSleepRecord = () => {
        if (!selectedDate) return null;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        return sleepRecords.find((r) => r.sleep_date === dateStr) || null;
    };

    const getSelectedMealRecord = () => {
        if (!selectedDate) return null;
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        return meals.find((m) => m.meal_date === dateStr) || null;
    };

    const getSelectedRoutines = () => {
        if (!selectedDate) return [];
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        return routines.filter((r) => r.routine_date === dateStr);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-neutral-600">Carregant...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div className="text-center sm:text-left space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900">
                    Resum Diari
                </h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    Selecciona un dia al calendari per veure el resum complet
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Calendari */}
                <div className="flex flex-col h-full">
                    <DashboardCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        sleepRecords={sleepRecords}
                        meals={meals}
                        routines={routines}
                    />
                </div>

                {/* Resum del dia */}
                <div className="flex flex-col h-full">
                    {selectedDate ? (
                        <DaySummary
                            date={selectedDate}
                            sleepRecord={getSelectedSleepRecord()}
                            mealRecord={getSelectedMealRecord()}
                            routines={getSelectedRoutines()}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-center py-12 sm:py-16 bg-white border border-neutral-200 rounded-lg shadow-sm">
                            <div className="px-4">
                                <p className="text-base sm:text-lg text-neutral-500">
                                    Selecciona un dia al calendari
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

