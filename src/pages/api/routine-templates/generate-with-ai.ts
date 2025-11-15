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
        const { prompt, userGoals } = body;

        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
            return new Response(
                JSON.stringify({ error: "El prompt és obligatori" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const geminiApiKey = import.meta.env.GEMINI_API_KEY;
        const openaiApiKey = import.meta.env.OPENAI_API_KEY;

        if (!geminiApiKey && !openaiApiKey) {
            return new Response(
                JSON.stringify({ error: "No s'ha configurat cap clau API d'IA. Configura GEMINI_API_KEY o OPENAI_API_KEY." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Construir el prompt per a la IA
        const aiPrompt = `Ets un entrenador personal expert. L'usuari vol crear una rutina d'entrenament amb aquestes especificacions:

${prompt}

${userGoals ? `Objectius de l'usuari: ${userGoals}` : ''}

Crea una rutina d'entrenament estructurada. Respon ÚNICAMENT amb un JSON vàlid sense markdown ni explicacions addicionals. El JSON ha de tenir aquesta estructura:

{
  "name": "Nom descriptiu de la rutina",
  "description": "Breu descripció de la rutina",
  "routine_type": "gym" | "running" | "athletics" | "steps" | "football_match" | "yoyo_test",
  "notes": "Notes addicionals sobre la rutina",
  "data": {
    // Si routine_type és "gym":
    "exercises": [
      {
        "exercise_name": "Nom de l'exercici",
        "sets": [
          {
            "reps": 10,
            "weight_kg": 50,
            "rest_seconds": 60
          }
        ]
      }
    ],
    "total_duration_minutes": 60
    // Si routine_type és "running":
    // "distance_km": 5.0,
    // "duration_minutes": 30,
    // "pace_per_km": "6:00"
    // Si routine_type és "athletics":
    // "series": [
    //   {
    //     "distance": "100m",
    //     "time": "12.5s",
    //     "rest": "2min"
    //   }
    // ]
    // Si routine_type és "steps":
    // "steps_count": 10000
    // Si routine_type és "football_match":
    // "total_kms": 8.5,
    // "calories": 650
    // Si routine_type és "yoyo_test":
    // "series": [
    //   {
    //     "start_level": "0",
    //     "end_level": "19.2",
    //     "completed": true
    //   }
    // ]
  }
}

IMPORTANT: 
- Respon només amb el JSON, sense markdown, sense explicacions
- El routine_type ha de ser un dels valors vàlids
- Per gym, inclou exercicis comuns com "Press de banca", "Sentadillas", "Peso muerto", "Press militar", etc.
- Per running, inclou distància, durada i ritme realistes
- Sigues específic i realista amb les dades`;

        let aiResponse: any = null;
        let errorMessage = "";

        // Intentar primer amb Gemini
        if (geminiApiKey) {
            try {
                console.log("Cridant a Gemini API per generar rutina...");

                // Primer, llistar models disponibles i filtrar els que suporten generateContent
                let modelsToTry: Array<{ model: string; version: string }> = [];

                try {
                    // Provar amb v1beta primer
                    const listResponseV1Beta = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
                    );
                    if (listResponseV1Beta.ok) {
                        const modelsList = await listResponseV1Beta.json();
                        const models = modelsList.models || [];
                        console.log("Models disponibles (v1beta):", models.map((m: any) => m.name));

                        // Filtrar models que suporten generateContent
                        const supportedModels = models.filter((m: any) =>
                            m.supportedGenerationMethods?.includes("generateContent") ||
                            m.name.includes("gemini")
                        );

                        for (const model of supportedModels.slice(0, 5)) {
                            const modelName = model.name.split("/").pop() || model.name;
                            if (!modelsToTry.find(m => m.model === modelName && m.version === "v1beta")) {
                                modelsToTry.push({ model: modelName, version: "v1beta" });
                            }
                        }
                    }
                } catch (e) {
                    console.log("No s'han pogut llistar els models v1beta");
                }

                try {
                    // Provar amb v1 també
                    const listResponseV1 = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`
                    );
                    if (listResponseV1.ok) {
                        const modelsList = await listResponseV1.json();
                        const models = modelsList.models || [];
                        console.log("Models disponibles (v1):", models.map((m: any) => m.name));

                        const supportedModels = models.filter((m: any) =>
                            m.supportedGenerationMethods?.includes("generateContent") ||
                            m.name.includes("gemini")
                        );

                        for (const model of supportedModels.slice(0, 5)) {
                            const modelName = model.name.split("/").pop() || model.name;
                            if (!modelsToTry.find(m => m.model === modelName && m.version === "v1")) {
                                modelsToTry.push({ model: modelName, version: "v1" });
                            }
                        }
                    }
                } catch (e) {
                    console.log("No s'han pogut llistar els models v1");
                }

                // Si no hem trobat models, utilitzar models per defecte
                if (modelsToTry.length === 0) {
                    console.log("Utilitzant models per defecte");
                    modelsToTry = [
                        { model: "gemini-2.5-flash", version: "v1" },
                        { model: "gemini-1.5-flash", version: "v1" },
                    ];
                } else {
                    console.log("Models a provar:", modelsToTry);
                }

                const requestBody = {
                    contents: [{
                        parts: [{
                            text: aiPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4000, // Augmentat per assegurar respostes completes
                    }
                };

                for (const modelConfig of modelsToTry) {
                    try {
                        const modelUrl = `https://generativelanguage.googleapis.com/${modelConfig.version}/models/${modelConfig.model}:generateContent?key=${geminiApiKey}`;
                        console.log(`Intentant amb ${modelConfig.model} (${modelConfig.version})...`);

                        const response = await fetch(modelUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                                aiResponse = text;
                                console.log(`✓ Èxit amb ${modelConfig.model}`);
                                console.log("Resposta de Gemini:", text.substring(0, 200));
                                break;
                            }
                        } else {
                            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                            errorMessage = errorData.error?.message || errorData.error || "Unknown error";
                            console.log(`Error amb ${modelConfig.model}: ${errorMessage}`);
                        }
                    } catch (error: any) {
                        errorMessage = error.message || "Error desconegut";
                        console.log(`Excepció amb ${modelConfig.model}: ${errorMessage}`);
                    }
                }
            } catch (error: any) {
                console.error("Error inesperat amb Gemini:", error);
                errorMessage = error.message || "Error desconegut";
            }
        }

        // Si Gemini no ha funcionat, intentar amb OpenAI
        if (!aiResponse && openaiApiKey) {
            try {
                console.log("Cridant a OpenAI API per generar rutina...");
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
                                content: "Ets un entrenador personal expert. Respon ÚNICAMENT amb JSON vàlid sense markdown ni explicacions.",
                            },
                            {
                                role: "user",
                                content: aiPrompt,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 2000,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    aiResponse = data.choices?.[0]?.message?.content;
                    console.log("Resposta de OpenAI:", aiResponse?.substring(0, 200));
                } else {
                    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
                    errorMessage = errorData.error?.message || errorData.error || "Unknown error";
                    console.error("Error amb OpenAI:", errorMessage);
                }
            } catch (error: any) {
                console.error("Error inesperat amb OpenAI:", error);
                errorMessage = error.message || "Error desconegut";
            }
        }

        if (!aiResponse) {
            let errorMsg = `No s'ha pogut generar la rutina amb cap model de Gemini.`;
            if (errorMessage) {
                errorMsg += ` Últim error: ${errorMessage}`;
            }
            errorMsg += ` Si us plau, verifica que la teva clau API sigui vàlida i que tingui accés als models de Gemini.`;

            return new Response(
                JSON.stringify({ error: errorMsg }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Netejar la resposta (eliminar markdown si n'hi ha)
        let cleanedResponse = aiResponse.trim();
        if (cleanedResponse.startsWith("```json")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
        }

        // Intentar trobar el JSON dins de la resposta (potser hi ha text abans o després)
        let jsonStart = cleanedResponse.indexOf("{");
        let jsonEnd = cleanedResponse.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }

        // Parsejar el JSON
        let routineData: any;
        try {
            routineData = JSON.parse(cleanedResponse);
        } catch (parseError: any) {
            console.error("Error parsejant JSON:", parseError);
            console.error("Resposta completa de la IA:", aiResponse);
            console.error("Resposta netejada:", cleanedResponse);

            // Intentar reparar JSON incomplet (afegir tancaments si falten)
            try {
                // Si falta el tancament, intentar afegir-lo
                if (!cleanedResponse.endsWith("}")) {
                    // Comptar les claus obertes i tancades
                    const openBraces = (cleanedResponse.match(/{/g) || []).length;
                    const closeBraces = (cleanedResponse.match(/}/g) || []).length;
                    const missingBraces = openBraces - closeBraces;

                    if (missingBraces > 0) {
                        cleanedResponse += "\n" + "}".repeat(missingBraces);
                        routineData = JSON.parse(cleanedResponse);
                        console.log("JSON reparat amb èxit");
                    } else {
                        throw new Error("No es pot reparar el JSON");
                    }
                } else {
                    throw parseError;
                }
            } catch (repairError) {
                return new Response(
                    JSON.stringify({
                        error: `La IA no ha retornat un JSON vàlid. Error: ${parseError.message}. Resposta: ${cleanedResponse.substring(0, 300)}...`
                    }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }
        }

        // Validar i estructurar les dades
        if (!routineData.name || !routineData.routine_type) {
            return new Response(
                JSON.stringify({ error: "La resposta de la IA no conté els camps necessaris (name, routine_type)" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Construir l'objecte de plantilla segons el tipus
        const templateData: any = {
            name: routineData.name,
            description: routineData.description || "",
            routine_type: routineData.routine_type,
            notes: routineData.notes || "",
            is_favorite: false,
        };

        // Afegir les dades específiques del tipus
        if (routineData.routine_type === "gym" && routineData.data?.exercises) {
            // Per gym, intentem mapejar els noms d'exercicis amb els IDs de la base de dades
            // Primer obtenim els exercicis disponibles
            const { data: exercises } = await supabase
                .from("exercises")
                .select("id, name")
                .eq("is_default", true);

            const exerciseMap = new Map<string, string>();
            if (exercises) {
                exercises.forEach((ex: any) => {
                    exerciseMap.set(ex.name.toLowerCase(), ex.id);
                });
            }

            templateData.gym_data = {
                exercises: routineData.data.exercises.map((ex: any) => {
                    const exerciseName = ex.exercise_name || ex.name || "";
                    // Buscar l'exercici per nom (case-insensitive i parcial)
                    let exerciseId: string | null = null;
                    if (exercises) {
                        const found = exercises.find((e: any) =>
                            e.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
                            exerciseName.toLowerCase().includes(e.name.toLowerCase())
                        );
                        exerciseId = found?.id || null;
                    }

                    return {
                        exercise_id: exerciseId || undefined, // Si no es troba, serà undefined i el formulari el gestionarà
                        exercise_name: exerciseName,
                        sets: (ex.sets || []).map((set: any) => ({
                            reps: set.reps || 0,
                            weight_kg: set.weight_kg !== undefined ? set.weight_kg : undefined,
                            rest_seconds: set.rest_seconds !== undefined ? set.rest_seconds : undefined,
                        })),
                    };
                }),
                total_duration_minutes: routineData.data.total_duration_minutes,
            };
        } else if (routineData.routine_type === "running" && routineData.data) {
            templateData.running_data = {
                distance_km: routineData.data.distance_km || 0,
                duration_minutes: routineData.data.duration_minutes || 0,
                pace_per_km: routineData.data.pace_per_km || "",
            };
        } else if (routineData.routine_type === "athletics" && routineData.data?.series) {
            templateData.athletics_data = {
                series: routineData.data.series,
            };
        } else if (routineData.routine_type === "steps" && routineData.data?.steps_count !== undefined) {
            templateData.steps_count = routineData.data.steps_count;
        } else if (routineData.routine_type === "football_match" && routineData.data) {
            templateData.football_match_data = {
                total_kms: routineData.data.total_kms || 0,
                calories: routineData.data.calories || 0,
            };
        } else if (routineData.routine_type === "yoyo_test" && routineData.data?.series) {
            templateData.yoyo_test_data = {
                series: routineData.data.series,
            };
        }

        return new Response(
            JSON.stringify({ data: templateData }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Error generant rutina amb IA:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Error desconegut" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

