"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Memuat e-SOP Sawit…</p>
    </main>
  );
}
