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

// GET - Obtenir totes les rutines de l'usuari
export const GET: APIRoute = async ({ cookies, url }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const routineType = url.searchParams.get("routine_type");

    let query = supabase
        .from("routines")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("routine_date", { ascending: false })
        .order("routine_type", { ascending: true })
        .range(offset, offset + limit - 1);

    if (startDate) {
        query = query.gte("routine_date", startDate);
    }

    if (endDate) {
        query = query.lte("routine_date", endDate);
    }

    if (routineType) {
        query = query.eq("routine_type", routineType);
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

// POST - Crear una nova rutina
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
            routine_date,
            routine_type,
            athletics_data,
            running_data,
            gym_data,
            steps_count,
            notes,
        } = body;

        if (!routine_date || !routine_type) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: routine_date, routine_type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validar que el tipus sigui vàlid
        if (!["athletics", "running", "gym", "steps"].includes(routine_type)) {
            return new Response(
                JSON.stringify({ error: "Invalid routine_type. Must be: athletics, running, gym, or steps" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Validar que hi hagi dades segons el tipus
        if (routine_type === "athletics" && !athletics_data) {
            return new Response(
                JSON.stringify({ error: "athletics_data is required for athletics routine type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (routine_type === "running" && !running_data) {
            return new Response(
                JSON.stringify({ error: "running_data is required for running routine type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (routine_type === "gym" && !gym_data) {
            return new Response(
                JSON.stringify({ error: "gym_data is required for gym routine type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (routine_type === "steps" && steps_count === undefined) {
            return new Response(
                JSON.stringify({ error: "steps_count is required for steps routine type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabase
            .from("routines")
            .insert([
                {
                    user_id: auth.user.id,
                    routine_date,
                    routine_type,
                    athletics_data: routine_type === "athletics" ? athletics_data : null,
                    running_data: routine_type === "running" ? running_data : null,
                    gym_data: routine_type === "gym" ? gym_data : null,
                    steps_count: routine_type === "steps" ? parseInt(steps_count) : null,
                    notes: notes || null,
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

