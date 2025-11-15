import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoutineTemplateForm from "./RoutineTemplateForm";
import type { RoutineTemplate, RoutineType } from "../../types";
import { Plus, X, Edit, Trash2, Star, Activity, Zap, Dumbbell, Footprints, Circle, Target, Calendar } from "lucide-react";

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
    athletics: "bg-blue-100 text-blue-700",
    running: "bg-green-100 text-green-700",
    gym: "bg-purple-100 text-purple-700",
    steps: "bg-orange-100 text-orange-700",
    football_match: "bg-red-100 text-red-700",
    yoyo_test: "bg-yellow-100 text-yellow-700",
};

export default function RoutineTemplatesPage() {
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<RoutineTemplate | null>(null);
    const [selectedTemplateType, setSelectedTemplateType] = useState<RoutineType>("gym");
    const [filterType, setFilterType] = useState<RoutineType | "all">("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, [filterType, showFavoritesOnly]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            let url = "/api/routine-templates";
            const params = new URLSearchParams();
            if (filterType !== "all") {
                params.append("routine_type", filterType);
            }
            if (showFavoritesOnly) {
                params.append("favorites_only", "true");
            }
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setTemplates(result.data || []);
            }
        } catch (error) {
            console.error("Error loading templates:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (templateData: Partial<RoutineTemplate>) => {
        try {
            const url = editingTemplate
                ? `/api/routine-templates/${editingTemplate.id}`
                : "/api/routine-templates";
            const method = editingTemplate ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(templateData),
            });

            if (response.ok) {
                await loadTemplates();
                setIsFormOpen(false);
                setEditingTemplate(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error saving template:", error);
            alert("Error al guardar la plantilla");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/routine-templates/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await loadTemplates();
                setIsFormOpen(false);
                setEditingTemplate(null);
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error("Error deleting template:", error);
            alert("Error al eliminar la plantilla");
        }
    };

    const handleOpenCreateForm = (type: RoutineType) => {
        setEditingTemplate(null);
        setSelectedTemplateType(type);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (template: RoutineTemplate) => {
        setEditingTemplate(template);
        setSelectedTemplateType(template.routine_type);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTemplate(null);
    };

    const toggleFavorite = async (template: RoutineTemplate) => {
        try {
            const response = await fetch(`/api/routine-templates/${template.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    is_favorite: !template.is_favorite,
                }),
            });

            if (response.ok) {
                await loadTemplates();
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

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

    const routineTypeOptions = [
        { type: "athletics" as RoutineType, label: "Atletisme", icon: Activity, color: "bg-blue-600" },
        { type: "running" as RoutineType, label: "Rodatge", icon: Zap, color: "bg-green-600" },
        { type: "gym" as RoutineType, label: "Gimnàs", icon: Dumbbell, color: "bg-purple-600" },
        { type: "steps" as RoutineType, label: "Passos", icon: Footprints, color: "bg-orange-600" },
        { type: "football_match" as RoutineType, label: "Partit de Futbol", icon: Circle, color: "bg-red-600" },
        { type: "yoyo_test" as RoutineType, label: "Yo-Yo Test", icon: Target, color: "bg-yellow-600" },
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
                    Rutines Plantilla
                </h1>
                <p className="text-sm sm:text-base text-neutral-600">
                    Crea i gestiona rutines plantilla que pots assignar a qualsevol dia
                </p>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-neutral-700">Filtrar per tipus:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as RoutineType | "all")}
                        className="px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm"
                    >
                        <option value="all">Tots</option>
                        {routineTypeOptions.map((option) => (
                            <option key={option.type} value={option.type}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="favoritesOnly"
                        checked={showFavoritesOnly}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="favoritesOnly" className="text-sm text-neutral-700 cursor-pointer flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Només favorites
                    </label>
                </div>
            </div>

            {/* Botons per crear noves plantilles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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

            {/* Llista de plantilles */}
            {templates.length === 0 ? (
                <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
                    <p className="text-neutral-500 mb-4">No hi ha plantilles creades</p>
                    <p className="text-sm text-neutral-400">Utilitza els botons de dalt per crear una nova plantilla</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => {
                        const Icon = routineTypeIcons[template.routine_type];
                        const summary = getTemplateSummary(template);
                        return (
                            <Card key={template.id} className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="p-1.5 rounded-lg bg-neutral-100">
                                                <Icon className="h-4 w-4 text-neutral-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-neutral-900 text-sm sm:text-base truncate">
                                                    {template.name}
                                                </h3>
                                                {template.description && (
                                                    <p className="text-xs text-neutral-500 truncate">{template.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleFavorite(template)}
                                            className="h-7 w-7 flex-shrink-0"
                                        >
                                            <Star className={`h-4 w-4 ${template.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={routineTypeColors[template.routine_type]}>
                                            {routineTypeLabels[template.routine_type]}
                                        </Badge>
                                        {summary && (
                                            <span className="text-xs text-neutral-500">{summary}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEditForm(template)}
                                            className="flex-1"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(template.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Formulari */}
            {isFormOpen && (
                <div className="mt-6 bg-white border border-neutral-200 rounded-lg shadow-sm p-4 sm:p-6">
                    <div className="mb-4 pb-4 border-b border-neutral-200 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-neutral-900">
                            {editingTemplate
                                ? `Editar plantilla: ${editingTemplate.name}`
                                : `Crear nova plantilla de ${routineTypeOptions.find((o) => o.type === selectedTemplateType)?.label}`}
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
                    <RoutineTemplateForm
                        templateType={selectedTemplateType}
                        existingTemplate={editingTemplate}
                        onSave={handleSave}
                        onDelete={editingTemplate ? handleDelete : undefined}
                        onCancel={handleCloseForm}
                    />
                </div>
            )}
        </div>
    );
}

