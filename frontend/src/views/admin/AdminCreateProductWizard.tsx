import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useNavigate } from "react-router-dom";

type Step = 1 | 2 | 3 | 4 | 5;

export default function AdminCreateProductWizard() {
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price_cents, setPrice] = useState<number | "">("");
  const [sale_price_cents, setSale] = useState<number | "">("");
  const [cover_image_url, setCover] = useState("");
  const [gallery_image_urls, setGallery] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const next = () => setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const submit = async () => {
    setLoading(true);
    const payload: any = {
      title,
      author,
      description,
      price_cents: typeof price_cents === "string" ? 0 : price_cents || 0,
      sale_price_cents: sale_price_cents === "" ? null : typeof sale_price_cents === "string" ? 0 : sale_price_cents,
      cover_image_url,
      gallery_image_urls: gallery_image_urls ? gallery_image_urls.split(",").map(s => s.trim()).filter(Boolean) : [],
      categories: categories ? categories.split(",").map(s => s.trim()).filter(Boolean) : [],
      visible,
    };
    try {
      await apiPost("/admin/products", payload, { admin: true });
      nav("/secret-admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Product</h1>
        <div className="text-sm text-slate-600">Step {step} of 5</div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Author</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={author} onChange={e=>setAuthor(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded bg-pink-600 text-white" onClick={next} disabled={!title}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea className="mt-1 w-full border rounded px-3 py-2 h-28" value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-pink-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Cover Image URL</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={cover_image_url} onChange={e=>setCover(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Gallery Image URLs (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={gallery_image_urls} onChange={e=>setGallery(e.target.value)} />
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-pink-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Price (cents)</label>
              <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={price_cents} onChange={e=>setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Sale Price (cents)</label>
              <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={sale_price_cents} onChange={e=>setSale(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Categories (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={categories} onChange={e=>setCategories(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="vis" type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)} />
            <label htmlFor="vis" className="text-sm">Visible</label>
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-pink-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="text-slate-700 text-sm">
            <div><span className="font-semibold">Title:</span> {title}</div>
            <div><span className="font-semibold">Author:</span> {author}</div>
            <div className="line-clamp-3"><span className="font-semibold">Description:</span> {description}</div>
            <div><span className="font-semibold">Price:</span> {price_cents || 0}</div>
            <div><span className="font-semibold">Sale Price:</span> {sale_price_cents === "" ? "—" : sale_price_cents}</div>
            <div><span className="font-semibold">Cover:</span> {cover_image_url || "—"}</div>
            <div><span className="font-semibold">Gallery:</span> {gallery_image_urls || "—"}</div>
            <div><span className="font-semibold">Categories:</span> {categories || "—"}</div>
            <div><span className="font-semibold">Visible:</span> {visible ? "Yes" : "No"}</div>
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-pink-600 text-white" onClick={submit} disabled={loading}>{loading ? "Saving..." : "Submit"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
