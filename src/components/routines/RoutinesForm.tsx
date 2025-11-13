import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Routine, RoutineType, AthleticsSeries, RunningData, GymExercise, GymSet, Exercise } from "../../types";
import { format } from "date-fns";
import { Plus, X, Trash2 } from "lucide-react";

interface RoutinesFormProps {
    date: Date;
    routineType: RoutineType;
    existingRecord?: Routine | null;
    onSave: (record: Partial<Routine>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export default function RoutinesForm({
    date,
    routineType,
    existingRecord,
    onSave,
    onDelete,
}: RoutinesFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState("");

    // Athletics state
    const [athleticsSeries, setAthleticsSeries] = useState<AthleticsSeries[]>([]);
    const [athleticsTotalDistance, setAthleticsTotalDistance] = useState("");

    // Running state
    const [runningDistance, setRunningDistance] = useState("");
    const [runningDuration, setRunningDuration] = useState("");
    const [runningPace, setRunningPace] = useState("");
    const [runningHeartRate, setRunningHeartRate] = useState("");

    // Gym state
    const [gymExercises, setGymExercises] = useState<GymExercise[]>([]);
    const [gymDuration, setGymDuration] = useState("");
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);

    // Steps state
    const [stepsCount, setStepsCount] = useState("");

    useEffect(() => {
        // Carregar exercicis disponibles per gimnàs
        if (routineType === "gym") {
            fetch("/api/exercises?category=strength")
                .then((res) => res.json())
                .then((data) => setAvailableExercises(data.data || []))
                .catch((err) => console.error("Error loading exercises:", err));
        }

        // Carregar dades existents
        if (existingRecord) {
            setNotes(existingRecord.notes || "");

            if (existingRecord.routine_type === "athletics" && existingRecord.athletics_data) {
                setAthleticsSeries(existingRecord.athletics_data.series || []);
                setAthleticsTotalDistance(existingRecord.athletics_data.total_distance || "");
            }

            if (existingRecord.routine_type === "running" && existingRecord.running_data) {
                setRunningDistance(existingRecord.running_data.distance_km?.toString() || "");
                setRunningDuration(existingRecord.running_data.duration_minutes?.toString() || "");
                setRunningPace(existingRecord.running_data.pace_per_km || "");
                setRunningHeartRate(existingRecord.running_data.average_heart_rate?.toString() || "");
            }

            if (existingRecord.routine_type === "gym" && existingRecord.gym_data) {
                setGymExercises(existingRecord.gym_data.exercises || []);
                setGymDuration(existingRecord.gym_data.total_duration_minutes?.toString() || "");
            }

            if (existingRecord.routine_type === "steps") {
                setStepsCount(existingRecord.steps_count?.toString() || "");
            }
        } else {
            // Valors per defecte
            if (routineType === "athletics") {
                setAthleticsSeries([{ distance: "", time: "", rest: "" }]);
            }
            if (routineType === "gym") {
                setGymExercises([]);
            }
        }
    }, [existingRecord, routineType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const routineDate = format(date, "yyyy-MM-dd");
            const routineData: Partial<Routine> = {
                routine_date: routineDate,
                routine_type: routineType,
                notes: notes || undefined,
            };

            if (routineType === "athletics") {
                routineData.athletics_data = {
                    series: athleticsSeries.filter((s) => s.distance && s.time),
                    total_distance: athleticsTotalDistance || undefined,
                    notes: notes || undefined,
                };
            }

            if (routineType === "running") {
                routineData.running_data = {
                    distance_km: parseFloat(runningDistance) || 0,
                    duration_minutes: parseInt(runningDuration) || 0,
                    pace_per_km: runningPace || "",
                    average_heart_rate: runningHeartRate ? parseInt(runningHeartRate) : undefined,
                    notes: notes || undefined,
                };
            }

            if (routineType === "gym") {
                routineData.gym_data = {
                    exercises: gymExercises.filter((e) => e.exercise_id && e.sets.length > 0),
                    total_duration_minutes: gymDuration ? parseInt(gymDuration) : undefined,
                    notes: notes || undefined,
                };
            }

            if (routineType === "steps") {
                routineData.steps_count = parseInt(stepsCount) || 0;
            }

            await onSave(routineData);
        } catch (error) {
            console.error("Error saving routine:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingRecord || !onDelete) return;
        
        if (confirm("Estàs segur que vols eliminar aquesta rutina?")) {
            await onDelete(existingRecord.id);
        }
    };

    // Athletics handlers
    const addAthleticsSeries = () => {
        setAthleticsSeries([...athleticsSeries, { distance: "", time: "", rest: "" }]);
    };

    const removeAthleticsSeries = (index: number) => {
        setAthleticsSeries(athleticsSeries.filter((_, i) => i !== index));
    };

    const updateAthleticsSeries = (index: number, field: keyof AthleticsSeries, value: string) => {
        const updated = [...athleticsSeries];
        updated[index] = { ...updated[index], [field]: value };
        setAthleticsSeries(updated);
    };

    // Gym handlers
    const addGymExercise = (exercise: Exercise) => {
        setGymExercises([
            ...gymExercises,
            {
                exercise_id: exercise.id,
                exercise_name: exercise.name,
                sets: [{ reps: 0, weight_kg: undefined, rest_seconds: undefined }],
            },
        ]);
        setShowExerciseSelector(false);
        setExerciseSearch("");
    };

    const removeGymExercise = (index: number) => {
        setGymExercises(gymExercises.filter((_, i) => i !== index));
    };

    const addGymSet = (exerciseIndex: number) => {
        const updated = [...gymExercises];
        updated[exerciseIndex].sets.push({ reps: 0, weight_kg: undefined, rest_seconds: undefined });
        setGymExercises(updated);
    };

    const removeGymSet = (exerciseIndex: number, setIndex: number) => {
        const updated = [...gymExercises];
        updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
        setGymExercises(updated);
    };

    const updateGymSet = (
        exerciseIndex: number,
        setIndex: number,
        field: keyof GymSet,
        value: number | string | undefined
    ) => {
        const updated = [...gymExercises];
        updated[exerciseIndex].sets[setIndex] = {
            ...updated[exerciseIndex].sets[setIndex],
            [field]: value === "" ? undefined : value,
        };
        setGymExercises(updated);
    };

    const filteredExercises = availableExercises.filter((ex) =>
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Athletics Form */}
            {routineType === "athletics" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Sèries d'atletisme
                        </label>
                        {athleticsSeries.map((serie, index) => (
                            <div key={index} className="mb-3 p-3 border border-neutral-200 rounded-lg space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-neutral-700">Sèrie {index + 1}</span>
                                    {athleticsSeries.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeAthleticsSeries(index)}
                                            className="h-6 w-6 text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs text-neutral-600 mb-1">Distància</label>
                                        <input
                                            type="text"
                                            value={serie.distance}
                                            onChange={(e) => updateAthleticsSeries(index, "distance", e.target.value)}
                                            placeholder="100m"
                                            className="w-full px-2 py-1.5 text-sm bg-white border border-neutral-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-600 mb-1">Temps</label>
                                        <input
                                            type="text"
                                            value={serie.time}
                                            onChange={(e) => updateAthleticsSeries(index, "time", e.target.value)}
                                            placeholder="12.5s"
                                            className="w-full px-2 py-1.5 text-sm bg-white border border-neutral-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-600 mb-1">Descans</label>
                                        <input
                                            type="text"
                                            value={serie.rest}
                                            onChange={(e) => updateAthleticsSeries(index, "rest", e.target.value)}
                                            placeholder="2min"
                                            className="w-full px-2 py-1.5 text-sm bg-white border border-neutral-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addAthleticsSeries}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Afegir sèrie
                        </Button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Distància total (opcional)
                        </label>
                        <input
                            type="text"
                            value={athleticsTotalDistance}
                            onChange={(e) => setAthleticsTotalDistance(e.target.value)}
                            placeholder="2.5km"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                        />
                    </div>
                </div>
            )}

            {/* Running Form */}
            {routineType === "running" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Distància (km)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={runningDistance}
                                onChange={(e) => setRunningDistance(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Durada (min)
                            </label>
                            <input
                                type="number"
                                value={runningDuration}
                                onChange={(e) => setRunningDuration(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Ritme per km
                            </label>
                            <input
                                type="text"
                                value={runningPace}
                                onChange={(e) => setRunningPace(e.target.value)}
                                placeholder="5:00"
                                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Pulso mitjà (bpm)
                            </label>
                            <input
                                type="number"
                                value={runningHeartRate}
                                onChange={(e) => setRunningHeartRate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Gym Form */}
            {routineType === "gym" && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-neutral-900 mb-4">
                            Exercicis
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {gymExercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-base text-neutral-900">
                                        {exercise.exercise_name || `Exercici ${exerciseIndex + 1}`}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeGymExercise(exerciseIndex)}
                                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                {exercise.sets.map((set, setIndex) => (
                                    <div key={setIndex} className="flex items-center gap-2 p-2 bg-white rounded-md border border-neutral-200">
                                        <span className="text-sm font-medium text-neutral-700 w-16">Sèrie {setIndex + 1}:</span>
                                        <input
                                            type="number"
                                            placeholder="Reps"
                                            value={set.reps || ""}
                                            onChange={(e) =>
                                                updateGymSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value))
                                            }
                                            className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            step="0.5"
                                            placeholder="Kg"
                                            value={set.weight_kg || ""}
                                            onChange={(e) =>
                                                updateGymSet(
                                                    exerciseIndex,
                                                    setIndex,
                                                    "weight_kg",
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            className="w-24 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Descans (s)"
                                            value={set.rest_seconds || ""}
                                            onChange={(e) =>
                                                updateGymSet(
                                                    exerciseIndex,
                                                    setIndex,
                                                    "rest_seconds",
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="w-28 px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />
                                        {exercise.sets.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeGymSet(exerciseIndex, setIndex)}
                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addGymSet(exerciseIndex)}
                                    className="mt-3 w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Afegir sèrie
                                </Button>
                            </div>
                        ))}
                        </div>
                        <div className="mt-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cercar exercici..."
                                    value={exerciseSearch}
                                    onChange={(e) => {
                                        setExerciseSearch(e.target.value);
                                        setShowExerciseSelector(true);
                                    }}
                                    onFocus={() => setShowExerciseSelector(true)}
                                    className="w-full px-4 py-3 bg-white border-2 border-neutral-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {showExerciseSelector && filteredExercises.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-neutral-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                        {filteredExercises.slice(0, 20).map((exercise) => (
                                            <button
                                                key={exercise.id}
                                                type="button"
                                                onClick={() => addGymExercise(exercise)}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b border-neutral-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium text-neutral-900">{exercise.name}</div>
                                                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {exercise.muscle_groups.join(", ")}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowExerciseSelector(!showExerciseSelector);
                                    setExerciseSearch("");
                                }}
                                className="w-full mt-3 py-3 text-base"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Afegir exercici
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Durada total (min) (opcional)
                        </label>
                        <input
                            type="number"
                            value={gymDuration}
                            onChange={(e) => setGymDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                        />
                    </div>
                </div>
            )}

            {/* Steps Form */}
            {routineType === "steps" && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nombre de passos
                    </label>
                    <input
                        type="number"
                        value={stepsCount}
                        onChange={(e) => setStepsCount(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md"
                    />
                </div>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Notes (opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md resize-none"
                    placeholder="Afegeix notes sobre la rutina..."
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                    {isSubmitting ? "Desant..." : existingRecord ? "Actualitzar" : "Guardar"}
                </Button>
                {existingRecord && onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </form>
    );
}

