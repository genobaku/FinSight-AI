from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="admin")
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    company_name = Column(String, nullable=False)
    tax_registration_number = Column(String, nullable=True)
    company_address = Column(String, nullable=True)
    default_currency = Column(String, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("businesses.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    company = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    total_billed = Column(Numeric(15, 2), default=0.0)
    total_paid = Column(Numeric(15, 2), default=0.0)
    outstanding_balance = Column(Numeric(15, 2), default=0.0)
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("businesses.id", ondelete="CASCADE"))
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, default="General Vendor")
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    total_spent = Column(Numeric(15, 2), default=0.0)
    pending_payables = Column(Numeric(15, 2), default=0.0)
    risk_score = Column(String, default="Low")
    status = Column(String, default="Verified")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("businesses.id", ondelete="CASCADE"))
    invoice_number = Column(String, nullable=False, index=True)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    issue_date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    subtotal = Column(Numeric(15, 2), default=0.0)
    tax_total = Column(Numeric(15, 2), default=0.0)
    discount_total = Column(Numeric(15, 2), default=0.0)
    total = Column(Numeric(15, 2), default=0.0)
    status = Column(String, default="Pending")
    currency = Column(String, default="USD")
    notes = Column(String, nullable=True)
    payment_terms = Column(String, default="Net 30")
    items = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("businesses.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    vendor_id = Column(String, ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    vendor_name = Column(String, nullable=False)
    amount = Column(Numeric(15, 2), default=0.0)
    tax = Column(Numeric(15, 2), default=0.0)
    date = Column(String, nullable=False)
    payment_method = Column(String, default="Corporate Card")
    status = Column(String, default="Approved")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
