from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Dict, List
from datetime import datetime
import uuid
import os
import hmac
import hashlib
import smtplib
import json
from email.mime.text import MIMEText
from .schemas import Product, ProductCreate, ProductUpdate, LoginRequest, LoginResponse, OrderCreate, Order, PayoneerWebhook, CustomerSignup, CustomerLogin, CustomerMe, ContactMessage
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
PRODUCTS_DB_PATH = os.getenv("PRODUCTS_DB_PATH", os.path.join(os.path.dirname(__file__), "products.json"))
PRODUCTS_HISTORY_PATH = os.getenv("PRODUCTS_HISTORY_PATH", os.path.join(os.path.dirname(__file__), "products_history.json"))

_public_messages: List[Dict[str, str]] = []
_product_history: Dict[str, List[Dict[str, str]]] = {}

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
def _save_products():
    try:
        data = {pid: p.model_dump() for pid, p in _products.items()}
        with open(PRODUCTS_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception:
        pass

def _load_products():
    try:
        if os.path.exists(PRODUCTS_DB_PATH):
            with open(PRODUCTS_DB_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
                for pid, pd in raw.items():
                    _products[pid] = Product(**pd)
    except Exception:
        pass

def _save_history():
    try:
        with open(PRODUCTS_HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(_product_history, f)
    except Exception:
        pass

def _load_history():
    try:
        if os.path.exists(PRODUCTS_HISTORY_PATH):
            with open(PRODUCTS_HISTORY_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
                for k, v in raw.items():
                    _product_history[k] = v
    except Exception:
        pass

_load_products()
_load_history()

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
def contact(payload: ContactMessage):
    recipient = os.getenv("CONTACT_RECIPIENT", os.getenv("ADMIN_EMAIL", "aribdaniyal88@gmail.com"))
    subject = f"[Contact] {payload.name} <{payload.email}>"
    body = f"Name: {payload.name}\nEmail: {payload.email}\n\nMessage:\n{payload.message}"
    host = os.getenv("SMTP_HOST", "")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME", "")
    password = os.getenv("SMTP_PASSWORD", "")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() != "false"

    if host and username and password:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = username
        msg["To"] = recipient
        with smtplib.SMTP(host, port, timeout=15) as server:
            if use_tls:
                server.starttls()
            server.login(username, password)
            server.sendmail(username, [recipient], msg.as_string())
    else:
        print("CONTACT EMAIL (dev fallback):", subject, body)
    return {"ok": True}
@app.get("/oauth/{provider}/start")
def oauth_start(provider: str):
    client_id = os.getenv(f"{provider.upper()}_CLIENT_ID", "")
    redirect_url = os.getenv(f"{provider.upper()}_REDIRECT_URL", "")
    if not client_id or not redirect_url:
        return {"status": "disabled"}
    auth_url = f"https://auth.example/{provider}?client_id={client_id}&redirect_uri={redirect_url}&response_type=code&scope=basic"
    return {"status": "ok", "auth_url": auth_url}

@app.get("/contact/public")
def list_public_messages():
    return _public_messages

@app.post("/contact/public")
def post_public_message(payload: ContactMessage):
    entry = {"name": payload.name, "email": payload.email, "message": payload.message, "created_at": datetime.utcnow().isoformat()}
    _public_messages.append(entry)
    return {"ok": True}

@app.get("/oauth/{provider}/callback")
def oauth_callback(provider: str, code: str | None = None, email: str | None = None):
    auto = os.getenv("OAUTH_DEV_AUTO_LOGIN", "false").lower() == "true"
    if auto and (email or code):
        user_email = email or f"user+{provider}@example.com"
        token = _sign_customer(user_email)
        return {"access_token": token}
    return {"status": "disabled"}


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
    _product_history.setdefault(pid, []).append({"action": "create", "at": now.isoformat(), "data": prod.model_dump()})
    try:
        data = {pid2: p.model_dump() for pid2, p in _products.items()}
        with open(PRODUCTS_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f)
        with open(PRODUCTS_HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(_product_history, f)
    except Exception:
        pass
    return prod

@app.put("/admin/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate, _: bool = Depends(require_admin)):
    if product_id not in _products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    existing = _products[product_id]
    before = existing.model_dump()
    data = existing.model_dump()
    for k, v in payload.model_dump(exclude_unset=True).items():
        data[k] = v
    data["updated_at"] = datetime.utcnow()
    updated = Product(**data)
    _products[product_id] = updated
    _product_history.setdefault(product_id, []).append({
        "action": "update",
        "at": data["updated_at"].isoformat() if hasattr(data["updated_at"], "isoformat") else str(data["updated_at"]),
        "before": before,
        "after": updated.model_dump(),
    })
    try:
        data2 = {pid2: p.model_dump() for pid2, p in _products.items()}
        with open(PRODUCTS_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data2, f)
        with open(PRODUCTS_HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(_product_history, f)
    except Exception:
        pass
    return updated

@app.delete("/admin/products/{product_id}")
def delete_product(product_id: str, _: bool = Depends(require_admin)):
    if product_id not in _products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    removed = _products[product_id].model_dump()
    del _products[product_id]
    _product_history.setdefault(product_id, []).append({"action": "delete", "at": datetime.utcnow().isoformat(), "before": removed})
    try:
        data2 = {pid2: p.model_dump() for pid2, p in _products.items()}
        with open(PRODUCTS_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data2, f)
        with open(PRODUCTS_HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump(_product_history, f)
    except Exception:
        pass
    return {"ok": True}

@app.get("/admin/products/{product_id}/history")
def product_history(product_id: str, _: bool = Depends(require_admin)):
    return _product_history.get(product_id, [])

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
