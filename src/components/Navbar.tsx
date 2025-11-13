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
import { Bell, Sparkles, LogOut, User, Settings, Menu, X } from "lucide-react";
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
                            <Sparkles className="h-5 w-5 text-neutral-900" />
                            <span className="font-semibold text-neutral-900">Blog</span>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white shadow-sm">
            <div className="w-full flex justify-center">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-neutral-900" />
                        <a href="/" className="font-semibold text-neutral-900 hover:opacity-80 transition-opacity">
                            Blog
                        </a>
                    </div>

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
                                    <NavigationMenuItem>
                                        <NavigationMenuLink
                                            href="/dashboard"
                                            className={cn(
                                                "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 focus:outline-none"
                                            )}
                                        >
                                            Dashboard
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Right Side - Auth or User Menu */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Bell Icon with Badge - Hidden on mobile */}
                                <button className="hidden sm:block relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                                </button>

                                {/* User Avatar with Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                                <AvatarImage src="" alt={userName || "User"} />
                                                <AvatarFallback className="bg-neutral-200 text-neutral-900">
                                                    {userName?.charAt(0).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="hidden lg:block text-left">
                                                <div className="text-sm font-medium text-neutral-900">
                                                    {userName || "User"}
                                                </div>
                                                <div className="text-xs text-neutral-600">
                                                    {userRole || "User"}
                                                </div>
                                            </div>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-white border-neutral-200">
                                        <DropdownMenuLabel className="text-neutral-900">
                                            {userName || "User"}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-neutral-200" />
                                        <DropdownMenuItem className="text-neutral-700 hover:bg-neutral-100">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-neutral-700 hover:bg-neutral-100">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-neutral-200" />
                                        <DropdownMenuItem
                                            onClick={handleSignOut}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900"
                                    >
                                        <a href="/signin">Sign in</a>
                                    </Button>
                                    <Button
                                        variant="default"
                                        asChild
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <a href="/register">Sign up</a>
                                    </Button>
                                </div>
                                {/* Mobile menu button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="sm:hidden text-neutral-900 hover:bg-neutral-100"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="w-full flex justify-center sm:hidden border-t border-neutral-200 bg-white">
                    <div className="container px-4 py-4 space-y-2">
                        <a
                            href="/"
                            className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </a>
                        <a
                            href="/posts"
                            className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Posts
                        </a>
                        {isAuthenticated && (
                            <>
                                <a
                                    href="/sleep"
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Son
                                </a>
                                <a
                                    href="/meals"
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Àpats
                                </a>
                                <a
                                    href="/dashboard"
                                    className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </a>
                            </>
                        )}
                        {!isAuthenticated && (
                            <>
                                <div className="pt-2 border-t border-neutral-200">
                                    <a
                                        href="/signin"
                                        className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign in
                                    </a>
                                    <a
                                        href="/register"
                                        className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign up
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
