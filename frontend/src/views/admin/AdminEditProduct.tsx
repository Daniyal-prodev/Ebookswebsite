import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiAuthed, apiGet } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "../types";

export default function AdminEditProduct(){
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const token = localStorage.getItem("admin_token") || "";
  useEffect(()=>{
    apiGet<Product>(`/products/${id}`).then(setProduct).catch(console.error);
  },[id]);
  const save = async ()=>{
    if(!id || !product) return;
    const payload: any = {
      title: product.title,
      author: product.author,
      description: product.description,
      price_cents: product.price_cents,
      categories: product.categories,
      age_group: product.age_group,
      cover_image_url: product.cover_image_url,
      downloadable_asset_id: product.downloadable_asset_id,
      visible: product.visible,
      inventory: product.inventory ?? null,
      tags: product.tags || [],
      featured: !!product.featured,
      seo_title: product.seo_title || null,
      seo_description: product.seo_description || null,
      images: product.images || [],
      description_sections: product.description_sections || [],
      sale_price_cents: product.sale_price_cents ?? null,
      discount_percent: product.discount_percent ?? null,
    };
    await apiAuthed<Product>("PUT", `/admin/products/${id}`, payload, token);
    alert("Saved");
  }
  const delItem = async ()=>{
    if(!id) return;
    await apiAuthed<unknown>("DELETE", `/admin/products/${id}`, {}, token);
    history.back();
  }
  if(!product) return <div>Loading…</div>;
  return (
    <div className="space-y-3">
      <Input placeholder="Title" value={product.title} onChange={e=>setProduct({...product, title: e.target.value})} />
      <Input placeholder="Author" value={product.author} onChange={e=>setProduct({...product, author: e.target.value})} />
      <Input placeholder="Description" value={product.description} onChange={e=>setProduct({...product, description: e.target.value})} />
      <Input type="number" placeholder="Price (cents)" value={product.price_cents} onChange={e=>setProduct({...product, price_cents: Number(e.target.value)})} />
      <Input placeholder="Sale Price (cents, optional)" value={product.sale_price_cents ?? ""} onChange={e=>setProduct({...product, sale_price_cents: e.target.value === "" ? null : Number(e.target.value)})} />
      <Input placeholder="Discount Percent (0-100, optional)" value={product.discount_percent ?? ""} onChange={e=>setProduct({...product, discount_percent: e.target.value === "" ? null : Number(e.target.value)})} />
      <Input placeholder="Cover Image URL" value={product.cover_image_url || ""} onChange={e=>setProduct({...product, cover_image_url: e.target.value})} />
      <Input placeholder="Gallery Image URLs (comma-separated)" value={(product.images||[]).join(",")} onChange={e=>setProduct({...product, images: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} />
      <Input placeholder="Extra Description Sections (separate with | )" value={(product.description_sections||[]).join(" | ")} onChange={e=>setProduct({...product, description_sections: e.target.value.split("|").map(s=>s.trim()).filter(Boolean)})} />
      <Input placeholder="Categories (comma-separated)" value={product.categories.join(",")} onChange={e=>setProduct({...product, categories: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} />
      <Input placeholder="Tags (comma-separated)" value={(product.tags||[]).join(",")} onChange={e=>setProduct({...product, tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} />
      <Input placeholder="Age group e.g. 4-8" value={product.age_group || ""} onChange={e=>setProduct({...product, age_group: e.target.value})} />
      <Input placeholder="Inventory (optional)" value={product.inventory ?? ""} onChange={e=>setProduct({...product, inventory: e.target.value === "" ? null : Number(e.target.value)})} />
      <Input placeholder="Downloadable Asset ID" value={product.downloadable_asset_id || ""} onChange={e=>setProduct({...product, downloadable_asset_id: e.target.value})} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={!!product.visible} onChange={e=>setProduct({...product, visible: e.target.checked})} />
        <span>Visible</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={!!product.featured} onChange={e=>setProduct({...product, featured: e.target.checked})} />
        <span>Featured</span>
      </div>
      <Input placeholder="SEO Title" value={product.seo_title || ""} onChange={e=>setProduct({...product, seo_title: e.target.value})} />
      <Input placeholder="SEO Description" value={product.seo_description || ""} onChange={e=>setProduct({...product, seo_description: e.target.value})} />
      <div className="flex gap-3">
        <Button onClick={save}>Save</Button>
        <Button variant="destructive" onClick={delItem}>Delete</Button>
      </div>
    </div>
  )
}
