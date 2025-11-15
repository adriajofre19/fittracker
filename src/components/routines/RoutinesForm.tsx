import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Routine, RoutineType, AthleticsSeries, RunningData, GymExercise, GymSet, Exercise, YoYoSeries, FootballMatchData, YoYoTestData } from "../../types";
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

    // Football match state
    const [footballKms, setFootballKms] = useState("");
    const [footballCalories, setFootballCalories] = useState("");

    // Yo-Yo Test state
    const [yoyoSeries, setYoyoSeries] = useState<YoYoSeries[]>([]);
    const [yoyoNewStartLevel, setYoyoNewStartLevel] = useState("");
    const [yoyoNewEndLevel, setYoyoNewEndLevel] = useState("");

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

            if (existingRecord.routine_type === "football_match" && existingRecord.football_match_data) {
                setFootballKms(existingRecord.football_match_data.total_kms?.toString() || "");
                setFootballCalories(existingRecord.football_match_data.calories?.toString() || "");
            }

            if (existingRecord.routine_type === "yoyo_test" && existingRecord.yoyo_test_data) {
                setYoyoSeries(existingRecord.yoyo_test_data.series || []);
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
                    exercises: gymExercises
                        .filter((e) => e.exercise_name && e.exercise_name.trim() !== "") // Filtrar per exercise_name (no només exercise_id)
                        .map((e) => ({
                            ...e,
                            // Assegurar que cada exercici té almenys un set
                            sets: e.sets && e.sets.length > 0
                                ? e.sets
                                : [{ reps: 0, weight_kg: undefined, rest_seconds: undefined }],
                        })),
                    total_duration_minutes: gymDuration ? parseInt(gymDuration) : undefined,
                    notes: notes || undefined,
                };
            }

            if (routineType === "steps") {
                routineData.steps_count = parseInt(stepsCount) || 0;
            }

            if (routineType === "football_match") {
                routineData.football_match_data = {
                    total_kms: parseFloat(footballKms) || 0,
                    calories: parseInt(footballCalories) || 0,
                    notes: notes || undefined,
                };
            }

            if (routineType === "yoyo_test") {
                routineData.yoyo_test_data = {
                    series: yoyoSeries.filter((s) => s.start_level && s.end_level),
                    notes: notes || undefined,
                };
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

    // Yo-Yo Test handlers
    const addYoyoSeries = () => {
        if (!yoyoNewStartLevel || !yoyoNewEndLevel) {
            alert("Si us plau, selecciona el nivell inicial i final");
            return;
        }

        const startIndex = yoyoLevels.indexOf(yoyoNewStartLevel);
        const endIndex = yoyoLevels.indexOf(yoyoNewEndLevel);

        if (startIndex === -1 || endIndex === -1) {
            alert("Si us plau, selecciona nivells vàlids");
            return;
        }

        if (startIndex > endIndex) {
            alert("El nivell inicial ha de ser menor o igual al nivell final");
            return;
        }

        setYoyoSeries([...yoyoSeries, {
            start_level: yoyoNewStartLevel,
            end_level: yoyoNewEndLevel,
            completed: true
        }]);
        setYoyoNewStartLevel("");
        setYoyoNewEndLevel("");
    };

    const removeYoyoSeries = (index: number) => {
        setYoyoSeries(yoyoSeries.filter((_, i) => i !== index));
    };

    const updateYoyoSeries = (index: number, field: keyof YoYoSeries, value: string | boolean) => {
        const updated = [...yoyoSeries];
        updated[index] = { ...updated[index], [field]: value };
        setYoyoSeries(updated);
    };

    // Generate Yo-Yo levels (0, 0.1, 0.2, ..., 0.8, 1, 1.1, ..., 20.8)
    const yoyoLevels = [];
    for (let i = 0; i <= 20; i++) {
        yoyoLevels.push(i.toString());
        // Afegir nivells decimals del .1 al .8 per cada número enter
        for (let j = 1; j <= 8; j++) {
            yoyoLevels.push(`${i}.${j}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Athletics Form */}
            {routineType === "athletics" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Sèries d'atletisme
                        </label>
                        {athleticsSeries.map((serie, index) => (
                            <div key={index} className="mb-3 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Sèrie {index + 1}</span>
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
                                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Distància</label>
                                        <input
                                            type="text"
                                            value={serie.distance}
                                            onChange={(e) => updateAthleticsSeries(index, "distance", e.target.value)}
                                            placeholder="100m"
                                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Temps</label>
                                        <input
                                            type="text"
                                            value={serie.time}
                                            onChange={(e) => updateAthleticsSeries(index, "time", e.target.value)}
                                            placeholder="12.5s"
                                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Descans</label>
                                        <input
                                            type="text"
                                            value={serie.rest}
                                            onChange={(e) => updateAthleticsSeries(index, "rest", e.target.value)}
                                            placeholder="2min"
                                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Distància total (opcional)
                        </label>
                        <input
                            type="text"
                            value={athleticsTotalDistance}
                            onChange={(e) => setAthleticsTotalDistance(e.target.value)}
                            placeholder="2.5km"
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                </div>
            )}

            {/* Running Form */}
            {routineType === "running" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Distància (km)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={runningDistance}
                                onChange={(e) => setRunningDistance(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Durada (min)
                            </label>
                            <input
                                type="number"
                                value={runningDuration}
                                onChange={(e) => setRunningDuration(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Ritme per km
                            </label>
                            <input
                                type="text"
                                value={runningPace}
                                onChange={(e) => setRunningPace(e.target.value)}
                                placeholder="5:00"
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Pulso mitjà (bpm)
                            </label>
                            <input
                                type="number"
                                value={runningHeartRate}
                                onChange={(e) => setRunningHeartRate(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Gym Form */}
            {routineType === "gym" && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                            Exercicis
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {gymExercises.map((exercise, exerciseIndex) => (
                                <div key={exerciseIndex} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
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
                                            <div key={setIndex} className="flex items-center gap-2 p-2 bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800">
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 w-16">Sèrie {setIndex + 1}:</span>
                                                <input
                                                    type="number"
                                                    placeholder="Reps"
                                                    value={set.reps || ""}
                                                    onChange={(e) =>
                                                        updateGymSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value))
                                                    }
                                                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg text-base text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {showExerciseSelector && filteredExercises.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                                        {filteredExercises.slice(0, 20).map((exercise) => (
                                            <button
                                                key={exercise.id}
                                                type="button"
                                                onClick={() => addGymExercise(exercise)}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950 text-sm border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{exercise.name}</div>
                                                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Durada total (min) (opcional)
                        </label>
                        <input
                            type="number"
                            value={gymDuration}
                            onChange={(e) => setGymDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
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

            {/* Football Match Form */}
            {routineType === "football_match" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Quilòmetres totals (km)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={footballKms}
                                onChange={(e) => setFootballKms(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                Calories
                            </label>
                            <input
                                type="number"
                                value={footballCalories}
                                onChange={(e) => setFootballCalories(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Yo-Yo Test Form */}
            {routineType === "yoyo_test" && (
                <div className="space-y-4">
                    {/* Afegir nova sèrie amb rang */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <label className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                            Afegir sèrie Yo-Yo Test
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Nivell inicial</label>
                                <select
                                    value={yoyoNewStartLevel}
                                    onChange={(e) => setYoyoNewStartLevel(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">Selecciona nivell inicial</option>
                                    {yoyoLevels.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Nivell final</label>
                                <select
                                    value={yoyoNewEndLevel}
                                    onChange={(e) => setYoyoNewEndLevel(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="">Selecciona nivell final</option>
                                    {yoyoLevels.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addYoyoSeries}
                            className="w-full bg-white dark:bg-neutral-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950"
                            disabled={!yoyoNewStartLevel || !yoyoNewEndLevel}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Afegir sèrie del {yoyoNewStartLevel || "?"} al {yoyoNewEndLevel || "?"}
                        </Button>
                    </div>

                    {/* Llista de sèries */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Sèries Yo-Yo Test ({yoyoSeries.length} sèrie{yoyoSeries.length !== 1 ? 's' : ''})
                        </label>
                        {yoyoSeries.length === 0 ? (
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                No hi ha sèries afegides. Afegeix una sèrie utilitzant el formulari de dalt.
                            </div>
                        ) : (
                            yoyoSeries.map((serie, index) => (
                                <div key={index} className="mb-3 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Sèrie {index + 1}: Del {serie.start_level} al {serie.end_level}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeYoyoSeries(index)}
                                            className="h-6 w-6 text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Nivell inicial</label>
                                            <select
                                                value={serie.start_level}
                                                onChange={(e) => updateYoyoSeries(index, "start_level", e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                            >
                                                {yoyoLevels.map((level) => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Nivell final</label>
                                            <select
                                                value={serie.end_level}
                                                onChange={(e) => updateYoyoSeries(index, "end_level", e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100"
                                            >
                                                {yoyoLevels.map((level) => (
                                                    <option key={level} value={level}>
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                            <input
                                                type="checkbox"
                                                checked={serie.completed}
                                                onChange={(e) => updateYoyoSeries(index, "completed", e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                            Completada
                                        </label>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Notes (opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 resize-none"
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

