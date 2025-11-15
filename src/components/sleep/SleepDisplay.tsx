import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SleepRecord } from "../../types";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Moon, Sun, Clock, Edit } from "lucide-react";

interface SleepDisplayProps {
    record: SleepRecord;
    onEdit?: () => void;
}

export default function SleepDisplay({ record, onEdit }: SleepDisplayProps) {
    const bedtime = new Date(record.bedtime);
    const wakeTime = new Date(record.wake_time);

    const decimalToHoursMinutes = (decimal: number): { hours: number; minutes: number } => {
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return { hours, minutes };
    };

    const { hours: totalHours, minutes: totalMinutes } = decimalToHoursMinutes(
        record.total_sleep_hours
    );

    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case "deep":
                return "bg-blue-600 dark:bg-blue-700 text-white";
            case "rem":
                return "bg-purple-600 dark:bg-purple-700 text-white";
            case "light":
                return "bg-green-600 dark:bg-green-700 text-white";
            case "awake":
                return "bg-yellow-600 dark:bg-yellow-700 text-white";
            default:
                return "bg-neutral-600 dark:bg-neutral-700 text-white";
        }
    };

    const getPhaseLabel = (phase: string) => {
        switch (phase) {
            case "deep":
                return "Profundo";
            case "rem":
                return "MOR";
            case "light":
                return "Ligero";
            case "awake":
                return "Despierto";
            default:
                return phase;
        }
    };

    return (
        <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        Registre de son
                    </CardTitle>
                    {onEdit && (
                        <Button
                            onClick={onEdit}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Editar
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Anar a dormir</p>
                            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                                {format(bedtime, "HH:mm", { locale: ca })}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {format(bedtime, "dd MMM yyyy", { locale: ca })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                        <div>
                            <p className="text-sm text-neutral-600">Despertar</p>
                            <p className="text-lg font-medium text-neutral-900">
                                {format(wakeTime, "HH:mm", { locale: ca })}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {format(wakeTime, "dd MMM yyyy", { locale: ca })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <Clock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total de son</p>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {totalHours}h {totalMinutes > 0 && `${totalMinutes}min`}
                        </p>
                    </div>
                </div>

                {record.sleep_phases && record.sleep_phases.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Fases de son</p>
                        <div className="space-y-2">
                            {record.sleep_phases.map((phase, index) => {
                                const { hours, minutes } = decimalToHoursMinutes(
                                    phase.duration_minutes / 60
                                );
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-md"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full ${getPhaseColor(phase.phase)}`}
                                            />
                                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                {getPhaseLabel(phase.phase)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {hours}h {minutes > 0 && `${minutes}min`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {record.notes && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notes</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                            {record.notes}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
