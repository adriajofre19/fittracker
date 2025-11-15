import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { SleepRecord, SleepPhase } from "../../types";
import { format } from "date-fns";

interface SleepFormProps {
    date: Date;
    existingRecord?: SleepRecord | null;
    onSave: (record: Partial<SleepRecord>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

interface PhaseInput {
    phase: "deep" | "light" | "rem" | "awake";
    hours: string;
    minutes: string;
}

const phaseLabels = {
    deep: "Profundo",
    light: "Ligero",
    rem: "MOR",
    awake: "Despierto",
};

export default function SleepForm({
    date,
    existingRecord,
    onSave,
    onDelete,
}: SleepFormProps) {
    const [bedtime, setBedtime] = useState("");
    const [wakeTime, setWakeTime] = useState("");
    const [totalHours, setTotalHours] = useState("");
    const [totalMinutes, setTotalMinutes] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phases, setPhases] = useState<PhaseInput[]>([]);

    // Funció per convertir hores i minuts a decimals
    const hoursMinutesToDecimal = (hours: string, minutes: string): number => {
        const h = parseFloat(hours) || 0;
        const m = parseFloat(minutes) || 0;
        return h + m / 60;
    };

    // Funció per convertir decimals a hores i minuts
    const decimalToHoursMinutes = (decimal: number): { hours: number; minutes: number } => {
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return { hours, minutes };
    };

    useEffect(() => {
        // Inicialitzar sempre les 4 fases
        const defaultPhases: PhaseInput[] = [
            { phase: "deep", hours: "0", minutes: "0" },
            { phase: "light", hours: "0", minutes: "0" },
            { phase: "rem", hours: "0", minutes: "0" },
            { phase: "awake", hours: "0", minutes: "0" },
        ];

        if (existingRecord) {
            const bedtimeDate = new Date(existingRecord.bedtime);
            const wakeTimeDate = new Date(existingRecord.wake_time);

            setBedtime(format(bedtimeDate, "yyyy-MM-dd'T'HH:mm"));
            setWakeTime(format(wakeTimeDate, "yyyy-MM-dd'T'HH:mm"));

            const { hours, minutes } = decimalToHoursMinutes(existingRecord.total_sleep_hours);
            setTotalHours(hours.toString());
            setTotalMinutes(minutes.toString());

            setNotes(existingRecord.notes || "");

            // Convertir les fases de son a format d'entrada
            if (existingRecord.sleep_phases && existingRecord.sleep_phases.length > 0) {
                // Crear un mapa de les fases existents
                const phasesMap = new Map<string, PhaseInput>();
                existingRecord.sleep_phases.forEach((phase) => {
                    const { hours, minutes } = decimalToHoursMinutes(phase.duration_minutes / 60);
                    phasesMap.set(phase.phase, {
                        phase: phase.phase,
                        hours: hours.toString(),
                        minutes: minutes.toString(),
                    });
                });

                // Omplir les fases per defecte amb les dades existents
                const convertedPhases = defaultPhases.map((defaultPhase) => {
                    return phasesMap.get(defaultPhase.phase) || defaultPhase;
                });
                setPhases(convertedPhases);
            } else {
                setPhases(defaultPhases);
            }
        } else {
            const dateStr = format(date, "yyyy-MM-dd");
            setBedtime(`${dateStr}T22:00`);
            setWakeTime(`${format(new Date(date.getTime() + 86400000), "yyyy-MM-dd")}T07:00`);
            setTotalHours("9");
            setTotalMinutes("0");
            setNotes("");
            setPhases(defaultPhases);
        }
    }, [existingRecord, date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const sleepDate = format(date, "yyyy-MM-dd");
            const bedtimeISO = new Date(bedtime).toISOString();
            const wakeTimeISO = new Date(wakeTime).toISOString();

            // Calcular total de son en decimals
            const totalSleepDecimal = hoursMinutesToDecimal(totalHours, totalMinutes);

            // Convertir les fases a format API
            const sleepPhases: SleepPhase[] = phases.map((phase) => {
                const durationDecimal = hoursMinutesToDecimal(phase.hours, phase.minutes);
                const startTime = new Date(bedtime);
                return {
                    phase: phase.phase,
                    start_time: startTime.toISOString(),
                    end_time: new Date(startTime.getTime() + durationDecimal * 3600000).toISOString(),
                    duration_minutes: Math.round(durationDecimal * 60),
                };
            });

            await onSave({
                sleep_date: sleepDate,
                bedtime: bedtimeISO,
                wake_time: wakeTimeISO,
                total_sleep_hours: totalSleepDecimal,
                sleep_phases: sleepPhases,
                notes: notes || undefined,
            });
        } catch (error) {
            console.error("Error saving sleep record:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingRecord || !onDelete) return;

        if (confirm("Estàs segur que vols eliminar aquest registre de son?")) {
            await onDelete(existingRecord.id);
        }
    };

    const updatePhase = (phaseType: "deep" | "light" | "rem" | "awake", field: "hours" | "minutes", value: string) => {
        const updated = phases.map((phase) => {
            if (phase.phase === phaseType) {
                return { ...phase, [field]: value };
            }
            return phase;
        });
        setPhases(updated);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label
                        htmlFor="bedtime"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                        Hora d'anar a dormir
                    </label>
                    <input
                        type="datetime-local"
                        id="bedtime"
                        value={bedtime}
                        onChange={(e) => setBedtime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label
                        htmlFor="wakeTime"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
                    >
                        Hora de despertar
                    </label>
                    <input
                        type="datetime-local"
                        id="wakeTime"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Hores totals de son
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="totalHours" className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                            Hores
                        </label>
                        <input
                            type="number"
                            id="totalHours"
                            min="0"
                            max="24"
                            value={totalHours}
                            onChange={(e) => setTotalHours(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="totalMinutes" className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                            Minuts
                        </label>
                        <input
                            type="number"
                            id="totalMinutes"
                            min="0"
                            max="59"
                            value={totalMinutes}
                            onChange={(e) => setTotalMinutes(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Fases de son
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {phases.map((phase) => (
                        <div
                            key={phase.phase}
                            className="p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-md"
                        >
                            <div className="mb-2">
                                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {phaseLabels[phase.phase]}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                        Hores
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={phase.hours}
                                        onChange={(e) =>
                                            updatePhase(phase.phase, "hours", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                        Minuts
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={phase.minutes}
                                        onChange={(e) =>
                                            updatePhase(phase.phase, "minutes", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                    Notes (opcional)
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Afegeix notes sobre el teu son..."
                />
            </div>

            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                    {isSubmitting ? "Desant..." : existingRecord ? "Actualitzar" : "Guardar"}
                </Button>
                {existingRecord && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800"
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </form>
    );
}
