import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Mail, Lock, Github, Chrome, Loader2 } from "lucide-react";

export default function SignInForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            setError("Si us plau, omple tots els camps");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                body: formData,
            });

            if (response.redirected) {
                window.location.href = response.url;
            } else if (!response.ok) {
                const errorText = await response.text();
                setError(errorText || "Error en iniciar sessió");
            }
        } catch (err) {
            setError("Error de connexió. Si us plau, torna-ho a intentar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = (provider: string) => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/signin";
        
        const providerInput = document.createElement("input");
        providerInput.type = "hidden";
        providerInput.name = "provider";
        providerInput.value = provider;
        form.appendChild(providerInput);
        
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
            <Card className="w-full max-w-md shadow-xl border-neutral-200">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-neutral-900">
                        Inicia sessió
                    </CardTitle>
                    <CardDescription className="text-neutral-600">
                        Accedeix al teu compte de FitTracker
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-neutral-700 flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                Correu electrònic
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="el-teu@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-neutral-700 flex items-center gap-2"
                            >
                                <Lock className="h-4 w-4" />
                                Contrasenya
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Iniciant sessió...
                                </>
                            ) : (
                                "Iniciar sessió"
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-neutral-500">O continua amb</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuth("google")}
                            disabled={isLoading}
                            className="w-full border-neutral-300 hover:bg-neutral-50 h-11"
                        >
                            <Chrome className="h-5 w-5" />
                            <span className="hidden sm:inline">Google</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuth("github")}
                            disabled={isLoading}
                            className="w-full border-neutral-300 hover:bg-neutral-50 h-11"
                        >
                            <Github className="h-5 w-5" />
                            <span className="hidden sm:inline">GitHub</span>
                        </Button>
                    </div>

                    <div className="text-center text-sm text-neutral-600">
                        <span>No tens compte? </span>
                        <a
                            href="/register"
                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Registra't
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

