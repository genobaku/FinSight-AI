from fastapi import APIRouter
from schemas.schemas import VendorCreateSchema

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])

@router.get("")
def get_vendors():
    return {"success": True, "vendors": []}

@router.post("")
def create_vendor(vendor: VendorCreateSchema):
    return {"success": True, "vendor": vendor}
