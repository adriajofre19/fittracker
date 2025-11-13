import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { AstroCookies } from "astro";

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

// GET - Obtenir un producte específic
export const GET: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .or(`is_default.eq.true,user_id.eq.${auth.user.id}`)
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

// PUT - Actualitzar un producte (només els propis)
export const PUT: APIRoute = async ({ params, request, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Verificar que el producte pertany a l'usuari (no pot modificar productes per defecte)
    const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("user_id, is_default")
        .eq("id", params.id)
        .single();

    if (fetchError || !existingProduct) {
        return new Response(
            JSON.stringify({ error: "Product not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    if (existingProduct.is_default || existingProduct.user_id !== auth.user.id) {
        return new Response(
            JSON.stringify({ error: "Cannot modify default products or other users' products" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
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

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (calories_per_100g !== undefined) updateData.calories_per_100g = calories_per_100g ? parseFloat(calories_per_100g) : null;
        if (protein_per_100g !== undefined) updateData.protein_per_100g = protein_per_100g ? parseFloat(protein_per_100g) : null;
        if (carbs_per_100g !== undefined) updateData.carbs_per_100g = carbs_per_100g ? parseFloat(carbs_per_100g) : null;
        if (fat_per_100g !== undefined) updateData.fat_per_100g = fat_per_100g ? parseFloat(fat_per_100g) : null;

        const { data, error } = await supabase
            .from("products")
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

// DELETE - Eliminar un producte (només els propis)
export const DELETE: APIRoute = async ({ params, cookies }) => {
    const auth = await verifyAuth(cookies);
    
    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({ error: auth.error }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Verificar que el producte pertany a l'usuari
    const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("user_id, is_default")
        .eq("id", params.id)
        .single();

    if (fetchError || !existingProduct) {
        return new Response(
            JSON.stringify({ error: "Product not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    if (existingProduct.is_default || existingProduct.user_id !== auth.user.id) {
        return new Response(
            JSON.stringify({ error: "Cannot delete default products or other users' products" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
        .from("products")
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
        JSON.stringify({ message: "Product deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
};

