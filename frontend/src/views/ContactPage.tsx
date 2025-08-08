import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch((import.meta as any).env.VITE_API_URL + "/contact", { method: "POST" });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold">Contact</h1>
      <p className="text-slate-700">We’d love to hear from you. Email: support@example.com</p>

      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Your Name</label>
          <input required className="mt-1 w-full border rounded px-3 py-2" placeholder="Jane Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input required type="email" className="mt-1 w-full border rounded px-3 py-2" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea required className="mt-1 w-full border rounded px-3 py-2 h-28" placeholder="How can we help?" />
        </div>
        <button disabled={loading} className="px-4 py-2 rounded bg-pink-600 text-white disabled:opacity-60">
          {loading ? "Sending..." : "Send message"}
        </button>
        {sent && <div className="text-green-600 text-sm">Thanks! We’ll get back to you shortly.</div>}
      </form>
    </div>
  );
}
