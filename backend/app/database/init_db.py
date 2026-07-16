from sqlalchemy import inspect, text

from app.db.session import engine
from app.db.base import Base


def _migrate_missing_columns():
    """
    Lightweight auto-migration for SQLite: adds any columns that exist on the
    SQLAlchemy models but are missing from the actual table, so existing
    printer.db data survives when new fields are added to the models.
    """
    inspector = inspect(engine)
    if not inspector.has_table("printers"):
        return

    existing_columns = {col["name"] for col in inspector.get_columns("printers")}

    with engine.begin() as conn:
        for column in Base.metadata.tables["printers"].columns:
            if column.name in existing_columns:
                continue
            col_type = column.type.compile(engine.dialect)
            conn.execute(text(f'ALTER TABLE printers ADD COLUMN "{column.name}" {col_type}'))
            print(f"[DB MIGRATE] Added missing column: printers.{column.name}")


def init_database():
    Base.metadata.create_all(bind=engine)
    _migrate_missing_columns()