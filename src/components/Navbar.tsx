import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Activity, LogOut, User, Settings, Menu, X, Home, Moon, UtensilsCrossed, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const hasAccessToken = document.cookie
                    .split("; ")
                    .some((row) => row.startsWith("sb-access-token="));
                const hasRefreshToken = document.cookie
                    .split("; ")
                    .some((row) => row.startsWith("sb-refresh-token="));

                setIsAuthenticated(hasAccessToken && hasRefreshToken);

                // Obtenir dades de l'usuari si està autenticat
                if (hasAccessToken && hasRefreshToken) {
                    try {
                        const response = await fetch("/api/user");
                        if (response.ok) {
                            const userData = await response.json();
                            setUserEmail(userData.email);
                            setUserName(userData.name);
                            setUserRole(userData.role || "User");
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
        const interval = setInterval(checkAuth, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSignOut = () => {
        window.location.href = "/api/auth/signout";
    };

    if (isLoading) {
        return (
            <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white shadow-sm">
                <div className="w-full flex justify-center">
                    <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-neutral-900">FitTracker</span>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white shadow-sm backdrop-blur-sm bg-white/95">
                <div className="w-full flex justify-center">
                    <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <a href="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity group">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-neutral-900 hidden sm:inline-block">FitTracker</span>
                        </a>

                        {/* Navigation Links - Center */}
                        <NavigationMenu className="hidden md:flex">
                            <NavigationMenuList className="gap-1">
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        href="/"
                                        className={cn(
                                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none"
                                        )}
                                    >
                                        Home
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                {isAuthenticated && (
                                    <>
                                        <NavigationMenuItem>
                                            <NavigationMenuLink
                                                href="/sleep"
                                                className={cn(
                                                    "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none"
                                                )}
                                            >
                                                Son
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <NavigationMenuLink
                                                href="/meals"
                                                className={cn(
                                                    "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none"
                                                )}
                                            >
                                                Àpats
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    </>
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Right Side - Auth or User Menu */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isAuthenticated ? (
                                <>


                                    {/* User Avatar with Dropdown - Hidden on mobile */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="hidden sm:flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                                <Avatar className="h-9 w-9 border-2 border-neutral-200">
                                                    <AvatarImage src="" alt={userName || "User"} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                                        {userName?.charAt(0).toUpperCase() || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="hidden lg:block text-left">
                                                    <div className="text-sm font-semibold text-neutral-900">
                                                        {userName || "User"}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                        {userRole || "User"}
                                                    </div>
                                                </div>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-white border-neutral-200 shadow-lg">
                                            <DropdownMenuLabel className="text-neutral-900 font-semibold">
                                                {userName || "User"}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-neutral-200" />
                                            <DropdownMenuItem className="text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                Perfil
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Configuració
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-neutral-200" />
                                            <DropdownMenuItem
                                                onClick={handleSignOut}
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Tancar sessió
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Mobile menu button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="sm:hidden text-neutral-900 hover:bg-neutral-100 rounded-md"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        aria-label="Toggle menu"
                                    >
                                        {mobileMenuOpen ? (
                                            <X className="h-6 w-6" />
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="hidden sm:flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900"
                                        >
                                            <a href="/signin">Iniciar sessió</a>
                                        </Button>
                                        <Button
                                            variant="default"
                                            asChild
                                            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            <a href="/register">Registrar-se</a>
                                        </Button>
                                    </div>
                                    {/* Mobile menu button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="sm:hidden text-neutral-900 hover:bg-neutral-100 rounded-md"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        aria-label="Toggle menu"
                                    >
                                        {mobileMenuOpen ? (
                                            <X className="h-6 w-6" />
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </nav>

            {/* Mobile Menu - Outside nav for proper z-index */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] sm:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div className="fixed top-16 left-0 right-0 bottom-0 sm:hidden border-t border-neutral-200 bg-white shadow-xl z-[70] overflow-y-auto">
                        <div className="container px-4 py-6 space-y-1">
                            {/* User Info Section */}
                            {isAuthenticated && (
                                <div className="pb-4 mb-4 border-b border-neutral-200">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <Avatar className="h-12 w-12 border-2 border-neutral-200">
                                            <AvatarImage src="" alt={userName || "User"} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                                                {userName?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-base font-semibold text-neutral-900">
                                                {userName || "User"}
                                            </div>
                                            <div className="text-sm text-neutral-500">
                                                {userEmail || ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Links */}
                            <a
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Home className="h-5 w-5" />
                                Inici
                            </a>

                            {isAuthenticated && (
                                <>
                                    <a
                                        href="/sleep"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Moon className="h-5 w-5" />
                                        Son
                                    </a>
                                    <a
                                        href="/meals"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UtensilsCrossed className="h-5 w-5" />
                                        Àpats
                                    </a>
                                </>
                            )}

                            {/* Separator */}
                            {isAuthenticated && (
                                <div className="pt-4 mt-4 border-t border-neutral-200 space-y-1">
                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5" />
                                        Perfil
                                    </a>
                                    <a
                                        href="#"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="h-5 w-5" />
                                        Configuració
                                    </a>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5 text-red-600" />
                                        Tancar sessió
                                    </button>
                                </div>
                            )}

                            {/* Auth Buttons */}
                            {!isAuthenticated && (
                                <div className="pt-4 mt-4 border-t border-neutral-200 space-y-2">
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="w-full border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <a href="/signin">Iniciar sessió</a>
                                    </Button>
                                    <Button
                                        variant="default"
                                        asChild
                                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <a href="/register">Registrar-se</a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
