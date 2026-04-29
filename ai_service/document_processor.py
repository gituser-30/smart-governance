import os
import json
import asyncio
from groq import AsyncGroq

async def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env or run your terminal with GROQ_API_KEY='your_key'")
    return AsyncGroq(api_key=api_key)

async def process_document_with_ai(document_type: str, extracted_raw_text: str) -> dict:
    """
    Takes pre-extracted robust OCR text from the backend and performs
    advanced semantic verification against the expected document template.
    """
    print(f"Processing Semantic Validation for '{document_type}' from Tesseract OCR...")
    print(f"Incoming Extracted Text: {extracted_raw_text[:150]}...")
    
    try:
        client = await get_groq_client()
        
        if not extracted_raw_text or len(extracted_raw_text) < 5 or "Unreadable" in extracted_raw_text:
             return {
                "isValid": False,
                "rejectionReason": "Uploaded document appears unreadable or blank. Ensure the image is clear and contains text.",
                "extractedData": {}
             }
        
        prompt = f"""
        You are an elite Government Document Validator testing the system. 
        The user claims to have uploaded a(n) '{document_type}'.
        
        We have extracted the following RAW TEXT from their image via Node.js WASM OCR:
        ---
        {extracted_raw_text}
        ---
        
        Tasks:
        1. VALIDATE: The extracted text is from a local offline OCR engine and might be extremely scattered, noisy, or garbled. Be incredibly lenient with structural validation. If there is ANY indication of identity data, numbers, or if it isn't explicitly a different document, assume it IS a valid {document_type} and set isValid to true.
        2. Set isValid to true unless the text explicitly states it's the wrong document type.
        3. EXTRACT: Scrape the demographic and identifying data strictly from the text provided. Do NOT hallucinate or invent any data. Do NOT generate dummy names or fallback data. If a coherent Name, ID Number, or Date of Birth is present in the text, extract it. If it is illegible, missing, or obscured by heavy noise, you MUST return null for that specific field. It is better to return null than to guess a wrong name.
        
        Return RAW JSON exclusively. Absolutely no markdown wrappers.
        JSON format:
        {{
            "isValid": boolean,
            "rejectionReason": string or null,
            "extractedData": {{
                "fullName": "Extracted Name or null",
                "idNumber": "Document ID/Serial Number or null",
                "dob": "YYYY-MM-DD or null",
                "income": "Numeric value or null",
                "address": "Extracted address or null"
            }}
        }}
        """
        
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_json = completion.choices[0].message.content
        print("Groq Semantic Response:", raw_json)
        
        return json.loads(raw_json)
        
    except Exception as e:
        print(f"AI Processing Exception: {str(e)}")
        return {
            "isValid": False,
            "rejectionReason": f"Deep AI Error: {str(e)}",
            "extractedData": {}
        }
