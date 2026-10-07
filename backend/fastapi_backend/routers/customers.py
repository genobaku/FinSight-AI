from fastapi import APIRouter
from schemas.schemas import CustomerCreateSchema

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("")
def get_customers():
    return {"success": True, "customers": []}

@router.post("")
def create_customer(customer: CustomerCreateSchema):
    return {"success": True, "customer": customer}
