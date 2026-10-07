from fastapi import APIRouter

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Metrics"])

@router.get("")
def get_dashboard_summary():
    return {
        "success": True,
        "metrics": {
            "totalRevenue": 43672.0,
            "pendingReceivables": 30172.0,
            "totalExpenses": 4850.0,
            "netProfit": 38822.0,
            "activeInvoicesCount": 2,
            "vendorsCount": 2,
            "customersCount": 2
        }
    }
