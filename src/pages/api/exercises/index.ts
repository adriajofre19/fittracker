import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

// GET - Obtenir tots els exercicis disponibles
export const GET: APIRoute = async ({ url }) => {
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    let query = supabase
        .from("exercises")
        .select("*")
        .eq("is_default", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

    if (category) {
        query = query.eq("category", category);
    }

    if (search) {
        query = query.ilike("name", `%${search}%`);
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

