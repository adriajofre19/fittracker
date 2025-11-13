import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Meal, MealProduct } from "../../types";
import { format } from "date-fns";
import ProductSelector from "./ProductSelector";
import { X } from "lucide-react";

interface MealsFormProps {
    date: Date;
    existingRecord?: Meal | null;
    onSave: (record: Partial<Meal>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

const mealLabels = {
    breakfast: "Esmorzar",
    lunch: "Dinar",
    snack: "Berenar",
    dinner: "Sopar",
};

type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export default function MealsForm({
    date,
    existingRecord,
    onSave,
    onDelete,
}: MealsFormProps) {
    const [breakfastProducts, setBreakfastProducts] = useState<MealProduct[]>([]);
    const [lunchProducts, setLunchProducts] = useState<MealProduct[]>([]);
    const [snackProducts, setSnackProducts] = useState<MealProduct[]>([]);
    const [dinnerProducts, setDinnerProducts] = useState<MealProduct[]>([]);
    const [waterLiters, setWaterLiters] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeMealType, setActiveMealType] = useState<MealType | null>(null);

    useEffect(() => {
        if (existingRecord) {
            setBreakfastProducts(existingRecord.breakfast?.products || []);
            setLunchProducts(existingRecord.lunch?.products || []);
            setSnackProducts(existingRecord.snack?.products || []);
            setDinnerProducts(existingRecord.dinner?.products || []);
            setWaterLiters(existingRecord.water_liters?.toString() || "");
            setNotes(existingRecord.notes || "");
        } else {
            setBreakfastProducts([]);
            setLunchProducts([]);
            setSnackProducts([]);
            setDinnerProducts([]);
            setWaterLiters("");
            setNotes("");
        }
    }, [existingRecord, date]);

    const handleAddProduct = (product: MealProduct, mealType?: MealType) => {
        const targetMealType = mealType || activeMealType;
        if (!targetMealType) return;

        const setters = {
            breakfast: setBreakfastProducts,
            lunch: setLunchProducts,
            snack: setSnackProducts,
            dinner: setDinnerProducts,
        };

        const currentProducts = {
            breakfast: breakfastProducts,
            lunch: lunchProducts,
            snack: snackProducts,
            dinner: dinnerProducts,
        };

        setters[targetMealType]([...currentProducts[targetMealType], product]);
        setActiveMealType(null);
    };

    const handleRemoveProduct = (mealType: MealType, index: number) => {
        const setters = {
            breakfast: setBreakfastProducts,
            lunch: setLunchProducts,
            snack: setSnackProducts,
            dinner: setDinnerProducts,
        };

        const currentProducts = {
            breakfast: breakfastProducts,
            lunch: lunchProducts,
            snack: snackProducts,
            dinner: dinnerProducts,
        };

        setters[mealType](currentProducts[mealType].filter((_, i) => i !== index));
    };

    const calculateTotals = (products: MealProduct[]) => {
        return products.reduce(
            (acc, p) => ({
                calories: acc.calories + (p.calories || 0),
                protein: acc.protein + (p.protein || 0),
                carbs: acc.carbs + (p.carbs || 0),
                fat: acc.fat + (p.fat || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const mealDate = format(date, "yyyy-MM-dd");
            
            const mealData: Partial<Meal> = {
                meal_date: mealDate,
                breakfast: breakfastProducts.length > 0 ? { 
                    products: breakfastProducts,
                    totals: calculateTotals(breakfastProducts)
                } : null,
                lunch: lunchProducts.length > 0 ? { 
                    products: lunchProducts,
                    totals: calculateTotals(lunchProducts)
                } : null,
                snack: snackProducts.length > 0 ? { 
                    products: snackProducts,
                    totals: calculateTotals(snackProducts)
                } : null,
                dinner: dinnerProducts.length > 0 ? { 
                    products: dinnerProducts,
                    totals: calculateTotals(dinnerProducts)
                } : null,
                water_liters: waterLiters ? parseFloat(waterLiters) : undefined,
                notes: notes || undefined,
            };

            await onSave(mealData);
        } catch (error) {
            console.error("Error saving meal record:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingRecord || !onDelete) return;
        
        if (confirm("Estàs segur que vols eliminar aquest registre d'àpats?")) {
            await onDelete(existingRecord.id);
        }
    };

    const renderMealSection = (mealType: MealType, products: MealProduct[]) => {
        const totals = calculateTotals(products);
        const hasProducts = products.length > 0;

        return (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {mealLabels[mealType]}
                    </label>
                    <div onClick={(e) => e.stopPropagation()}>
                        <ProductSelector
                            onAddProduct={(product) => handleAddProduct(product, mealType)}
                            existingProducts={products}
                            activeMealType={activeMealType === mealType ? mealType : null}
                        />
                    </div>
                </div>
                
                {hasProducts && (
                    <div className="space-y-2 mb-2">
                        {products.map((product, index) => (
                            <div
                                key={`${product.product_id}-${index}`}
                                className="flex items-center justify-between p-2 bg-white rounded border border-neutral-200"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-900">
                                        {product.product_name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {product.quantity}g
                                        {product.calories && ` • ${product.calories.toFixed(0)} kcal`}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveProduct(mealType, index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {hasProducts && totals.calories > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                        <div className="flex justify-between text-xs text-neutral-600">
                            <span>Total:</span>
                            <span className="font-medium">
                                {totals.calories.toFixed(0)} kcal
                                {totals.protein > 0 && ` • P: ${totals.protein.toFixed(1)}g`}
                                {totals.carbs > 0 && ` • C: ${totals.carbs.toFixed(1)}g`}
                                {totals.fat > 0 && ` • F: ${totals.fat.toFixed(1)}g`}
                            </span>
                        </div>
                    </div>
                )}

            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    {renderMealSection("breakfast", breakfastProducts)}
                </div>
                <div>
                    {renderMealSection("lunch", lunchProducts)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    {renderMealSection("snack", snackProducts)}
                </div>
                <div>
                    {renderMealSection("dinner", dinnerProducts)}
                </div>
            </div>

            <div>
                <label
                    htmlFor="water"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                    Aigua beguda (litres)
                </label>
                <input
                    type="number"
                    id="water"
                    min="0"
                    step="0.1"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 1.5"
                />
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
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Afegeix notes sobre els àpats..."
                />
            </div>

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

