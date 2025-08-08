from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Dict, List
from datetime import datetime
import uuid
import os
import hmac
import hashlib
from .schemas import Product, ProductCreate, ProductUpdate, LoginRequest, LoginResponse, OrderCreate, Order, PayoneerWebhook, CustomerSignup, CustomerLogin, CustomerMe
from .auth import authenticate, require_admin

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

_products: Dict[str, Product] = {}
_orders: Dict[str, Order] = {}
_customers: Dict[str, Dict[str, str]] = {}

CUSTOMER_SECRET = os.getenv("CUSTOMER_SECRET", os.getenv("ADMIN_SECRET", "change-me"))

def _sign_customer(email: str) -> str:
    sig = hmac.new(CUSTOMER_SECRET.encode(), email.encode(), hashlib.sha256).hexdigest()
    return f"{email}.c.{sig}"

def _verify_customer(token: str) -> str | None:
    try:
        email, kind, sig = token.split(".", 2)
    except ValueError:
        return None
    if kind != "c":
        return None
    expected = hmac.new(CUSTOMER_SECRET.encode(), email.encode(), hashlib.sha256).hexdigest()
    if hmac.compare_digest(sig, expected):
        return email
    return None

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    token = authenticate(payload.email, payload.password)
    return LoginResponse(access_token=token)

@app.post("/auth/customer/signup", response_model=LoginResponse)
def customer_signup(payload: CustomerSignup):
    if payload.email in _customers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account already exists")
    _customers[payload.email] = {"password": payload.password, "name": payload.name or ""}
    token = _sign_customer(payload.email)
    return LoginResponse(access_token=token)

@app.post("/auth/customer/login", response_model=LoginResponse)
def customer_login(payload: CustomerLogin):
    user = _customers.get(payload.email)
    if not user or user.get("password") != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = _sign_customer(payload.email)
    return LoginResponse(access_token=token)

@app.get("/me", response_model=CustomerMe)
def me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = _verify_customer(credentials.credentials)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    user = _customers.get(email, {})
    return CustomerMe(email=email, name=user.get("name") or None)

@app.post("/contact")
def contact():
    return {"ok": True}

@app.get("/products", response_model=List[Product])
def list_products(visible_only: bool = True):
    products = list(_products.values())
    if visible_only:
        products = [p for p in products if p.visible]
    return products

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    if product_id not in _products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    prod = _products[product_id]
    if not prod.visible:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not available")
    return prod

@app.post("/admin/products", response_model=Product)
def create_product(payload: ProductCreate, _: bool = Depends(require_admin)):
    now = datetime.utcnow()
    pid = str(uuid.uuid4())
    prod = Product(id=pid, created_at=now, updated_at=now, **payload.model_dump())
    _products[pid] = prod
    return prod

@app.put("/admin/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate, _: bool = Depends(require_admin)):
    if product_id not in _products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    existing = _products[product_id]
    data = existing.model_dump()
    for k, v in payload.model_dump(exclude_unset=True).items():
        data[k] = v
    data["updated_at"] = datetime.utcnow()
    updated = Product(**data)
    _products[product_id] = updated
    return updated

@app.delete("/admin/products/{product_id}")
def delete_product(product_id: str, _: bool = Depends(require_admin)):
    if product_id not in _products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    del _products[product_id]
    return {"ok": True}

@app.post("/orders", response_model=Order)
def create_order(payload: OrderCreate):
    total = 0
    for item in payload.items:
        if item.product_id not in _products:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product in cart")
        prod = _products[item.product_id]
        if not prod.visible:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product not available")
        base_price = prod.price_cents
        sale_price = prod.sale_price_cents if prod.sale_price_cents is not None and prod.sale_price_cents >= 0 else None
        price = sale_price if sale_price is not None else base_price
        total += price * item.quantity
    oid = str(uuid.uuid4())
    order = Order(
        id=oid,
        items=payload.items,
        total_cents=total,
        status="pending",
        created_at=datetime.utcnow(),
        download_tokens=[],
    )
    _orders[oid] = order
    return order

@app.post("/payments/payoneer/checkout-intent")
def payoneer_checkout_intent(payload: OrderCreate):
    merchant_id = os.getenv("PAYONEER_MERCHANT_ID", "")
    api_key = os.getenv("PAYONEER_API_KEY", "")
    api_secret = os.getenv("PAYONEER_API_SECRET", "")
    if not merchant_id or not api_key or not api_secret:
        return {"status": "disabled", "message": "Payoneer not configured", "redirect_url": None}
    fake_redirect = f"https://payoneer.example/checkout/{uuid.uuid4()}"
    return {"status": "ok", "redirect_url": fake_redirect}

@app.post("/webhooks/payoneer")
async def payoneer_webhook(request: Request):
    secret = os.getenv("PAYONEER_WEBHOOK_SECRET", "")
    body = await request.body()
    signature = request.headers.get("X-Payoneer-Signature", "")
    if secret:
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature or "", expected):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    return {"ok": True}

@app.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: str):
    if order_id not in _orders:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _orders[order_id]
