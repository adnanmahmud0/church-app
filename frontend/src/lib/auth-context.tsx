"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiFetch } from "./api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get("token");
      const isPublicRoute = pathname?.includes("/login") || pathname?.includes("/forgot-password") || pathname?.includes("/reset-password") || pathname?.includes("/share/legal") || pathname?.includes("/delete-account");

      if (token) {
        try {
          const res = await apiFetch("/user/profile");
          if (res?.data) {
            const userData = res.data.user || res.data;
            setUser({
              ...userData,
              avatar: userData.image || userData.avatar || "https://i.ibb.co/z5YHLV9/profile.png",
            });
          }
        } catch (error) {
          // If the token was actually cleared (e.g., due to a 401 auth error or failed refresh), redirect to login.
          // Otherwise, it was just a network error or 500 error, so don't forcefully log the user out.
          if (!Cookies.get("token")) {
            if (!isPublicRoute) {
              router.push("/login");
            }
          }
        }
      } else {
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [pathname, router]);

  const login = (token: string, refreshToken: string, userData: any) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    setUser({
      ...userData,
      avatar: userData.image || userData.avatar || "https://i.ibb.co/z5YHLV9/profile.png",
    });
    router.push("/"); // Redirect to the dashboard root after login
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
