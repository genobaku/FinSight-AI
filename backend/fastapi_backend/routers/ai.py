from fastapi import APIRouter
from schemas.schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat_copilot(payload: AIChatRequest):
    return AIChatResponse(
        success=True,
        reply=f"FinSight AI Analysis: Received query '{payload.message}'. Operational expenses remain optimal with active receivables comfortably exceeding current liabilities."
    )
