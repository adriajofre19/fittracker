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

// GET - Obtenir una rutina plantilla específica per ID
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
            JSON.stringify({ error: "Missing template ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { data, error } = await supabase
        .from("routine_templates")
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
            JSON.stringify({ error: "Template not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

// PUT - Actualitzar una rutina plantilla existent
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
            JSON.stringify({ error: "Missing template ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
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

        const updateData: any = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (routine_type !== undefined) {
            if (!["athletics", "running", "gym", "steps", "football_match", "yoyo_test"].includes(routine_type)) {
                return new Response(
                    JSON.stringify({ error: "Invalid routine_type" }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            updateData.routine_type = routine_type;
        }
        if (athletics_data !== undefined) updateData.athletics_data = athletics_data;
        if (running_data !== undefined) updateData.running_data = running_data;
        if (gym_data !== undefined) updateData.gym_data = gym_data;
        if (steps_count !== undefined) updateData.steps_count = steps_count;
        if (football_match_data !== undefined) updateData.football_match_data = football_match_data;
        if (yoyo_test_data !== undefined) updateData.yoyo_test_data = yoyo_test_data;
        if (notes !== undefined) updateData.notes = notes;
        if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

        const { data, error } = await supabase
            .from("routine_templates")
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
                JSON.stringify({ error: "Template not found" }),
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

// DELETE - Eliminar una rutina plantilla
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
            JSON.stringify({ error: "Missing template ID" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
        .from("routine_templates")
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
        JSON.stringify({ message: "Template deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

