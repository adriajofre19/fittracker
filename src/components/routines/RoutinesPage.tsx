import { useState, useEffect } from "react";
import RoutinesCalendar from "./RoutinesCalendar";
import RoutinesForm from "./RoutinesForm";
import RoutinesDisplay from "./RoutinesDisplay";
import type { Routine, RoutineType, RoutineTemplate } from "../../types";
import { format, addWeeks, startOfWeek, eachDayOfInterval, getDay, addDays, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, X, Activity, Zap, Dumbbell, Footprints, Circle, Target, FileText, Calendar, Star, Repeat } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function RoutinesPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [selectedRoutines, setSelectedRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Routine | null>(null);
    const [selectedRoutineType, setSelectedRoutineType] = useState<RoutineType>("gym");
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
    const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]); // 0 = Dilluns, 6 = Diumenge
    const [recurringStartDate, setRecurringStartDate] = useState<Date>(new Date());
    const [recurringEndDate, setRecurringEndDate] = useState<Date>(addMonths(new Date(), 3)); // 3 mesos per defecte
    const [isAssigningRecurring, setIsAssigningRecurring] = useState(false);

    useEffect(() => {
        loadRoutines();
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await fetch("/api/routine-templates");
            if (response.ok) {
                const result = await response.json();
                setTemplates(result.data || []);
            }
        } catch (error) {
            console.error("Error loading templates:", error);
        }
    };

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

    const handleAssignTemplate = async (template: RoutineTemplate, date?: Date, overwrite: boolean = false): Promise<true | "exists" | { error: string }> => {
        const targetDate = date || selectedDate;
        if (!targetDate) {
            return { error: "No s'ha seleccionat cap dia" };
        }

        try {
            const routineDate = format(targetDate, "yyyy-MM-dd");

            // Si overwrite és true, primer intentem eliminar la rutina existent
            if (overwrite) {
                const existingRoutine = routines.find(
                    (r) => r.routine_date === routineDate && r.routine_type === template.routine_type
                );
                if (existingRoutine) {
                    try {
                        const deleteResponse = await fetch(`/api/routines/${existingRoutine.id}`, {
                            method: "DELETE",
                        });
                        if (!deleteResponse.ok) {
                            console.warn(`No s'ha pogut eliminar la rutina existent per ${routineDate}`);
                        }
                    } catch (deleteError) {
                        console.warn(`Error eliminant rutina existent:`, deleteError);
                    }
                }
            }

            // Construir les dades de la rutina mantenint les dades de la plantilla
            const routineData: any = {
                routine_date: routineDate,
                routine_type: template.routine_type,
            };

            // Afegir les dades específiques del tipus de rutina
            if (template.routine_type === "athletics" && template.athletics_data) {
                routineData.athletics_data = template.athletics_data;
            }
            if (template.routine_type === "running" && template.running_data) {
                routineData.running_data = template.running_data;
            }
            if (template.routine_type === "gym" && template.gym_data) {
                routineData.gym_data = template.gym_data;
            }
            if (template.routine_type === "steps" && template.steps_count !== undefined) {
                routineData.steps_count = template.steps_count;
            }
            if (template.routine_type === "football_match" && template.football_match_data) {
                routineData.football_match_data = template.football_match_data;
            }
            if (template.routine_type === "yoyo_test" && template.yoyo_test_data) {
                routineData.yoyo_test_data = template.yoyo_test_data;
            }
            if (template.notes) {
                routineData.notes = template.notes;
            }

            console.log(`Intentant assignar plantilla a ${routineDate}:`, {
                routine_type: template.routine_type,
                has_athletics_data: !!template.athletics_data,
                has_running_data: !!template.running_data,
                has_gym_data: !!template.gym_data,
                steps_count: template.steps_count,
                has_football_data: !!template.football_match_data,
                has_yoyo_data: !!template.yoyo_test_data,
                routineData: routineData,
            });

            const response = await fetch("/api/routines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(routineData),
            });

            if (response.ok) {
                console.log(`✓ Plantilla assignada correctament a ${routineDate}`);
                return true;
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                const errorMessage = errorData.error || "Error desconegut";
                const statusCode = response.status;
                console.error(`✗ Error assigning template to ${routineDate} (${statusCode}):`, errorMessage, errorData);

                // Si l'error és que ja existeix una rutina, retornem un codi especial
                if (errorMessage.includes("duplicate") || errorMessage.includes("unique") || errorMessage.includes("already exists") || statusCode === 409) {
                    console.log(`→ Rutina ja existeix per ${routineDate}`);
                    return "exists";
                }
                return { error: errorMessage };
            }
        } catch (error: any) {
            const errorMsg = error.message || "Error desconegut";
            console.error("Error assigning template:", error);
            return { error: errorMsg };
        }
    };

    const handleOpenRecurringDialog = (template: RoutineTemplate) => {
        setSelectedTemplate(template);
        setIsTemplateDialogOpen(false);
        setIsRecurringDialogOpen(true);
        // Inicialitzar amb el dia seleccionat si n'hi ha un
        if (selectedDate) {
            const dayOfWeek = (getDay(selectedDate) + 6) % 7; // Convertir a 0=dilluns, 6=diumenge
            setSelectedWeekdays([dayOfWeek]);
            setRecurringStartDate(selectedDate);
        } else {
            setSelectedWeekdays([]);
            setRecurringStartDate(new Date());
        }
    };

    const toggleWeekday = (weekday: number) => {
        if (selectedWeekdays.includes(weekday)) {
            setSelectedWeekdays(selectedWeekdays.filter((d) => d !== weekday));
        } else {
            setSelectedWeekdays([...selectedWeekdays, weekday].sort());
        }
    };

    const getWeekdayName = (weekday: number): string => {
        const names = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];
        return names[weekday];
    };

    const getDatesForWeekdays = (startDate: Date, endDate: Date, weekdays: number[]): Date[] => {
        const dates: Date[] = [];
        const allDates = eachDayOfInterval({ start: startDate, end: endDate });

        allDates.forEach((date) => {
            const dayOfWeek = (getDay(date) + 6) % 7; // Convertir a 0=dilluns, 6=diumenge
            if (weekdays.includes(dayOfWeek)) {
                dates.push(date);
            }
        });

        return dates;
    };

    const handleAssignRecurring = async () => {
        if (!selectedTemplate || selectedWeekdays.length === 0) {
            alert("Si us plau, selecciona almenys un dia de la setmana");
            return;
        }

        setIsAssigningRecurring(true);
        try {
            const dates = getDatesForWeekdays(recurringStartDate, recurringEndDate, selectedWeekdays);

            if (dates.length === 0) {
                alert("No s'han trobat dates per assignar. Verifica les dates d'inici i final.");
                setIsAssigningRecurring(false);
                return;
            }

            console.log(`Assignant plantilla a ${dates.length} dates:`, dates.map(d => format(d, "yyyy-MM-dd")));

            let successCount = 0;
            let existsCount = 0;
            let errorCount = 0;
            const errorDetails: Array<{ date: string; error: string }> = [];

            // Assignar la plantilla a cada data
            for (const date of dates) {
                const dateStr = format(date, "yyyy-MM-dd");
                const result = await handleAssignTemplate(selectedTemplate, date, false);
                if (result === true) {
                    successCount++;
                } else if (result === "exists") {
                    existsCount++;
                } else {
                    errorCount++;
                    const errorMsg = typeof result === "object" && result.error ? result.error : "Error desconegut";
                    errorDetails.push({ date: dateStr, error: errorMsg });
                    console.error(`Error per ${dateStr}:`, errorMsg);
                }
                // Petita pausa per no sobrecarregar l'API
                await new Promise((resolve) => setTimeout(resolve, 50));
            }

            await loadRoutines();
            setIsRecurringDialogOpen(false);
            setSelectedTemplate(null);
            setSelectedWeekdays([]);

            // Construir missatge informatiu només si hi ha errors o rutines existents
            let message = "";
            if (existsCount > 0) {
                message += `${existsCount} dia${existsCount !== 1 ? 's' : ''} ja tenia${existsCount === 1 ? '' : 'n'} una rutina d'aquest tipus (no s'ha sobreescrit). `;
            }
            if (errorCount > 0) {
                message += `${errorCount} error${errorCount !== 1 ? 's' : ''}. `;
                if (errorDetails.length > 0 && errorDetails.length <= 5) {
                    const errorInfo = errorDetails.map(e => `${e.date}: ${e.error}`).join("\n");
                    message += `\n\nDies amb errors:\n${errorInfo}`;
                } else if (errorDetails.length > 5) {
                    const errorDates = errorDetails.map(e => e.date).join(", ");
                    message += `Dies amb errors: ${errorDates}. `;
                    const firstError = errorDetails[0]?.error || "Error desconegut";
                    message += `Primer error: ${firstError}`;
                }
            }

            // Només mostrar alert si hi ha errors o rutines existents
            if (message) {
                alert(message.trim());
            }
            // Si tot va bé (successCount > 0 i no hi ha errors ni rutines existents), no mostrar res
        } catch (error) {
            console.error("Error assigning recurring template:", error);
            alert("Error al assignar la plantilla de forma recurrent");
        } finally {
            setIsAssigningRecurring(false);
        }
    };

    const routineTypeOptions = [
        { type: "athletics" as RoutineType, label: "Atletisme", icon: Activity, color: "bg-blue-600" },
        { type: "running" as RoutineType, label: "Rodatge", icon: Zap, color: "bg-green-600" },
        { type: "gym" as RoutineType, label: "Gimnàs", icon: Dumbbell, color: "bg-purple-600" },
        { type: "steps" as RoutineType, label: "Passos", icon: Footprints, color: "bg-orange-600" },
        { type: "football_match" as RoutineType, label: "Partit de Futbol", icon: Circle, color: "bg-red-600" },
        { type: "yoyo_test" as RoutineType, label: "Yo-Yo Test", icon: Target, color: "bg-yellow-600" },
    ];

    const getTemplateSummary = (template: RoutineTemplate): string => {
        if (template.routine_type === "athletics" && template.athletics_data) {
            const seriesCount = template.athletics_data.series?.length || 0;
            return `${seriesCount} sèrie${seriesCount !== 1 ? 's' : ''}`;
        }
        if (template.routine_type === "running" && template.running_data) {
            return `${template.running_data.distance_km} km • ${template.running_data.duration_minutes} min`;
        }
        if (template.routine_type === "gym" && template.gym_data) {
            const exercisesCount = template.gym_data.exercises?.length || 0;
            return `${exercisesCount} exercici${exercisesCount !== 1 ? 's' : ''}`;
        }
        if (template.routine_type === "steps" && template.steps_count !== undefined) {
            return `${template.steps_count.toLocaleString()} passos`;
        }
        if (template.routine_type === "football_match" && template.football_match_data) {
            return `${template.football_match_data.total_kms} km • ${template.football_match_data.calories} cal`;
        }
        if (template.routine_type === "yoyo_test" && template.yoyo_test_data) {
            const seriesCount = template.yoyo_test_data.series?.length || 0;
            return `${seriesCount} sèrie${seriesCount !== 1 ? 's' : ''}`;
        }
        return "";
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
                        <>
                            {selectedRoutines.length > 0 && (
                                <div className="mb-4">
                                    <RoutinesDisplay
                                        routines={selectedRoutines}
                                        onEdit={handleOpenEditForm}
                                    />
                                </div>
                            )}
                            <div className="space-y-3">
                                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Assignar plantilla
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Selecciona una plantilla per assignar</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-2 mt-4">
                                            {templates.length === 0 ? (
                                                <div className="text-center py-8 text-neutral-500">
                                                    <p>No tens plantilles creades</p>
                                                    <Button
                                                        variant="link"
                                                        onClick={() => {
                                                            setIsTemplateDialogOpen(false);
                                                            window.location.href = "/routine-templates";
                                                        }}
                                                        className="mt-2"
                                                    >
                                                        Crear plantilla
                                                    </Button>
                                                </div>
                                            ) : (
                                                templates.map((template) => {
                                                    const Icon = routineTypeOptions.find(o => o.type === template.routine_type)?.icon || Activity;
                                                    const summary = getTemplateSummary(template);
                                                    return (
                                                        <div
                                                            key={template.id}
                                                            className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <div className="p-1.5 rounded-lg bg-neutral-100">
                                                                        <Icon className="h-4 w-4 text-neutral-700" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-semibold text-neutral-900">
                                                                                {template.name}
                                                                            </h4>
                                                                            {template.is_favorite && (
                                                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                            )}
                                                                        </div>
                                                                        {template.description && (
                                                                            <p className="text-sm text-neutral-500 truncate">{template.description}</p>
                                                                        )}
                                                                        {summary && (
                                                                            <p className="text-xs text-neutral-400 mt-1">{summary}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={async () => {
                                                                            if (!selectedDate) {
                                                                                alert("Si us plau, selecciona un dia al calendari");
                                                                                return;
                                                                            }
                                                                            const result = await handleAssignTemplate(template);
                                                                            if (result === true) {
                                                                                await loadRoutines();
                                                                                setIsTemplateDialogOpen(false);
                                                                                // Alert d'èxit eliminat - la rutina apareixerà automàticament al calendari
                                                                            } else if (result === "exists") {
                                                                                alert(`Ja existeix una rutina d'aquest tipus per al dia seleccionat.`);
                                                                            } else {
                                                                                const errorMsg = typeof result === "object" && result.error ? result.error : "Error desconegut";
                                                                                alert(`Error al assignar la plantilla: ${errorMsg}`);
                                                                            }
                                                                        }}
                                                                        className="gap-2"
                                                                    >
                                                                        <Calendar className="h-4 w-4" />
                                                                        Un dia
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleOpenRecurringDialog(template)}
                                                                        className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                                                                    >
                                                                        <Repeat className="h-4 w-4" />
                                                                        Recurrent
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Diàleg per assignació recurrent */}
                                <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Assignar plantilla de forma recurrent</DialogTitle>
                                        </DialogHeader>
                                        {selectedTemplate && (
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                        Plantilla: {selectedTemplate.name}
                                                    </label>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                        Dies de la setmana *
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
                                                            <button
                                                                key={weekday}
                                                                type="button"
                                                                onClick={() => toggleWeekday(weekday)}
                                                                className={`px-3 py-2 rounded-md text-sm border transition-colors ${selectedWeekdays.includes(weekday)
                                                                    ? "bg-blue-600 text-white border-blue-600"
                                                                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                                                                    }`}
                                                            >
                                                                {getWeekdayName(weekday)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                            Data d'inici *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={format(recurringStartDate, "yyyy-MM-dd")}
                                                            onChange={(e) => setRecurringStartDate(new Date(e.target.value))}
                                                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                            Data final *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={format(recurringEndDate, "yyyy-MM-dd")}
                                                            onChange={(e) => setRecurringEndDate(new Date(e.target.value))}
                                                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {selectedWeekdays.length > 0 && (
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                        <p className="text-sm text-blue-900">
                                                            S'assignarà la plantilla a{" "}
                                                            <strong>
                                                                {getDatesForWeekdays(recurringStartDate, recurringEndDate, selectedWeekdays).length} dia
                                                                {getDatesForWeekdays(recurringStartDate, recurringEndDate, selectedWeekdays).length !== 1 ? 's' : ''}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        onClick={handleAssignRecurring}
                                                        disabled={selectedWeekdays.length === 0 || isAssigningRecurring}
                                                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        {isAssigningRecurring ? "Assignant..." : "Assignar"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsRecurringDialogOpen(false);
                                                            setSelectedTemplate(null);
                                                            setSelectedWeekdays([]);
                                                        }}
                                                    >
                                                        Cancel·lar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        </>
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
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

