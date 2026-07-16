from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.scanner import ping_host, scan_network
from app.services.scan_service import scan_and_save_multi
from app.core.config import DEFAULT_NETWORK, SCAN_END, SCAN_START

router = APIRouter(
    prefix="/scanner",
    tags=["Scanner"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/ping/{ip}")
def ping_ip(ip: str):
    return {
        "ip": ip,
        "online": ping_host(ip)
    }


@router.get("/scan")
def scan(
    network: str = Query(DEFAULT_NETWORK),
    start: int = Query(SCAN_START, ge=1, le=254),
    end: int = Query(SCAN_END, ge=1, le=254),
):
    if not network:
        raise HTTPException(400, "Please provide a network prefix, for example 192.168.1")
    try:
        return scan_network(network, start, end)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/scan-save")
def scan_save(
    network: str,
    start: int = Query(SCAN_START, ge=1, le=254),
    end: int = Query(SCAN_END, ge=1, le=254),
    db: Session = Depends(get_db)
):
    # รองรับทั้งวงเดียว "10.119.35" และหลายวงคั่นด้วย , เช่น "10.119.34,10.119.35,10.119.43"
    networks = [n.strip() for n in network.split(",") if n.strip()]
    if not networks:
        raise HTTPException(400, "Please provide a network prefix, for example 192.168.1")
    try:
        return scan_and_save_multi(db, networks, start, end)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
