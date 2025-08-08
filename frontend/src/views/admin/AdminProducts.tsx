import { useEffect, useState } from "react";
import { apiAuthed, apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Product } from "../types";

export default function AdminProducts(){
  const [products, setProducts] = useState<Product[]>([]);
  const token = localStorage.getItem("admin_token") || "";
  const load = ()=> apiGet<Product[]>("/products?visible_only=false").then(setProducts).catch(console.error);
  useEffect(()=>{ load(); },[]);
  const add = async ()=>{
    const now = Date.now();
    await apiAuthed<Product>("POST", "/admin/products", {
      title: "Sample Book " + now,
      author: "Author",
      description: "A lovely story.",
      price_cents: 499,
      sale_price_cents: 399,
      discount_percent: 20,
      categories: ["fun"],
      age_group: "5-7",
      cover_image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop"
      ],
      description_sections: [
        "Chapter 1: Into the Forest",
        "Chapter 2: The Hidden Treehouse"
      ],
      visible: true,
      tags: ["adventure","kids"],
      featured: true
    }, token);
    load();
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Products</h3>
        <Button onClick={add}>Add Example</Button>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p=>(
          <Link key={p.id} to={`/secret-admin/products/${p.id}`} className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-slate-600">{p.author}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
