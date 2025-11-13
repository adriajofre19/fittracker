import { useState, useEffect } from "react";
import RoutinesCalendar from "./RoutinesCalendar";
import RoutinesForm from "./RoutinesForm";
import RoutinesDisplay from "./RoutinesDisplay";
import type { Routine, RoutineType } from "../../types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, X, Activity, Zap, Dumbbell, Footprints } from "lucide-react";

export default function RoutinesPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Routine | null>(null);
    const [selectedRoutineType, setSelectedRoutineType] = useState<RoutineType>("gym");

    useEffect(() => {
        loadRoutines();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const dayRoutines = routines.filter((r) => r.routine_date === dateStr);
            setSelectedRoutines(dayRoutines);
        }
    }, [selectedDate, routines]);

    const loadRoutines = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/routines?limit=365");
            if (response.ok) {
                const result = await response.json();
                setRoutines(result.data || []);
            }
        } catch (error) {
            console.error("Error loading routines:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (recordData: Partial<Routine>) => {
        try {
            const url = editingRecord
                ? `/api/routines/${editingRecord.id}`
                : "/api/routines";
            const method = editingRecord ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(recordData),
            });

            if (response.ok) {
                await loadRoutines();
                setIsFormOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error saving routine:", error);
            alert("Error al guardar la rutina");
        }
    };

    const handleOpenCreateForm = (type: RoutineType) => {
        if (selectedDate) {
            setEditingRecord(null);
            setSelectedRoutineType(type);
            setIsFormOpen(true);
        }
    };

    const handleOpenEditForm = (routine: Routine) => {
        setEditingRecord(routine);
        setSelectedRoutineType(routine.routine_type);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRecord(null);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/routines/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await loadRoutines();
                setSelectedRoutines(selectedRoutines.filter((r) => r.id !== id));
                setIsFormOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error deleting routine:", error);
            alert("Error al eliminar la rutina");
        }
    };

    const routineTypeOptions = [
        { type: "athletics" as RoutineType, label: "Atletisme", icon: Activity, color: "bg-blue-600" },
        { type: "running" as RoutineType, label: "Rodatge", icon: Zap, color: "bg-green-600" },
        { type: "gym" as RoutineType, label: "Gimnàs", icon: Dumbbell, color: "bg-purple-600" },
        { type: "steps" as RoutineType, label: "Passos", icon: Footprints, color: "bg-orange-600" },
    ];

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
                    Rutines d'Entrenament
                </h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    Selecciona un dia al calendari per veure o afegir rutines d'entrenament
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Calendari */}
                <div className="flex flex-col h-full">
                    <RoutinesCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        routines={routines}
                    />
                </div>

                {/* Visualització o botons per crear */}
                <div className="flex flex-col h-full">
                    {selectedDate ? (
                        selectedRoutines.length > 0 ? (
                            <div className="space-y-4">
                                <RoutinesDisplay
                                    routines={selectedRoutines}
                                    onEdit={handleOpenEditForm}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    {routineTypeOptions.map((option) => {
                                        const Icon = option.icon;
                                        const hasRoutine = selectedRoutines.some(
                                            (r) => r.routine_type === option.type
                                        );
                                        return (
                                            <Button
                                                key={option.type}
                                                onClick={() => handleOpenCreateForm(option.type)}
                                                className={`${option.color} text-white hover:opacity-90 gap-2`}
                                                variant="default"
                                            >
                                                <Icon className="h-4 w-4" />
                                                {hasRoutine ? "Editar" : option.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16 bg-white border border-neutral-200 rounded-lg shadow-sm">
                                <div className="space-y-4 px-4">
                                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                                        <Activity className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-neutral-700 mb-2">
                                            No hi ha rutines per aquest dia
                                        </p>
                                        <p className="text-sm text-neutral-500 mb-6">
                                            Afegeix una rutina d'entrenament per començar
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {routineTypeOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <Button
                                                    key={option.type}
                                                    onClick={() => handleOpenCreateForm(option.type)}
                                                    className={`${option.color} text-white hover:opacity-90 gap-2`}
                                                    variant="default"
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {option.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
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

            {/* Formulari normal - Sense modal */}
            {isFormOpen && selectedDate && (
                <div className="mt-6 bg-white border border-neutral-200 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="mb-4 pb-4 border-b border-neutral-200 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-neutral-900">
                            {editingRecord
                                ? `Editar rutina de ${routineTypeOptions.find((o) => o.type === selectedRoutineType)?.label}`
                                : `Afegir rutina de ${routineTypeOptions.find((o) => o.type === selectedRoutineType)?.label}`}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCloseForm}
                            className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <RoutinesForm
                        date={selectedDate}
                        routineType={selectedRoutineType}
                        existingRecord={editingRecord}
                        onSave={handleSave}
                        onDelete={editingRecord ? handleDelete : undefined}
                    />
                </div>
            )}
        </div>
    );
}

