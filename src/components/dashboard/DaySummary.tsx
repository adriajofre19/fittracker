import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SleepRecord, Meal, Routine } from "../../types";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Moon, UtensilsCrossed, Droplet, Activity, Zap, Dumbbell, Footprints, Download, Circle, Target, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DaySummaryProps {
    date: Date;
    sleepRecord?: SleepRecord | null;
    mealRecord?: Meal | null;
    routines?: Routine[];
}

const routineTypeLabels = {
    athletics: "Atletisme",
    running: "Rodatge",
    gym: "Gimnàs",
    steps: "Passos",
    football_match: "Partit de Futbol",
    yoyo_test: "Yo-Yo Test",
};

const routineTypeIcons = {
    athletics: Activity,
    running: Zap,
    gym: Dumbbell,
    steps: Footprints,
    football_match: Circle,
    yoyo_test: Target,
};

const routineTypeColors = {
    athletics: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    running: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    gym: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    steps: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
    football_match: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    yoyo_test: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
};

export default function DaySummary({ date, sleepRecord, mealRecord, routines = [] }: DaySummaryProps) {
    const dateStr = format(date, "yyyy-MM-dd");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

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

    const exportToJSON = () => {
        const exportData = {
            date: dateStr,
            date_formatted: format(date, "EEEE, d MMMM yyyy", { locale: ca }),
            sleep: sleepRecord ? {
                total_sleep_hours: sleepRecord.total_sleep_hours,
                bedtime: sleepRecord.bedtime,
                wake_time: sleepRecord.wake_time,
                sleep_phases: sleepRecord.sleep_phases,
                notes: sleepRecord.notes,
            } : null,
            meals: mealRecord ? {
                breakfast: mealRecord.breakfast,
                lunch: mealRecord.lunch,
                snack: mealRecord.snack,
                dinner: mealRecord.dinner,
                water_liters: mealRecord.water_liters,
                totals: mealTotals,
                notes: mealRecord.notes,
            } : null,
            routines: routines.map((routine) => {
                const routineData: any = {
                    type: routine.routine_type,
                    notes: routine.notes,
                };

                if (routine.routine_type === "athletics" && routine.athletics_data) {
                    routineData.data = routine.athletics_data;
                } else if (routine.routine_type === "running" && routine.running_data) {
                    routineData.data = routine.running_data;
                } else if (routine.routine_type === "gym" && routine.gym_data) {
                    routineData.data = routine.gym_data;
                } else if (routine.routine_type === "steps") {
                    routineData.steps_count = routine.steps_count;
                } else if (routine.routine_type === "football_match" && routine.football_match_data) {
                    routineData.data = routine.football_match_data;
                } else if (routine.routine_type === "yoyo_test" && routine.yoyo_test_data) {
                    routineData.data = routine.yoyo_test_data;
                }

                return routineData;
            }),
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `resum-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const analyzeDay = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysis(null);

        try {
            // Preparar les dades del dia (mateixa estructura que l'exportació)
            const dayData = {
                date: dateStr,
                date_formatted: format(date, "EEEE, d MMMM yyyy", { locale: ca }),
                sleep: sleepRecord ? {
                    total_sleep_hours: sleepRecord.total_sleep_hours,
                    bedtime: sleepRecord.bedtime,
                    wake_time: sleepRecord.wake_time,
                    sleep_phases: sleepRecord.sleep_phases,
                    notes: sleepRecord.notes,
                } : null,
                meals: mealRecord ? {
                    breakfast: mealRecord.breakfast,
                    lunch: mealRecord.lunch,
                    snack: mealRecord.snack,
                    dinner: mealRecord.dinner,
                    water_liters: mealRecord.water_liters,
                    totals: mealTotals,
                    notes: mealRecord.notes,
                } : null,
                routines: routines.map((routine) => {
                    const routineData: any = {
                        type: routine.routine_type,
                        notes: routine.notes,
                    };

                    if (routine.routine_type === "athletics" && routine.athletics_data) {
                        routineData.data = routine.athletics_data;
                    } else if (routine.routine_type === "running" && routine.running_data) {
                        routineData.data = routine.running_data;
                    } else if (routine.routine_type === "gym" && routine.gym_data) {
                        routineData.data = routine.gym_data;
                    } else if (routine.routine_type === "steps") {
                        routineData.steps_count = routine.steps_count;
                    } else if (routine.routine_type === "football_match" && routine.football_match_data) {
                        routineData.data = routine.football_match_data;
                    } else if (routine.routine_type === "yoyo_test" && routine.yoyo_test_data) {
                        routineData.data = routine.yoyo_test_data;
                    }

                    return routineData;
                }),
            };

            const response = await fetch("/api/analyze-day", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ dayData }),
            });

            const result = await response.json();

            if (!response.ok) {
                setAnalysisError(result.error || "Error al analitzar el dia");
            } else {
                setAnalysis(result.analysis);
            }
        } catch (error: any) {
            setAnalysisError(error.message || "Error al connectar amb el servidor");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                    {format(date, "EEEE, d MMMM yyyy", { locale: ca })}
                </h2>
                <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToJSON}
                        className="gap-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                        <Download className="h-4 w-4" />
                        Exportar a JSON
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={analyzeDay}
                        disabled={isAnalyzing}
                        className="gap-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analitzant...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Analitzar el dia amb IA
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Mostrar anàlisi de la IA */}
            {analysis && (
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Anàlisi del dia amb IA</h3>
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed space-y-4">
                                {analysis.split(/\n(?=##|✅|❌|💡|⭐)/).map((section, idx) => {
                                    if (!section.trim()) return null;

                                    // Detectar tipus de secció
                                    const isTitle = section.startsWith('##');
                                    const isGood = section.includes('✅') || section.includes('El que has fet bé');
                                    const isBad = section.includes('❌') || section.includes('El que has fet malament');
                                    const isRecommendations = section.includes('💡') || section.includes('Recomanacions');
                                    const isScore = section.includes('⭐') || section.includes('Puntuació');

                                    if (isTitle) {
                                        return (
                                            <div key={idx} className="border-b border-purple-200 dark:border-purple-800 pb-2 mb-3">
                                                <h4 className="text-base font-bold text-purple-900 dark:text-purple-100">{section.replace(/^##\s*/, '')}</h4>
                                            </div>
                                        );
                                    }

                                    if (isGood) {
                                        return (
                                            <div key={idx} className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 dark:border-green-600 p-4 rounded-r">
                                                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                                                    <span className="text-xl">✅</span> El que has fet bé
                                                </h4>
                                                <div className="text-green-800 dark:text-green-200 space-y-1">
                                                    {section.split('\n').filter(l => l.trim() && !l.includes('✅')).map((line, lidx) => (
                                                        <p key={lidx} className="text-sm">• {line.replace(/^[-•]\s*/, '').trim()}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isBad) {
                                        return (
                                            <div key={idx} className="bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500 dark:border-orange-600 p-4 rounded-r">
                                                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                                                    <span className="text-xl">❌</span> El que has fet malament o millorable
                                                </h4>
                                                <div className="text-orange-800 dark:text-orange-200 space-y-1">
                                                    {section.split('\n').filter(l => l.trim() && !l.includes('❌')).map((line, lidx) => (
                                                        <p key={lidx} className="text-sm">• {line.replace(/^[-•]\s*/, '').trim()}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isRecommendations) {
                                        return (
                                            <div key={idx} className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 dark:border-blue-600 p-4 rounded-r">
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                                    <span className="text-xl">💡</span> Recomanacions per millorar
                                                </h4>
                                                <div className="text-blue-800 dark:text-blue-200 space-y-1">
                                                    {section.split('\n').filter(l => l.trim() && !l.includes('💡')).map((line, lidx) => (
                                                        <p key={lidx} className="text-sm">• {line.replace(/^[-•]\s*/, '').trim()}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isScore) {
                                        return (
                                            <div key={idx} className="bg-purple-100 dark:bg-purple-950 border-2 border-purple-300 dark:border-purple-700 p-4 rounded-lg">
                                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                                                    <span className="text-xl">⭐</span> Puntuació del dia
                                                </h4>
                                                <div className="text-purple-800 dark:text-purple-200">
                                                    {section.split('\n').filter(l => l.trim() && !l.includes('⭐')).map((line, lidx) => {
                                                        if (line.includes('Puntuació:') || line.includes('/10')) {
                                                            return (
                                                                <p key={lidx} className="text-lg font-bold mb-2">{line}</p>
                                                            );
                                                        }
                                                        if (line.includes('Justificació:')) {
                                                            return (
                                                                <div key={lidx}>
                                                                    <p className="font-semibold mb-1">{line}</p>
                                                                </div>
                                                            );
                                                        }
                                                        return <p key={lidx} className="text-sm">{line}</p>;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Secció normal
                                    return (
                                        <div key={idx} className="text-neutral-700 dark:text-neutral-300">
                                            {section.split('\n').map((line, lidx) => (
                                                <p key={lidx} className={lidx === 0 ? "font-semibold text-neutral-900 dark:text-neutral-100 mb-1" : "mb-1"}>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnalysis(null)}
                            className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                            Tancar anàlisi
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Mostrar error si n'hi ha */}
            {analysisError && (
                <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="text-red-800 dark:text-red-200">
                            <p className="font-semibold mb-2">Error al analitzar el dia:</p>
                            <p className="text-sm">{analysisError}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnalysisError(null)}
                            className="mt-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                            Tancar
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Resum de Son */}
            <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        Son
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sleepRecord ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Hores de son</span>
                                <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                    {sleepRecord.total_sleep_hours.toFixed(1)} h
                                </span>
                            </div>
                            {sleepRecord.sleep_phases && sleepRecord.sleep_phases.length > 0 && (
                                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                                    {sleepRecord.sleep_phases.map((phase, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-600 dark:text-neutral-400 capitalize">
                                                {phase.phase === "deep" ? "Profund" :
                                                    phase.phase === "light" ? "Lleuger" :
                                                        phase.phase === "rem" ? "MOR" : "Despert"}
                                            </span>
                                            <span className="text-neutral-900 dark:text-neutral-100 font-medium">
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
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">No hi ha registre de son</p>
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
            <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5" />
                        Àpats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mealRecord ? (
                        <div className="space-y-3">
                            {mealTotals && mealTotals.totalCalories > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Total calories</span>
                                    <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                        {mealTotals.totalCalories.toFixed(0)} kcal
                                    </span>
                                </div>
                            )}
                            {mealTotals && (mealTotals.totalProtein > 0 || mealTotals.totalCarbs > 0 || mealTotals.totalFat > 0) && (
                                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-3 gap-2 text-xs">
                                    {mealTotals.totalProtein > 0 && (
                                        <div>
                                            <span className="text-neutral-500 dark:text-neutral-400">Proteïnes</span>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{mealTotals.totalProtein.toFixed(1)}g</p>
                                        </div>
                                    )}
                                    {mealTotals.totalCarbs > 0 && (
                                        <div>
                                            <span className="text-neutral-500 dark:text-neutral-400">Carbohidrats</span>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{mealTotals.totalCarbs.toFixed(1)}g</p>
                                        </div>
                                    )}
                                    {mealTotals.totalFat > 0 && (
                                        <div>
                                            <span className="text-neutral-500 dark:text-neutral-400">Greixos</span>
                                            <p className="font-medium text-neutral-900 dark:text-neutral-100">{mealTotals.totalFat.toFixed(1)}g</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {mealRecord.water_liters && mealRecord.water_liters > 0 && (
                                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Aigua beguda</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
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
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">No hi ha registre d'àpats</p>
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

            {/* Resum de Rutines */}
            <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Rutines d'Entrenament
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {routines.length > 0 ? (
                        <div className="space-y-3">
                            {routines.map((routine) => {
                                const Icon = routineTypeIcons[routine.routine_type];
                                return (
                                    <div key={routine.id} className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {routineTypeLabels[routine.routine_type]}
                                                </span>
                                            </div>
                                            <Badge className={routineTypeColors[routine.routine_type]}>
                                                {routine.routine_type}
                                            </Badge>
                                        </div>
                                        {routine.routine_type === "athletics" && routine.athletics_data && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.athletics_data.series?.length || 0} sèries
                                            </div>
                                        )}
                                        {routine.routine_type === "running" && routine.running_data && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.running_data.distance_km} km en {routine.running_data.duration_minutes} min
                                            </div>
                                        )}
                                        {routine.routine_type === "gym" && routine.gym_data && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.gym_data.exercises?.length || 0} exercicis
                                            </div>
                                        )}
                                        {routine.routine_type === "steps" && routine.steps_count !== undefined && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.steps_count.toLocaleString()} passos
                                            </div>
                                        )}
                                        {routine.routine_type === "football_match" && routine.football_match_data && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.football_match_data.total_kms} km • {routine.football_match_data.calories} cal
                                            </div>
                                        )}
                                        {routine.routine_type === "yoyo_test" && routine.yoyo_test_data && (
                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {routine.yoyo_test_data.series?.length || 0} sèrie{routine.yoyo_test_data.series?.length !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => window.location.href = `/routines`}
                                >
                                    Veure detalls
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">No hi ha rutines registrades</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.location.href = `/routines`}
                            >
                                Afegir rutina
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

