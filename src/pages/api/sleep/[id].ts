import type { APIRoute } from "astro";
import type { AstroCookies } from "astro";
import { supabase } from "../../../lib/supabase";

// Funció helper per verificar autenticació
async function verifyAuth(cookies: AstroCookies) {
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

// GET - Obtenir un registre específic
export const GET: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", auth.user.id)
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: error.code === "PGRST116" ? 404 : 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

// PUT - Actualitzar un registre
export const PUT: APIRoute = async ({ params, request, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Verificar que el registre pertany a l'usuari
    const { data: existingRecord, error: fetchError } = await supabase
        .from("sleep_records")
        .select("user_id")
        .eq("id", params.id)
        .single();

    if (fetchError || !existingRecord) {
        return new Response(
            JSON.stringify({ error: "Record not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    if (existingRecord.user_id !== auth.user.id) {
        return new Response(
            JSON.stringify({ error: "Forbidden" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await request.json();
        const {
            sleep_date,
            bedtime,
            wake_time,
            total_sleep_hours,
            sleep_phases,
            notes,
        } = body;

        const updateData: any = {};
        if (sleep_date !== undefined) updateData.sleep_date = sleep_date;
        if (bedtime !== undefined) updateData.bedtime = bedtime;
        if (wake_time !== undefined) updateData.wake_time = wake_time;
        if (total_sleep_hours !== undefined) updateData.total_sleep_hours = parseFloat(total_sleep_hours);
        if (sleep_phases !== undefined) updateData.sleep_phases = sleep_phases;
        if (notes !== undefined) updateData.notes = notes;

        const { data, error } = await supabase
            .from("sleep_records")
            .update(updateData)
            .eq("id", params.id)
            .eq("user_id", auth.user.id)
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
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || "Invalid JSON" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
};

// DELETE - Eliminar un registre
export const DELETE: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Verificar que el registre pertany a l'usuari
    const { data: existingRecord, error: fetchError } = await supabase
        .from("sleep_records")
        .select("user_id")
        .eq("id", params.id)
        .single();

    if (fetchError || !existingRecord) {
        return new Response(
            JSON.stringify({ error: "Record not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    if (existingRecord.user_id !== auth.user.id) {
        return new Response(
            JSON.stringify({ error: "Forbidden" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
        .from("sleep_records")
        .delete()
        .eq("id", params.id)
        .eq("user_id", auth.user.id);

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ message: "Record deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

