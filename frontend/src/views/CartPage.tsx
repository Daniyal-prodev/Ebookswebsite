import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { Product } from "./types";
import { readCart, setQty, removeFromCart, clearCart } from "@/lib/cart";

type ViewItem = { product: Product; qty: number };

export default function CartPage(){
  const [items, setItems] = useState<ViewItem[]>([]);
  const navigate = useNavigate();

  const load = async ()=>{
    const ls = readCart();
    const filled: ViewItem[] = [];
    for (const it of ls) {
      try {
        const p = await apiGet<Product>(`/products/${it.id}`);
        filled.push({ product: p, qty: it.qty });
      } catch {}
    }
    setItems(filled);
  };

  useEffect(()=>{ load(); },[]);

  const effectivePrice = (p: Product)=> typeof p.sale_price_cents === "number" && p.sale_price_cents >= 0 ? p.sale_price_cents : p.price_cents;
  const total = items.reduce((s, it)=> s + effectivePrice(it.product) * it.qty, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-slate-600">
          Your cart is empty. <Link to="/catalog" className="text-pink-600 underline">Browse books</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map(({product, qty})=>(
              <div key={product.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                  {product.cover_image_url && <img src={product.cover_image_url} className="w-16 h-16 object-cover rounded" />}
                  <div>
                    <div className="font-semibold">{product.title}</div>
                    <div className="text-sm text-slate-500">${(effectivePrice(product)/100).toFixed(2)} each</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1"
                    value={qty}
                    min={1}
                    onChange={e=>{ setQty(product.id, Number(e.target.value)); load(); }}
                  />
                  <Button variant="outline" onClick={()=>{ removeFromCart(product.id); load(); }}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={()=>{ clearCart(); load(); }}>Clear Cart</Button>
            <div className="text-xl font-extrabold">Total: ${ (total/100).toFixed(2) }</div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={()=> navigate("/checkout")}>Proceed to Checkout</Button>
            <Button variant="outline" asChild><Link to="/catalog">Continue Shopping</Link></Button>
          </div>
        </>
      )}
    </div>
  );
}
