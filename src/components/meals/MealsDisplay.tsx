import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meal } from "../../types";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { UtensilsCrossed, Edit } from "lucide-react";

interface MealsDisplayProps {
    record: Meal;
    onEdit?: () => void;
}

const mealLabels = {
    breakfast: "Esmorzar",
    lunch: "Dinar",
    snack: "Berenar",
    dinner: "Sopar",
};

export default function MealsDisplay({ record, onEdit }: MealsDisplayProps) {
    const mealDate = new Date(record.meal_date);

    const hasMeal = (meal: any) => {
        return meal && (
            (meal.products && meal.products.length > 0) ||
            (meal.description && meal.description.trim() !== "")
        );
    };

    return (
        <Card className="bg-white border border-neutral-200 shadow-sm h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-neutral-900 flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5" />
                        Registre d'àpats
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
                <div className="text-sm text-neutral-600 mb-4">
                    {format(mealDate, "EEEE, d MMMM yyyy", { locale: ca })}
                </div>

                {hasMeal(record.breakfast) && (
                    <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                            {mealLabels.breakfast}
                        </p>
                        {record.breakfast?.products && record.breakfast.products.length > 0 ? (
                            <div className="space-y-2">
                                {record.breakfast.products.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{product.product_name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {product.quantity}g
                                                {product.calories && ` • ${product.calories.toFixed(0)} kcal`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {record.breakfast.totals && (
                                    <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-600">
                                        <span className="font-medium">
                                            Total: {record.breakfast.totals.calories?.toFixed(0) || 0} kcal
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                {record.breakfast?.description}
                            </p>
                        )}
                    </div>
                )}

                {hasMeal(record.lunch) && (
                    <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                            {mealLabels.lunch}
                        </p>
                        {record.lunch?.products && record.lunch.products.length > 0 ? (
                            <div className="space-y-2">
                                {record.lunch.products.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{product.product_name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {product.quantity}g
                                                {product.calories && ` • ${product.calories.toFixed(0)} kcal`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {record.lunch.totals && (
                                    <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-600">
                                        <span className="font-medium">
                                            Total: {record.lunch.totals.calories?.toFixed(0) || 0} kcal
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                {record.lunch?.description}
                            </p>
                        )}
                    </div>
                )}

                {hasMeal(record.snack) && (
                    <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                            {mealLabels.snack}
                        </p>
                        {record.snack?.products && record.snack.products.length > 0 ? (
                            <div className="space-y-2">
                                {record.snack.products.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{product.product_name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {product.quantity}g
                                                {product.calories && ` • ${product.calories.toFixed(0)} kcal`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {record.snack.totals && (
                                    <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-600">
                                        <span className="font-medium">
                                            Total: {record.snack.totals.calories?.toFixed(0) || 0} kcal
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                {record.snack?.description}
                            </p>
                        )}
                    </div>
                )}

                {hasMeal(record.dinner) && (
                    <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700 mb-2">
                            {mealLabels.dinner}
                        </p>
                        {record.dinner?.products && record.dinner.products.length > 0 ? (
                            <div className="space-y-2">
                                {record.dinner.products.map((product: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{product.product_name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {product.quantity}g
                                                {product.calories && ` • ${product.calories.toFixed(0)} kcal`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {record.dinner.totals && (
                                    <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-600">
                                        <span className="font-medium">
                                            Total: {record.dinner.totals.calories?.toFixed(0) || 0} kcal
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                                {record.dinner?.description}
                            </p>
                        )}
                    </div>
                )}

                {!hasMeal(record.breakfast) && 
                 !hasMeal(record.lunch) && 
                 !hasMeal(record.snack) && 
                 !hasMeal(record.dinner) && (
                    <div className="text-center py-8 text-neutral-500">
                        No hi ha àpats registrats per aquest dia
                    </div>
                )}

                {record.water_liters !== undefined && record.water_liters > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-700">
                                Aigua beguda
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                                {record.water_liters.toFixed(1)} L
                            </p>
                        </div>
                    </div>
                )}

                {record.notes && (
                    <div className="pt-2 border-t border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700 mb-2">Notes</p>
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                            {record.notes}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

