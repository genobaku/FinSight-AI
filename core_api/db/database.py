"""
SQLAlchemy Database Layer for Finsight Core API
Provides schema for documents, processing jobs, dynamic fields, tables, and audit logs.
Fully compatible with PostgreSQL / Supabase and local SQLite.
"""

import os
from datetime import datetime
import json
import uuid
from typing import Generator

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from core_api.core.config import settings

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class DocumentRecord(Base):
    __tablename__ = "core_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(64), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    stored_path = Column(String(512), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    format = Column(String(16), nullable=False)
    status = Column(String(32), default="uploaded", index=True)  # uploaded, processing, completed, failed
    document_type = Column(String(64), default="unknown")
    domain = Column(String(64), default="general")
    extraction_status = Column(String(32), default="needs_review")  # needs_review, verified, rejected
    raw_text = Column(Text, nullable=True)
    metadata_json = Column(Text, default="{}")
    warnings_json = Column(Text, default="[]")
    
    # Financial transaction categorization if applicable
    transaction_category = Column(String(64), nullable=True)
    transaction_confidence = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    fields = relationship("FieldRecord", back_populates="document", cascade="all, delete-orphan")
    tables = relationship("TableRecord", back_populates="document", cascade="all, delete-orphan")
    jobs = relationship("JobRecord", back_populates="document", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogRecord", back_populates="document", cascade="all, delete-orphan")

class FieldRecord(Base):
    __tablename__ = "core_fields"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("core_documents.id", ondelete="CASCADE"), index=True)
    label = Column(String(128), nullable=False)
    original_label = Column(String(128), nullable=True)
    value_json = Column(Text, nullable=False)  # JSON-encoded raw value to support strings, numbers, dicts
    data_type = Column(String(32), default="text")
    semantic_category = Column(String(64), default="general")
    confidence = Column(Float, nullable=True)
    verification_status = Column(String(32), default="pending")  # pending, verified, user_modified, rejected
    evidence_text = Column(Text, nullable=True)
    evidence_page = Column(Integer, default=1)
    bounding_box_json = Column(Text, nullable=True)  # JSON array of bbox coordinates

    document = relationship("DocumentRecord", back_populates="fields")

class TableRecord(Base):
    __tablename__ = "core_tables"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("core_documents.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), default="Table")
    headers_json = Column(Text, default="[]")
    rows_json = Column(Text, default="[]")
    evidence_json = Column(Text, nullable=True)

    document = relationship("DocumentRecord", back_populates="tables")

class JobRecord(Base):
    __tablename__ = "core_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("core_documents.id", ondelete="CASCADE"), index=True)
    owner_id = Column(String(64), nullable=False, index=True)
    status = Column(String(32), default="queued", index=True)  # queued, processing, completed, failed
    progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("DocumentRecord", back_populates="jobs")

class AuditLogRecord(Base):
    __tablename__ = "core_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("core_documents.id", ondelete="CASCADE"), index=True)
    actor_id = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)  # upload, extract, edit_field, verify, delete
    details_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow)

    document = relationship("DocumentRecord", back_populates="audit_logs")

# Database Engine & Session Factory
engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    engine_args["pool_pre_ping"] = True

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes tables on startup."""
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
