import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Product } from "../types";

export default function AdminProducts(){
  const [products, setProducts] = useState<Product[]>([]);
  const load = ()=> apiGet<Product[]>("/products?visible_only=false").then(setProducts).catch(console.error);
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Products</h3>
        <Link to="/secret-admin/products/new"><Button>Add Product</Button></Link>
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
