from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import APP_NAME
from app.database.init_db import init_database

from app.routers.scanner import router as scanner_router
from app.routers.printer import router as printer_router
from app.routers.dashboard import router as dashboard_router

from app.services.scheduler import start_scheduler

app = FastAPI(
    title=APP_NAME,
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():

    # สร้างตารางฐานข้อมูล (ถ้ายังไม่มี)
    init_database()

    # เริ่ม Auto Scan ทุก 5 นาที
    start_scheduler()


# ==========================
# API Routers
# ==========================

app.include_router(scanner_router)
app.include_router(printer_router)
app.include_router(dashboard_router)


# ==========================
# Root API
# ==========================

@app.get("/")
async def root():
    return {
        "project": APP_NAME,
        "status": "Running",
        "version": "1.0.0"
    }


# ==========================
# Health Check
# ==========================

@app.get("/health")
async def health():
    return {
        "status": "ok"
    }