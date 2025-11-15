import { useState, useEffect } from "react";
import MealsCalendar from "./MealsCalendar";
import MealsForm from "./MealsForm";
import MealsDisplay from "./MealsDisplay";
import type { Meal } from "../../types";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function MealsPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<Meal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Meal | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        loadMeals();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const record = meals.find((m) => m.meal_date === dateStr);
            setSelectedRecord(record || null);
        }
    }, [selectedDate, meals]);

    const loadMeals = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/meals?limit=365");
            if (response.ok) {
                const result = await response.json();
                setMeals(result.data || []);
            }
        } catch (error) {
            console.error("Error loading meals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (recordData: Partial<Meal>) => {
        try {
            const url = editingRecord
                ? `/api/meals/${editingRecord.id}`
                : "/api/meals";
            const method = editingRecord ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(recordData),
            });

            if (response.ok) {
                await loadMeals();
                setIsModalOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error saving meal record:", error);
            alert("Error al guardar el registre");
        }
    };

    const handleOpenCreateModal = () => {
        if (selectedDate) {
            setEditingRecord(null);
            setIsModalOpen(true);
        }
    };

    const handleOpenEditModal = (record: Meal) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/meals/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await loadMeals();
                setSelectedRecord(null);
                setIsModalOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error deleting meal record:", error);
            alert("Error al eliminar el registre");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-neutral-600 dark:text-neutral-400">Carregant...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div className="text-center sm:text-left space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    Registre d'Àpats
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                    Selecciona un dia al calendari per veure o afegir informació d'àpats
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Calendari */}
                <div className="flex flex-col h-full">
                    <MealsCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        meals={meals}
                    />
                </div>

                {/* Visualització o botó per crear */}
                <div className="flex flex-col h-full">
                    {selectedDate ? (
                        selectedRecord ? (
                            <MealsDisplay
                                record={selectedRecord}
                                onEdit={() => handleOpenEditModal(selectedRecord)}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                                <div className="space-y-4 px-4">
                                    <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                        <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            No hi ha registre d'àpats per aquest dia
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                                            Crea un nou registre d'àpats per començar a fer seguiment
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleOpenCreateModal}
                                        className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 gap-2 shadow-md hover:shadow-lg transition-shadow"
                                        size="lg"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Afegir registre d'àpats
                                    </Button>
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

            {/* Modal per crear/editar - Només tablet i escriptori */}
            {!isMobile && (
                <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-neutral-900 dark:text-neutral-100">
                                {editingRecord ? "Editar registre d'àpats" : "Afegir registre d'àpats"}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedDate && (
                            <MealsForm
                                date={selectedDate}
                                existingRecord={editingRecord}
                                onSave={handleSave}
                                onDelete={editingRecord ? handleDelete : undefined}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {/* Formulari normal per mòbil - Sense modal */}
            {isMobile && isModalOpen && selectedDate && (
                <div className="mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {editingRecord ? "Editar registre d'àpats" : "Afegir registre d'àpats"}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCloseModal}
                            className="h-8 w-8 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <MealsForm
                        date={selectedDate}
                        existingRecord={editingRecord}
                        onSave={handleSave}
                        onDelete={editingRecord ? handleDelete : undefined}
                    />
                </div>
            )}
        </div>
    );
}

