import { useState, useEffect } from "react";
import SleepCalendar from "./SleepCalendar";
import SleepForm from "./SleepForm";
import SleepDisplay from "./SleepDisplay";
import type { SleepRecord } from "../../types";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, X } from "lucide-react";

export default function SleepPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<SleepRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
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
        loadSleepRecords();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const record = sleepRecords.find((r) => r.sleep_date === dateStr);
            setSelectedRecord(record || null);
        }
    }, [selectedDate, sleepRecords]);

    const loadSleepRecords = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/sleep?limit=365");
            if (response.ok) {
                const result = await response.json();
                setSleepRecords(result.data || []);
            }
        } catch (error) {
            console.error("Error loading sleep records:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (recordData: Partial<SleepRecord>) => {
        try {
            const url = editingRecord
                ? `/api/sleep/${editingRecord.id}`
                : "/api/sleep";
            const method = editingRecord ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(recordData),
            });

            if (response.ok) {
                await loadSleepRecords();
                setIsModalOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error saving sleep record:", error);
            alert("Error al guardar el registre");
        }
    };

    const handleOpenCreateModal = () => {
        if (selectedDate) {
            setEditingRecord(null);
            setIsModalOpen(true);
        }
    };

    const handleOpenEditModal = (record: SleepRecord) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/sleep/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await loadSleepRecords();
                setSelectedRecord(null);
                setIsModalOpen(false);
                setEditingRecord(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error deleting sleep record:", error);
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
                    Registre de Son
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                    Selecciona un dia al calendari per veure o afegir informació de son
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Calendari */}
                <div className="flex flex-col h-full">
                    <SleepCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        sleepRecords={sleepRecords}
                    />
                </div>

                {/* Visualització o botó per crear */}
                <div className="flex flex-col h-full">
                    {selectedDate ? (
                        selectedRecord ? (
                            <SleepDisplay
                                record={selectedRecord}
                                onEdit={() => handleOpenEditModal(selectedRecord)}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                                <div className="space-y-4 px-4">
                                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            No hi ha registre per aquest dia
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                                            Crea un nou registre de son per començar a fer seguiment
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleOpenCreateModal}
                                        className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 gap-2 shadow-md hover:shadow-lg transition-shadow"
                                        size="lg"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Afegir registre de son
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
                                {editingRecord ? "Editar registre de son" : "Afegir registre de son"}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedDate && (
                            <SleepForm
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
                            {editingRecord ? "Editar registre de son" : "Afegir registre de son"}
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
                    <SleepForm
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
