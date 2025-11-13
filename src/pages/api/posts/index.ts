import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();

    // Verificar autenticació amb cookies
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    let session;
    try {
        session = await supabase.auth.setSession({
            refresh_token: refreshToken,
            access_token: accessToken,
        });
        
        if (session.error || !session.data.user) {
            return new Response("Unauthorized", { status: 401 });
        }
    } catch (error) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!title || !content) {
        return new Response("Title and content are required", { status: 400 });
    }

    const { error } = await supabase
        .from("posts")
        .insert([{ title, content, user_id: session.data.user.id }]);
    
    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }), 
            { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    return redirect("/posts");
};

