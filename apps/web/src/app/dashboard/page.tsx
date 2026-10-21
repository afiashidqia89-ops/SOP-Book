"use client";
import { useEffect, useState } from "react";
import { api, SopDocument, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [sops, setSops] = useState<SopDocument[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get("/sops").then((r) => setSops(r.data.data)).catch(() => {});
    api.get("/users").then((r) => setUsers(r.data.data)).catch(() => {});
  }, []);

  const published = sops.filter((s) => s.status === "PUBLISHED");
  const draft = sops.filter((s) => s.status === "DRAFT");
  const activeUsers = users.filter((u) => u.isActive);

  const stats = [
    { label: "SOP Terpublikasi", value: published.length, icon: "✅" },
    { label: "SOP Draft", value: draft.length, icon: "📝" },
    { label: "Total Dokumen", value: sops.length, icon: "📄" },
    { label: "User Aktif", value: activeUsers.length, icon: "👥" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selamat datang, {user?.name} 👋</h1>
        <p className="text-sm text-gray-500">Ringkasan distribusi SOP perkebunan sawit Anda.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-3xl">{s.icon}</p>
            <p className="mt-2 text-3xl font-bold text-palm-700">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">SOP Terbaru Diperbarui</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="pb-2">Kode</th><th className="pb-2">Judul</th><th className="pb-2">Kategori</th><th className="pb-2">Versi</th><th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sops.slice(0, 8).map((s) => (
              <tr key={s.id}>
                <td className="py-2 font-mono text-xs">{s.code}</td>
                <td className="py-2">{s.title}</td>
                <td className="py-2 text-gray-500">{s.category?.name}</td>
                <td className="py-2">v{s.version}</td>
                <td className="py-2"><span className={`badge ${s.status === "PUBLISHED" ? "bg-green-100 text-green-800" : s.status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-600"}`}>{s.status}</span></td>
              </tr>
            ))}
            {sops.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-400">Belum ada SOP. Unggah dokumen pertama di menu Kelola SOP.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
