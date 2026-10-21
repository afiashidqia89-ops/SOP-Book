"use client";
// Halaman kelola SOP — unggah PDF baru, publikasi, arsip
import { FormEvent, useEffect, useState } from "react";
import { api, SopDocument, STATUS_STYLE } from "@/lib/api";
import { useAuth, canManageSop } from "@/lib/auth";

interface Category { id: number; code: string; name: string; }

export default function SopPage() {
  const { user } = useAuth();
  const [sops, setSops] = useState<SopDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadData = () => {
    api.get("/sops").then((r) => setSops(r.data.data)).catch(() => {});
    api.get("/categories").then((r) => setCategories(r.data.data)).catch(() => {});
  };
  useEffect(loadData, []);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setUploading(true);
    setMsg(null);
    try {
      await api.post("/sops", fd, { headers: { "Content-Type": "multipart/form-data" } });
      form.reset();
      setShowForm(false);
      setMsg("✅ SOP berhasil diunggah sebagai DRAFT. Publikasikan agar terunduh ke perangkat.");
      loadData();
    } catch (err: any) {
      setMsg("❌ " + (err.response?.data?.error?.message || "Gagal mengunggah"));
    } finally {
      setUploading(false);
    }
  }

  async function publish(id: number) {
    try {
      await api.post(`/sops/${id}/publish`);
      setMsg("🚀 SOP dipublikasikan — versi dinaikkan & siap di-sync aplikasi Android.");
      loadData();
    } catch (err: any) { setMsg("❌ " + (err.response?.data?.error?.message || "Gagal publikasi")); }
  }

  async function archive(id: number) {
    if (!confirm("Arsipkan SOP ini? Perangkat akan menghapusnya saat sync berikutnya.")) return;
    try {
      await api.patch(`/sops/${id}/archive`);
      setMsg("📦 SOP diarsipkan.");
      loadData();
    } catch (err: any) { setMsg("❌ " + (err.response?.data?.error?.message || "Gagal arsip")); }
  }

  const manage = canManageSop(user);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola SOP</h1>
          <p className="text-sm text-gray-500">Unggah dokumen PDF, publikasikan, dan kelola versi SOP.</p>
        </div>
        {manage && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Tutup" : "+ Unggah SOP"}
          </button>
        )}
      </div>

      {msg && <div className="card text-sm">{msg}</div>}

      {showForm && (
        <form onSubmit={onUpload} className="card grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Kode SOP *</label>
            <input name="code" className="input" placeholder="SOP-PN-001" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kategori *</label>
            <select name="categoryId" className="input" required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Judul SOP *</label>
            <input name="title" className="input" placeholder="SOP Panen Cut & Keep" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea name="description" className="input" rows={2} placeholder="Ringkasan isi SOP…" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">File PDF (maks. 25 MB) *</label>
            <input type="file" name="file" accept="application/pdf" className="input" required />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary" disabled={uploading}>{uploading ? "Mengunggah…" : "Unggah"}</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="pb-2">Kode</th><th className="pb-2">Judul</th><th className="pb-2">Kategori</th>
              <th className="pb-2">Versi</th><th className="pb-2">Status</th><th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sops.map((s) => (
              <tr key={s.id}>
                <td className="py-2 font-mono text-xs">{s.code}</td>
                <td className="py-2">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.fileName} {s.fileSize ? `• ${(s.fileSize / 1048576).toFixed(1)} MB` : ""}</p>
                </td>
                <td className="py-2 text-gray-500">{s.category?.name}</td>
                <td className="py-2">v{s.version}</td>
                <td className="py-2"><span className={`badge ${STATUS_STYLE[s.status]}`}>{s.status}</span></td>
                <td className="space-x-2 py-2">
                  {manage && s.status === "DRAFT" && <button onClick={() => publish(s.id)} className="btn-outline text-green-700">Publikasi</button>}
                  {manage && s.status === "PUBLISHED" && <button onClick={() => archive(s.id)} className="btn-outline text-red-600">Arsip</button>}
                </td>
              </tr>
            ))}
            {sops.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400">Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
