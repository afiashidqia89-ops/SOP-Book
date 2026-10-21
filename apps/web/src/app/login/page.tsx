"use client";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(nik, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Gagal login, periksa NIK & password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-palm-800 to-palm-600 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-palm-100 text-3xl">🌴</div>
          <h1 className="text-2xl font-bold text-palm-800">e-SOP Sawit</h1>
          <p className="mt-1 text-sm text-gray-500">Media SOP &amp; Instruksi Kerja Digital</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">NIK / Username</label>
            <input className="input" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="mis. admin" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
