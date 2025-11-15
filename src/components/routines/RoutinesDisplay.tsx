import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Routine } from "../../types";
import { format } from "date-fns";
import { Edit, Activity, Zap, Dumbbell, Footprints, ChevronDown, ChevronUp, Circle, Target } from "lucide-react";

interface RoutinesDisplayProps {
    routines: Routine[];
    onEdit: (routine: Routine) => void;
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

export default function RoutinesDisplay({ routines, onEdit }: RoutinesDisplayProps) {
    const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());

    if (routines.length === 0) {
        return null;
    }

    const toggleRoutine = (routineId: string) => {
        const newExpanded = new Set(expandedRoutines);
        if (newExpanded.has(routineId)) {
            newExpanded.delete(routineId);
        } else {
            newExpanded.add(routineId);
        }
        setExpandedRoutines(newExpanded);
    };

    const getRoutineSummary = (routine: Routine): string => {
        if (routine.routine_type === "athletics" && routine.athletics_data) {
            const seriesCount = routine.athletics_data.series?.length || 0;
            return `${seriesCount} sèrie${seriesCount !== 1 ? 's' : ''}`;
        }
        if (routine.routine_type === "running" && routine.running_data) {
            return `${routine.running_data.distance_km} km • ${routine.running_data.duration_minutes} min`;
        }
        if (routine.routine_type === "gym" && routine.gym_data) {
            const exercisesCount = routine.gym_data.exercises?.length || 0;
            return `${exercisesCount} exercici${exercisesCount !== 1 ? 's' : ''}`;
        }
        if (routine.routine_type === "steps" && routine.steps_count !== undefined) {
            return `${routine.steps_count.toLocaleString()} passos`;
        }
        if (routine.routine_type === "football_match" && routine.football_match_data) {
            return `${routine.football_match_data.total_kms} km • ${routine.football_match_data.calories} cal`;
        }
        if (routine.routine_type === "yoyo_test" && routine.yoyo_test_data) {
            const seriesCount = routine.yoyo_test_data.series?.length || 0;
            if (seriesCount === 0) return "";
            const firstSeries = routine.yoyo_test_data.series[0];
            if (seriesCount === 1) {
                return `Del ${firstSeries.start_level} al ${firstSeries.end_level}`;
            }
            return `${seriesCount} sèrie${seriesCount !== 1 ? 's' : ''}`;
        }
        return "";
    };

    return (
        <div className="space-y-2">
            {routines.map((routine) => {
                const Icon = routineTypeIcons[routine.routine_type];
                const isExpanded = expandedRoutines.has(routine.id);
                const summary = getRoutineSummary(routine);

                return (
                    <Card key={routine.id} className="border-neutral-200 shadow-sm">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => toggleRoutine(routine.id)}
                                    className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                                >
                                    <div className="p-1.5 rounded-lg bg-neutral-100">
                                        <Icon className="h-4 w-4 text-neutral-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm sm:text-base font-semibold text-neutral-900">
                                                {routineTypeLabels[routine.routine_type]}
                                            </h3>
                                            {summary && (
                                                <span className="text-xs text-neutral-500 hidden sm:inline">
                                                    • {summary}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            {format(new Date(routine.routine_date), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                                    )}
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(routine)}
                                    className="h-7 w-7 text-neutral-600 hover:text-neutral-900 ml-2"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-neutral-200">
                                    {/* Contingut segons el tipus */}
                                    {routine.routine_type === "athletics" && routine.athletics_data && (
                                        <div className="space-y-2">
                                            <div className="text-xs sm:text-sm font-medium text-neutral-700">Sèries:</div>
                                            {routine.athletics_data.series?.map((serie, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                                                    <Badge variant="outline" className="text-xs">
                                                        {serie.distance}
                                                    </Badge>
                                                    <span>{serie.time}</span>
                                                    <span className="text-neutral-400">•</span>
                                                    <span>Descans: {serie.rest}</span>
                                                </div>
                                            ))}
                                            {routine.athletics_data.total_distance && (
                                                <div className="text-xs sm:text-sm text-neutral-600 mt-2">
                                                    Distància total: {routine.athletics_data.total_distance}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {routine.routine_type === "running" && routine.running_data && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                                <div>
                                                    <span className="text-neutral-500">Distància:</span>
                                                    <span className="ml-2 font-medium text-neutral-900">
                                                        {routine.running_data.distance_km} km
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500">Durada:</span>
                                                    <span className="ml-2 font-medium text-neutral-900">
                                                        {routine.running_data.duration_minutes} min
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500">Ritme:</span>
                                                    <span className="ml-2 font-medium text-neutral-900">
                                                        {routine.running_data.pace_per_km}/km
                                                    </span>
                                                </div>
                                                {routine.running_data.average_heart_rate && (
                                                    <div>
                                                        <span className="text-neutral-500">Pulso mitjà:</span>
                                                        <span className="ml-2 font-medium text-neutral-900">
                                                            {routine.running_data.average_heart_rate} bpm
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {routine.routine_type === "gym" && routine.gym_data && (
                                        <div className="space-y-2 sm:space-y-3">
                                            {routine.gym_data.exercises?.map((exercise, idx) => (
                                                <div key={idx} className="border-l-2 border-neutral-200 pl-2 sm:pl-3">
                                                    <div className="font-medium text-neutral-900 text-xs sm:text-sm mb-1">
                                                        {exercise.exercise_name || `Exercici ${idx + 1}`}
                                                    </div>
                                                    <div className="space-y-0.5 sm:space-y-1">
                                                        {exercise.sets?.map((set, setIdx) => (
                                                            <div key={setIdx} className="text-xs text-neutral-600">
                                                                Sèrie {setIdx + 1}: {set.reps} reps
                                                                {set.weight_kg && ` × ${set.weight_kg} kg`}
                                                                {set.rest_seconds && ` (Descans: ${set.rest_seconds}s)`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {routine.gym_data.total_duration_minutes && (
                                                <div className="text-xs sm:text-sm text-neutral-600 mt-2">
                                                    Durada total: {routine.gym_data.total_duration_minutes} min
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {routine.routine_type === "steps" && routine.steps_count !== undefined && (
                                        <div className="text-lg sm:text-xl font-bold text-neutral-900">
                                            {routine.steps_count.toLocaleString()} passos
                                        </div>
                                    )}

                                    {routine.routine_type === "football_match" && routine.football_match_data && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                                <div>
                                                    <span className="text-neutral-500">Quilòmetres:</span>
                                                    <span className="ml-2 font-medium text-neutral-900">
                                                        {routine.football_match_data.total_kms} km
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-neutral-500">Calories:</span>
                                                    <span className="ml-2 font-medium text-neutral-900">
                                                        {routine.football_match_data.calories} cal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {routine.routine_type === "yoyo_test" && routine.yoyo_test_data && (
                                        <div className="space-y-2">
                                            <div className="text-xs sm:text-sm font-medium text-neutral-700">Sèries:</div>
                                            {routine.yoyo_test_data.series?.map((serie, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                                                    <Badge variant={serie.completed ? "default" : "outline"} className="text-xs">
                                                        Del {serie.start_level} al {serie.end_level}
                                                    </Badge>
                                                    {serie.completed ? (
                                                        <span className="text-green-600">✓ Completada</span>
                                                    ) : (
                                                        <span className="text-neutral-400">No completada</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {routine.notes && (
                                        <div className="mt-3 pt-3 border-t border-neutral-200">
                                            <p className="text-xs sm:text-sm text-neutral-600">{routine.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

