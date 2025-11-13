import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SleepRecord, Meal } from "../../types";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Moon, UtensilsCrossed, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DaySummaryProps {
    date: Date;
    sleepRecord?: SleepRecord | null;
    mealRecord?: Meal | null;
}

export default function DaySummary({ date, sleepRecord, mealRecord }: DaySummaryProps) {
    const dateStr = format(date, "yyyy-MM-dd");

    const calculateMealTotals = (meal: Meal) => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        const meals = [meal.breakfast, meal.lunch, meal.snack, meal.dinner];
        meals.forEach((m) => {
            if (m && m.totals) {
                totalCalories += m.totals.calories || 0;
                totalProtein += m.totals.protein || 0;
                totalCarbs += m.totals.carbs || 0;
                totalFat += m.totals.fat || 0;
            }
        });

        return { totalCalories, totalProtein, totalCarbs, totalFat };
    };

    const mealTotals = mealRecord ? calculateMealTotals(mealRecord) : null;

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                    {format(date, "EEEE, d MMMM yyyy", { locale: ca })}
                </h2>
            </div>

            {/* Resum de Son */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        Son
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sleepRecord ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600">Hores de son</span>
                                <span className="text-base font-semibold text-neutral-900">
                                    {sleepRecord.total_sleep_hours.toFixed(1)} h
                                </span>
                            </div>
                            {sleepRecord.sleep_phases && sleepRecord.sleep_phases.length > 0 && (
                                <div className="pt-2 border-t border-neutral-200 space-y-2">
                                    {sleepRecord.sleep_phases.map((phase, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-600 capitalize">
                                                {phase.phase === "deep" ? "Profund" : 
                                                 phase.phase === "light" ? "Lleuger" :
                                                 phase.phase === "rem" ? "MOR" : "Despert"}
                                            </span>
                                            <span className="text-neutral-900 font-medium">
                                                {Math.floor(phase.duration_minutes / 60)}h {phase.duration_minutes % 60}m
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => window.location.href = `/sleep`}
                                >
                                    Veure detalls
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-neutral-500 mb-3">No hi ha registre de son</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.location.href = `/sleep`}
                            >
                                Afegir registre de son
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resum d'Àpats */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5" />
                        Àpats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mealRecord ? (
                        <div className="space-y-3">
                            {mealTotals && mealTotals.totalCalories > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600">Total calories</span>
                                    <span className="text-base font-semibold text-neutral-900">
                                        {mealTotals.totalCalories.toFixed(0)} kcal
                                    </span>
                                </div>
                            )}
                            {mealTotals && (mealTotals.totalProtein > 0 || mealTotals.totalCarbs > 0 || mealTotals.totalFat > 0) && (
                                <div className="pt-2 border-t border-neutral-200 grid grid-cols-3 gap-2 text-xs">
                                    {mealTotals.totalProtein > 0 && (
                                        <div>
                                            <span className="text-neutral-500">Proteïnes</span>
                                            <p className="font-medium text-neutral-900">{mealTotals.totalProtein.toFixed(1)}g</p>
                                        </div>
                                    )}
                                    {mealTotals.totalCarbs > 0 && (
                                        <div>
                                            <span className="text-neutral-500">Carbohidrats</span>
                                            <p className="font-medium text-neutral-900">{mealTotals.totalCarbs.toFixed(1)}g</p>
                                        </div>
                                    )}
                                    {mealTotals.totalFat > 0 && (
                                        <div>
                                            <span className="text-neutral-500">Greixos</span>
                                            <p className="font-medium text-neutral-900">{mealTotals.totalFat.toFixed(1)}g</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {mealRecord.water_liters && mealRecord.water_liters > 0 && (
                                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm text-neutral-600">Aigua beguda</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {mealRecord.water_liters.toFixed(1)} L
                                    </span>
                                </div>
                            )}
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => window.location.href = `/meals`}
                                >
                                    Veure detalls
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-neutral-500 mb-3">No hi ha registre d'àpats</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.location.href = `/meals`}
                            >
                                Afegir registre d'àpats
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

