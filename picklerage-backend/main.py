from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menu, tables, sessions, orders, kitchen, billing, waiter

app = FastAPI(title="Picklerage QR Ordering API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router, prefix="/api/menu", tags=["Menu"])
app.include_router(tables.router, prefix="/api/tables", tags=["Tables"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(kitchen.router, prefix="/api/kitchen", tags=["Kitchen"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(waiter.router, prefix="/api/waiter", tags=["Waiter"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Picklerage API is running"}
