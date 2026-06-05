from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import document_processor

router = APIRouter()

from typing import Optional

class DocumentVerifyRequest(BaseModel):
    document_url: Optional[str] = None
    document_type: str
    extracted_text: str = ""

@router.post("/api/ai/verify")
async def verify_document(request: DocumentVerifyRequest):
    try:
        # Pass pre-extracted text and image URL directly to AI logic
        result = await document_processor.process_document_with_ai(request.document_type, request.extracted_text, request.document_url)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def health_check():
    return {"status": "AI Service Running"}
