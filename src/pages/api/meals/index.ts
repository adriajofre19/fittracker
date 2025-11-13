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

// GET - Obtenir tots els registres d'àpats de l'usuari
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

    let query = supabase
        .from("meals")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("meal_date", { ascending: false })
        .range(offset, offset + limit - 1);

    if (startDate) {
        query = query.gte("meal_date", startDate);
    }

    if (endDate) {
        query = query.lte("meal_date", endDate);
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

// POST - Crear un nou registre d'àpats
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
            meal_date,
            breakfast,
            lunch,
            snack,
            dinner,
            water_liters,
            notes,
        } = body;

        if (!meal_date) {
            return new Response(
                JSON.stringify({ error: "Missing required field: meal_date" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabase
            .from("meals")
            .insert([
                {
                    user_id: auth.user.id,
                    meal_date,
                    breakfast: breakfast || null,
                    lunch: lunch || null,
                    snack: snack || null,
                    dinner: dinner || null,
                    water_liters: water_liters !== undefined ? water_liters : null,
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

