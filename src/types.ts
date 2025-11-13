export interface Post {
    id: string;
    title: string;
    content: string;
    user_id: string;
    created_at: string;
}

export interface SleepPhase {
    phase: "light" | "deep" | "rem" | "awake";
    start_time: string;
    end_time: string;
    duration_minutes: number;
}

export interface SleepRecord {
    id: string;
    user_id: string;
    sleep_date: string; // YYYY-MM-DD format
    bedtime: string; // ISO timestamp
    wake_time: string; // ISO timestamp
    total_sleep_hours: number;
    sleep_phases: SleepPhase[];
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Meal {
    id: string;
    user_id: string;
    meal_date: string; // YYYY-MM-DD format
    breakfast?: any; // JSONB - pot contenir informació sobre l'esmorzar
    lunch?: any; // JSONB - pot contenir informació sobre el dinar
    snack?: any; // JSONB - pot contenir informació sobre el berenar
    dinner?: any; // JSONB - pot contenir informació sobre el sopar
    water_liters?: number; // Quantitat d'aigua beguda en litres
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    user_id?: string | null;
    name: string;
    category?: string;
    calories_per_100g?: number;
    protein_per_100g?: number;
    carbs_per_100g?: number;
    fat_per_100g?: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface MealProduct {
    product_id: string;
    product_name: string;
    quantity: number; // grams
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}
