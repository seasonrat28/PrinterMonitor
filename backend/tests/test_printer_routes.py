from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models.printer import Printer
from app.routers import printer as printer_router
from main import app

def build_client():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[printer_router.get_db] = override_get_db

    client = TestClient(app)
    return client


def test_printer_routes_for_ui_workflows():
    client = build_client()
    try:
        # Create a test DB session manually to add a printer
        db = next(app.dependency_overrides[printer_router.get_db]())
        printer = Printer(ip_address="192.168.1.10", status="Unknown")
        db.add(printer)
        db.commit()
        db.refresh(printer)
        db.close()

        with patch("app.routers.printer.refresh_printer") as refresh_mock:
            refresh_mock.return_value = Printer(
                id=printer.id,
                ip_address="192.168.1.10", 
                status="Online",
                created_at=printer.created_at
            )

            refresh_response = client.post(f"/printers/{printer.id}/refresh")
            assert refresh_response.status_code == 200

            history_response = client.get(f"/printers/{printer.id}/history")
            assert history_response.status_code == 200

        add_response = client.post("/printers/add-by-ip", json={"ips": ["192.168.1.11"]})
        assert add_response.status_code == 200
        
        # Test delete by IP
        delete_response = client.delete("/printers/ip/192.168.1.11")
        assert delete_response.status_code == 200
    finally:
        app.dependency_overrides.clear()
        client.close()
