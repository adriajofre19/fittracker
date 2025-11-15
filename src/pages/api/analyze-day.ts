import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

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

// POST - Analitzar el dia amb IA
export const POST: APIRoute = async ({ request, cookies }) => {
    // Debug: verificar cookies
    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
        return new Response(
            JSON.stringify({
                error: "No estàs autenticat. Si us plau, inicia sessió novament.",
                debug: {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken
                }
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const auth = await verifyAuth(cookies);

    if (auth.error || !auth.user) {
        return new Response(
            JSON.stringify({
                error: auth.error || "Error d'autenticació. Si us plau, inicia sessió novament.",
                debug: {
                    authError: auth.error,
                    hasUser: !!auth.user
                }
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await request.json();
        const { dayData } = body;

        if (!dayData) {
            return new Response(
                JSON.stringify({ error: "Missing dayData" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Verificar quina API està configurada (prioritat: Gemini > OpenAI)
        const geminiApiKey = import.meta.env.GEMINI_API_KEY;
        const openaiApiKey = import.meta.env.OPENAI_API_KEY;

        // Log per debugging (sense mostrar la clau completa)
        console.log("API Keys disponibles:", {
            hasGemini: !!geminiApiKey,
            hasOpenAI: !!openaiApiKey,
            geminiLength: geminiApiKey?.length || 0,
            openaiLength: openaiApiKey?.length || 0
        });

        if (!geminiApiKey && !openaiApiKey) {
            return new Response(
                JSON.stringify({
                    error: "No s'ha configurat cap API key. Si us plau, configura GEMINI_API_KEY (gratuïta) o OPENAI_API_KEY al fitxer .env. Pots obtenir una clau gratuïta de Gemini a: https://aistudio.google.com/app/apikey"
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Si hi ha Gemini, utilitzar només Gemini (no fallback a OpenAI)
        if (geminiApiKey) {
            console.log("Utilitzant Gemini API per a l'anàlisi");
        } else if (openaiApiKey) {
            console.log("Utilitzant OpenAI API per a l'anàlisi");
        }

        // Preparar el prompt per a la IA amb format estructurat
        const prompt = `Analitza aquest resum diari i dóna'm una anàlisi detallada en català sobre com ha anat el dia. 

Dades del dia:
${JSON.stringify(dayData, null, 2)}

Respon EXACTAMENT amb aquest format estructurat:

## 📊 Resum General
[Breu resum del dia en 2-3 frases]

## ✅ El que has fet bé
[Llista de 3-5 punts positius del dia. Inclou aspectes del son, nutrició, activitat física, etc.]

## ❌ El que has fet malament o millorable
[Llista de 2-4 aspectes que podrien millorar. Sigues constructiu i específic]

## 💡 Recomanacions per millorar
[Llista de 3-5 recomanacions concretes i accionables per millorar els aspectes identificats]

## ⭐ Puntuació del dia
**Puntuació: [X]/10**

**Justificació:** [Breu explicació de per què aquesta puntuació en 2-3 frases]

Sigues positiu, constructiu i específic. Utilitza emojis només als títols de secció. Resposta màxima 2500 paraules.`;

        let analysis: string | undefined;

        // Intentar primer amb Gemini (gratuïta) - només si està configurada
        if (geminiApiKey) {
            try {
                console.log("Cridant a Gemini API...");

                // Primer, llistar models disponibles per trobar un que funcioni
                let availableModels: string[] = [];
                try {
                    const listResponse = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
                    );
                    if (listResponse.ok) {
                        const modelsList = await listResponse.json();
                        availableModels = modelsList.models?.map((m: any) => m.name) || [];
                        console.log("Models disponibles:", availableModels);
                    }
                } catch (e) {
                    console.log("No s'han pogut llistar els models disponibles, utilitzant models per defecte");
                }

                // Models a provar (prioritzar gemini-2.5-flash que sabem que funciona)
                const modelsToTry = [
                    // Model que sabem que funciona
                    { model: "gemini-2.5-flash", version: "v1" },
                    // Altres models a provar
                    { model: "gemini-1.5-flash", version: "v1beta" },
                    { model: "gemini-1.5-pro", version: "v1beta" },
                    { model: "gemini-pro", version: "v1beta" },
                    // Si hi ha models disponibles de la llista, provar-los també
                    ...(availableModels.length > 0 ? availableModels
                        .filter((name: string) => name.includes("gemini") && !name.includes("gemini-2.5-flash"))
                        .map((name: string) => ({
                            model: name.split("/").pop() || name,
                            version: name.includes("v1beta") ? "v1beta" : "v1"
                        }))
                        .slice(0, 2) : [])
                ];

                const requestBody = {
                    contents: [{
                        parts: [{
                            text: `Ets un assistent personal de salut i benestar. Analitzes resums diaris d'activitats i dones feedback constructiu i positiu en català.\n\n${prompt}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 3000, // Augmentat per evitar MAX_TOKENS
                    }
                };

                let geminiResponse: Response | null = null;
                let lastError: string = "";
                let successfulModel = "";

                for (const modelConfig of modelsToTry) {
                    try {
                        const modelUrl = `https://generativelanguage.googleapis.com/${modelConfig.version}/models/${modelConfig.model}:generateContent?key=${geminiApiKey}`;
                        console.log(`Intentant amb ${modelConfig.model} (${modelConfig.version})...`);

                        geminiResponse = await fetch(modelUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        });

                        if (geminiResponse.ok) {
                            successfulModel = `${modelConfig.model} (${modelConfig.version})`;
                            console.log(`Èxit amb ${successfulModel}`);
                            break;
                        } else {
                            const errorData = await geminiResponse.json().catch(() => ({ error: "Unknown error" }));
                            lastError = errorData.error?.message || errorData.error || "Unknown error";
                            console.log(`Error amb ${modelConfig.model}: ${lastError}`);
                            geminiResponse = null;
                        }
                    } catch (error: any) {
                        lastError = error.message || "Error desconegut";
                        console.log(`Excepció amb ${modelConfig.model}: ${lastError}`);
                        geminiResponse = null;
                    }
                }

                if (!geminiResponse || !geminiResponse.ok) {
                    console.error("Tots els models han fallat. Últim error:", lastError);
                    console.log("Models disponibles trobats:", availableModels);

                    return new Response(
                        JSON.stringify({
                            error: `Error amb Gemini API: ${lastError}. Models disponibles: ${availableModels.length > 0 ? availableModels.join(", ") : "No s'han pogut obtenir"}. Si us plau, verifica que la teva clau API sigui vàlida a: https://aistudio.google.com/app/apikey`
                        }),
                        { status: 500, headers: { "Content-Type": "application/json" } }
                    );
                }

                const geminiData = await geminiResponse.json();

                // Intentar obtenir el text de diferents estructures possibles
                const candidate = geminiData.candidates?.[0];
                if (candidate?.content?.parts) {
                    analysis = candidate.content.parts[0]?.text;
                } else if (candidate?.content?.text) {
                    analysis = candidate.content.text;
                } else if (candidate?.text) {
                    analysis = candidate.text;
                } else if (geminiData.text) {
                    analysis = geminiData.text;
                }

                if (!analysis) {
                    console.error("Gemini response structure:", JSON.stringify(geminiData, null, 2));
                    const finishReason = candidate?.finishReason;
                    if (finishReason === "MAX_TOKENS") {
                        return new Response(
                            JSON.stringify({ error: "La resposta és massa llarga. Redueix la quantitat de dades o augmenta maxOutputTokens." }),
                            { status: 500, headers: { "Content-Type": "application/json" } }
                        );
                    }
                    return new Response(
                        JSON.stringify({ error: `No s'ha pogut obtenir la resposta de Gemini. Finish reason: ${finishReason || "unknown"}` }),
                        { status: 500, headers: { "Content-Type": "application/json" } }
                    );
                }

                console.log("Anàlisi generada correctament amb Gemini");
            } catch (error: any) {
                console.error("Error inesperat amb Gemini:", error);
                return new Response(
                    JSON.stringify({ error: `Error amb Gemini API: ${error.message || "Error desconegut"}` }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        // Si no hi ha Gemini configurada, intentar amb OpenAI (només si està configurada)
        if (!analysis && openaiApiKey) {
            console.log("Utilitzant OpenAI API com a fallback...");
            const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "Ets un assistent personal de salut i benestar. Analitzes resums diaris d'activitats i dones feedback constructiu i positiu en català."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500,
                }),
            });

            if (!openaiResponse.ok) {
                const errorData = await openaiResponse.json().catch(() => ({ error: "Unknown error" }));
                return new Response(
                    JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || "Unknown error"}` }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }

            const openaiData = await openaiResponse.json();
            analysis = openaiData.choices[0]?.message?.content || "No s'ha pogut generar l'anàlisi.";
        }

        if (!analysis) {
            return new Response(
                JSON.stringify({ error: "No s'ha pogut generar l'anàlisi." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ analysis }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Error analyzing day:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error processing request" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

