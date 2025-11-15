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

export interface Exercise {
    id: string;
    name: string;
    category: "strength" | "cardio" | "flexibility" | "sport";
    muscle_groups: string[];
    equipment: string[];
    description?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface AthleticsSeries {
    distance: string; // e.g., "100m", "200m", "400m"
    time: string; // e.g., "12.5s", "1:23"
    rest: string; // e.g., "2min", "30s"
    notes?: string;
}

export interface AthleticsData {
    series: AthleticsSeries[];
    total_distance?: string;
    notes?: string;
}

export interface RunningData {
    distance_km: number;
    duration_minutes: number;
    pace_per_km: string; // e.g., "5:00"
    average_heart_rate?: number;
    notes?: string;
}

export interface GymSet {
    reps: number;
    weight_kg?: number;
    rest_seconds?: number;
    notes?: string;
}

export interface GymExercise {
    exercise_id: string;
    exercise_name?: string;
    sets: GymSet[];
    notes?: string;
}

export interface GymData {
    exercises: GymExercise[];
    total_duration_minutes?: number;
    notes?: string;
}

export interface YoYoSeries {
    start_level: string; // e.g., "0", "1", "2", ..., "19.2"
    end_level: string; // e.g., "0", "1", "2", ..., "19.2"
    completed: boolean;
    notes?: string;
}

export interface YoYoTestData {
    series: YoYoSeries[];
    notes?: string;
}

export interface FootballMatchData {
    total_kms: number;
    calories: number;
    notes?: string;
}

export type RoutineType = "athletics" | "running" | "gym" | "steps" | "football_match" | "yoyo_test";

export interface Routine {
    id: string;
    user_id: string;
    routine_date: string; // YYYY-MM-DD format
    routine_type: RoutineType;
    athletics_data?: AthleticsData;
    running_data?: RunningData;
    gym_data?: GymData;
    steps_count?: number;
    football_match_data?: FootballMatchData;
    yoyo_test_data?: YoYoTestData;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface RoutineTemplate {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    routine_type: RoutineType;
    athletics_data?: AthleticsData;
    running_data?: RunningData;
    gym_data?: GymData;
    steps_count?: number;
    football_match_data?: FootballMatchData;
    yoyo_test_data?: YoYoTestData;
    notes?: string;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}