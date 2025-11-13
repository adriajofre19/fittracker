import type { APIRoute } from "astro";
import type { AstroCookies } from "astro";
import { supabase } from "../../../lib/supabase";

async function deletePost(postId: string, cookies: AstroCookies, redirect: (path: string) => Response) {
    if (!postId) {
        return new Response("Post ID is required", { status: 400 });
    }

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

    const userId = session.data.user.id;

    // Verificar que el post pertany a l'usuari abans d'eliminar-lo
    const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

    if (fetchError || !post) {
        return new Response("Post not found", { status: 404 });
    }

    if (post.user_id !== userId) {
        return new Response("Forbidden", { status: 403 });
    }

    // Eliminar el post
    const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId);

    if (deleteError) {
        return new Response(
            JSON.stringify({ error: deleteError.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    return redirect("/posts");
}

export const DELETE: APIRoute = async ({ params, redirect, cookies }) => {
    return deletePost(params.id!, cookies, redirect);
};

export const POST: APIRoute = async ({ params, request, redirect, cookies }) => {
    const formData = await request.formData();
    const method = formData.get("_method")?.toString();
    
    if (method === "DELETE") {
        return deletePost(params.id!, cookies, redirect);
    }
    
    return new Response("Method not allowed", { status: 405 });
};

