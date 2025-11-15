import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

// Funció helper per verificar autenticació
async function verifyAuth(cookies: any) {
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
        return { error: "Unauthorized", user: null };
    }

    try {
        const session = await supabase.auth.setSession({
            refresh_token: refreshToken,
            access_token: accessToken,
        });

        if (session.error || !session.data.user) {
            return { error: "Unauthorized", user: null };
        }

        return { error: null, user: session.data.user };
    } catch (error) {
        return { error: "Unauthorized", user: null };
    }
}

// GET - Obtenir totes les rutines plantilla de l'usuari
export const GET: APIRoute = async ({ cookies, url }) => {
    const auth = await verifyAuth(cookies);

    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const routineType = url.searchParams.get("routine_type");
    const favoritesOnly = url.searchParams.get("favorites_only") === "true";

    let query = supabase
        .from("routine_templates")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("is_favorite", { ascending: false })
        .order("created_at", { ascending: false });

    if (routineType) {
        query = query.eq("routine_type", routineType);
    }

    if (favoritesOnly) {
        query = query.eq("is_favorite", true);
    }

    const { data, error } = await query;

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

// POST - Crear una nova rutina plantilla
export const POST: APIRoute = async ({ request, cookies }) => {
    const auth = await verifyAuth(cookies);

    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await request.json();
        const {
            name,
            description,
            routine_type,
            athletics_data,
            running_data,
            gym_data,
            steps_count,
            football_match_data,
            yoyo_test_data,
            notes,
            is_favorite,
        } = body;

        if (!name || !routine_type) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: name, routine_type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validar que el tipus sigui vàlid
        if (!["athletics", "running", "gym", "steps", "football_match", "yoyo_test"].includes(routine_type)) {
            return new Response(
                JSON.stringify({ error: "Invalid routine_type. Must be: athletics, running, gym, steps, football_match, or yoyo_test" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabase
            .from("routine_templates")
            .insert([
                {
                    user_id: auth.user.id,
                    name,
                    description: description || null,
                    routine_type,
                    athletics_data: routine_type === "athletics" ? athletics_data : null,
                    running_data: routine_type === "running" ? running_data : null,
                    gym_data: routine_type === "gym" ? gym_data : null,
                    steps_count: routine_type === "steps" ? parseInt(steps_count) : null,
                    football_match_data: routine_type === "football_match" ? football_match_data : null,
                    yoyo_test_data: routine_type === "yoyo_test" ? yoyo_test_data : null,
                    notes: notes || null,
                    is_favorite: is_favorite || false,
                },
            ])
            .select()
            .single();

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ data }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || "Invalid JSON" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
};

