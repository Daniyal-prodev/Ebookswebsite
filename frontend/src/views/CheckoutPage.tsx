import { useEffect, useState } from "react";
import type { Product } from "./types";
import { apiGet, apiAuthPost } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  useEffect(()=>{
    const items = JSON.parse(localStorage.getItem("cart") || "[]") as {id:string, qty:number}[];
    Promise.all(items.map(async it => ({ product: await apiGet<Product>(`/products/${it.id}`), qty: it.qty }))).then(setCart);
  },[]);
  const lineTotal = (p: Product, qty: number) => {
    const price = typeof p.sale_price_cents === "number" && p.sale_price_cents >= 0 ? p.sale_price_cents : p.price_cents;
    return price * qty;
  };
  const total = cart.reduce((s, it)=> s + lineTotal(it.product, it.qty), 0);
  const checkout = async ()=>{
    const items = cart.map(it => ({ product_id: it.product.id, quantity: it.qty }));
    const intent = await apiAuthPost<{status:string, redirect_url?: string, message?: string}>("/payments/payoneer/checkout-intent", { items });
    if (intent.redirect_url) {
      window.location.href = intent.redirect_url;
    } else {
      alert(intent.message || "Payment not configured");
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="space-y-3">
        {cart.map(({product, qty})=>(
          <div key={product.id} className="flex justify-between">
            <div>{product.title} × {qty}</div>
            <div>${(lineTotal(product, qty)/100).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 font-extrabold text-xl">Total: ${ (total/100).toFixed(2) }</div>
      <div className="mt-6 flex gap-3">
        <Button onClick={checkout}>Pay with Payoneer</Button>
        <Button variant="outline" asChild><Link to="/cart">Back to Cart</Link></Button>
      </div>
    </div>
  );
}
