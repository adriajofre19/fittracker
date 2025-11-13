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

// GET - Obtenir una rutina específica per ID
export const GET: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const { id } = params;

    if (!id) {
        return new Response(
            JSON.stringify({ error: "Missing routine ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("id", id)
        .eq("user_id", auth.user.id)
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!data) {
        return new Response(
            JSON.stringify({ error: "Routine not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

// PUT - Actualitzar una rutina existent
export const PUT: APIRoute = async ({ params, request, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const { id } = params;

    if (!id) {
        return new Response(
            JSON.stringify({ error: "Missing routine ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
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

        // Construir objecte d'actualització només amb els camps proporcionats
        const updateData: any = {};

        if (routine_date !== undefined) updateData.routine_date = routine_date;
        if (routine_type !== undefined) {
            if (!["athletics", "running", "gym", "steps"].includes(routine_type)) {
                return new Response(
                    JSON.stringify({ error: "Invalid routine_type. Must be: athletics, running, gym, or steps" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            updateData.routine_type = routine_type;
        }
        if (athletics_data !== undefined) updateData.athletics_data = athletics_data;
        if (running_data !== undefined) updateData.running_data = running_data;
        if (gym_data !== undefined) updateData.gym_data = gym_data;
        if (steps_count !== undefined) updateData.steps_count = steps_count;
        if (notes !== undefined) updateData.notes = notes;

        const { data, error } = await supabase
            .from("routines")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", auth.user.id)
            .select()
            .single();

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!data) {
            return new Response(
                JSON.stringify({ error: "Routine not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ data }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || "Invalid JSON" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
};

// DELETE - Eliminar una rutina
export const DELETE: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const { id } = params;

    if (!id) {
        return new Response(
            JSON.stringify({ error: "Missing routine ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
        .from("routines")
        .delete()
        .eq("id", id)
        .eq("user_id", auth.user.id);

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ message: "Routine deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

