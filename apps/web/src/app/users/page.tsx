"use client";
// Halaman kelola user — buat akun karyawan & atur role (khusus SUPERADMIN)
import { FormEvent, useEffect, useState } from "react";
import { api, User, ROLE_LABEL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/users").then((r) => setUsers(r.data.data)).catch(() => {});
  useEffect(load, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await api.post("/users", data);
      form.reset();
      setShowForm(false);
      setMsg("✅ User baru dibuat.");
      load();
    } catch (err: any) { setMsg("❌ " + (err.response?.data?.error?.message || "Gagal membuat user")); }
  }

  async function toggleActive(u: User) {
    try {
      await api.patch(`/users/${u.id}/status`, { isActive: !u.isActive });
      load();
    } catch (err: any) { setMsg("❌ " + (err.response?.data?.error?.message || "Gagal ubah status")); }
  }

  const isSuper = me?.role === "SUPERADMIN";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola User</h1>
          <p className="text-sm text-gray-500">Akun karyawan &amp; hak akses (Superadmin → Pekerja).</p>
        </div>
        {isSuper && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Tutup" : "+ User Baru"}</button>}
      </div>

      {msg && <div className="card text-sm">{msg}</div>}

      {showForm && (
        <form onSubmit={onCreate} className="card grid gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">NIK / Username *</label><input name="nik" className="input" required /></div>
          <div><label className="mb-1 block text-sm font-medium">Nama Lengkap *</label><input name="name" className="input" required /></div>
          <div><label className="mb-1 block text-sm font-medium">Password *</label><input name="password" type="password" className="input" required /></div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role *</label>
            <select name="role" className="input" required>
              {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Divisi</label><input name="division" className="input" placeholder="Panen" /></div>
          <div><label className="mb-1 block text-sm font-medium">Kebun / Afdeling</label><input name="estate" className="input" placeholder="Afd. I" /></div>
          <div className="md:col-span-2"><button className="btn-primary">Simpan User</button></div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr><th className="pb-2">NIK</th><th className="pb-2">Nama</th><th className="pb-2">Role</th><th className="pb-2">Divisi</th><th className="pb-2">Kebun</th><th className="pb-2">Status</th><th className="pb-2">Aksi</th></tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-2 font-mono text-xs">{u.nik}</td>
                <td className="py-2 font-medium">{u.name}</td>
                <td className="py-2 text-gray-500">{ROLE_LABEL[u.role]}</td>
                <td className="py-2 text-gray-500">{u.division || "-"}</td>
                <td className="py-2 text-gray-500">{u.estate || "-"}</td>
                <td className="py-2"><span className={`badge ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-500"}`}>{u.isActive ? "Aktif" : "Nonaktif"}</span></td>
                <td className="py-2">
                  {isSuper && u.id !== me?.id && (
                    <button onClick={() => toggleActive(u)} className="btn-outline">
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-400">Belum ada data user.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
