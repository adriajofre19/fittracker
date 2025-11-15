import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Product, MealProduct } from "../../types";
import { Search, Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ProductSelectorProps {
    onAddProduct: (product: MealProduct) => void;
    existingProducts?: MealProduct[];
    activeMealType?: string | null;
}

export default function ProductSelector({ onAddProduct, existingProducts = [], activeMealType }: ProductSelectorProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState("100");

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen, searchTerm, selectedCategory]);

    const loadProducts = async () => {
        try {
            let url = "/api/products";
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (selectedCategory) params.append("category", selectedCategory);
            if (params.toString()) url += "?" + params.toString();

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setProducts(result.data || []);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

    const handleAddProduct = () => {
        if (!selectedProduct) return;

        const qty = parseFloat(quantity) || 100;
        const multiplier = qty / 100;

        const mealProduct: MealProduct = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: qty,
            calories: selectedProduct.calories_per_100g ? selectedProduct.calories_per_100g * multiplier : undefined,
            protein: selectedProduct.protein_per_100g ? selectedProduct.protein_per_100g * multiplier : undefined,
            carbs: selectedProduct.carbs_per_100g ? selectedProduct.carbs_per_100g * multiplier : undefined,
            fat: selectedProduct.fat_per_100g ? selectedProduct.fat_per_100g * multiplier : undefined,
        };

        onAddProduct(mealProduct);
        setSelectedProduct(null);
        setQuantity("100");
        setIsOpen(false);
        setSearchTerm("");
    };

    const filteredProducts = products.filter(p => {
        if (selectedCategory && p.category !== selectedCategory) return false;
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="gap-2"
                size="sm"
            >
                <Plus className="h-4 w-4" />
                Afegir
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-neutral-900 dark:text-neutral-100">
                            Seleccionar producte
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Cerca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cercar producte..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filtre per categoria */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={selectedCategory === "" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory("")}
                                >
                                    Totes
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat}
                                        type="button"
                                        variant={selectedCategory === cat ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Llista de productes */}
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredProducts.length === 0 ? (
                                <p className="text-sm text-neutral-500 text-center py-4">
                                    No s'han trobat productes
                                </p>
                            ) : (
                                filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => setSelectedProduct(product)}
                                        className={`w-full text-left p-3 rounded-md border transition-colors ${selectedProduct?.id === product.id
                                            ? "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950"
                                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-neutral-900">{product.name}</p>
                                                {product.category && (
                                                    <p className="text-xs text-neutral-500">{product.category}</p>
                                                )}
                                            </div>
                                            {product.calories_per_100g && (
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-neutral-700">
                                                        {product.calories_per_100g} kcal
                                                    </p>
                                                    <p className="text-xs text-neutral-500">per 100g</p>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Quantitat i afegir */}
                        {selectedProduct && (
                            <div className="pt-4 border-t border-neutral-200 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Quantitat (grams)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {selectedProduct.calories_per_100g && (
                                    <div className="text-sm text-neutral-600">
                                        <p>
                                            Calories: {((selectedProduct.calories_per_100g * parseFloat(quantity || "100")) / 100).toFixed(0)} kcal
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="flex-1 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                                    >
                                        Afegir
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedProduct(null);
                                            setQuantity("100");
                                        }}
                                    >
                                        Cancel·lar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

