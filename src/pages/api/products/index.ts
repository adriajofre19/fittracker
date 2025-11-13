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

// GET - Obtenir tots els productes (per defecte + del usuari)
export const GET: APIRoute = async ({ cookies, url }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const search = url.searchParams.get("search");
    const category = url.searchParams.get("category");

    // Obtenir productes per defecte i del usuari
    let query = supabase
        .from("products")
        .select("*")
        .or(`is_default.eq.true,user_id.eq.${auth.user.id}`)
        .order("is_default", { ascending: false })
        .order("name", { ascending: true });

    if (search) {
        query = query.ilike("name", `%${search}%`);
    }

    if (category) {
        query = query.eq("category", category);
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

// POST - Crear un nou producte personalitzat
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
            category,
            calories_per_100g,
            protein_per_100g,
            carbs_per_100g,
            fat_per_100g,
        } = body;

        if (!name) {
            return new Response(
                JSON.stringify({ error: "Missing required field: name" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabase
            .from("products")
            .insert([
                {
                    user_id: auth.user.id,
                    name,
                    category: category || null,
                    calories_per_100g: calories_per_100g ? parseFloat(calories_per_100g) : null,
                    protein_per_100g: protein_per_100g ? parseFloat(protein_per_100g) : null,
                    carbs_per_100g: carbs_per_100g ? parseFloat(carbs_per_100g) : null,
                    fat_per_100g: fat_per_100g ? parseFloat(fat_per_100g) : null,
                    is_default: false,
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

