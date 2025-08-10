import { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";

type Me = { email: string; name?: string | null; avatar_url?: string | null };

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    apiGetAuth<Me>("/me", token).then(setMe).catch(()=> window.location.href="/login");
  }, []);
  if (!me) return <div className="max-w-4xl mx-auto px-4 py-12">Loading…</div>;
  const [name, setName] = useState(me.name || "");
  const [avatar, setAvatar] = useState(me.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch((import.meta as any).env.VITE_API_URL + "/me/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, avatar_url: avatar }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMsg("Saved");
        setName(updated.name || "");
        setAvatar(updated.avatar_url || "");
        setMe(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = me.avatar_url && me.avatar_url.trim().length > 0 ? me.avatar_url : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(me.email)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-extrabold">My Account</h1>
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
        <img src={avatarSrc} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
        <div>
          <div className="font-semibold">{me.name || "Reader"}</div>
          <div className="text-slate-600">{me.email}</div>
        </div>
      </div>
      <form onSubmit={onSave} className="bg-white rounded-xl shadow p-6 space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={avatar} onChange={e=>setAvatar(e.target.value)} />
        </div>
        {msg && <div className="text-green-600 text-sm">{msg}</div>}
        <button disabled={saving} className="bg-pink-600 text-white rounded px-4 py-2">{saving ? "Saving..." : "Save changes"}</button>
      </form>
    </div>
  );
}
