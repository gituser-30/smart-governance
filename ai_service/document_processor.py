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
        You are an elite Government Document Auditor and Forensic Expert. 
        The system is validating a claim that the uploaded document is a(n) '{document_type}'.
        
        We have extracted the following RAW TEXT from the user's image via Node.js WASM OCR:
        ---
        {extracted_raw_text}
        ---
        
        STRICT VALIDATION TASKS:
        1. DOCUMENT TYPE MATCH: Verify if the text contains markers unique to a(n) '{document_type}'. 
           - For Aadhar: Look for "Government of India", "Unique Identification Authority", or 12-digit number.
           - For PAN: Look for "Income Tax Department", "Permanent Account Number".
           - For Income/Domicile/EWS (Maharashtra): Look for "Government of Maharashtra", "Maharashtra State", "Tahsildar" (or 'Tahasil', 'Tahasildar'), "Office of the", or Marathi terms like 'तहसीलदार', 'उत्पन्नाचे', 'प्रमाणपत्र', 'दाखला', 'महाराष्ट्र'.
           - IMPORTANT: Many documents are in Marathi (Devnagari). The OCR might represent 'Tahsildar' as 'Tahasildar' or 'Tahasil'. 'Income Certificate' might appear as 'Utpannache Pramanpatra' or '3 Varshasathi'.
           - If markers for a completely different document (e.g. user uploaded a school ID) are found, set isValid to false.
        
        2. VALIDITY & EXPIRY: Look for dates. If a validity date like "31 March 2025" or "Valid Upto" is present, compare it to 2026-05-03. If it has passed, set isValid to false.
        
        3. ORIGINALITY: Check for "Signature Valid", "Digitally Signed", "QR Code", or official seal markers.
        
        4. DATA EXTRACTION:
           - fullName: Extract name (e.g., 'Sudesh Tukaram Mandhare'). Be aware of 'Shri/Smt' prefixes.
           - idNumber: Look for certificate numbers (e.g., '४१८०६०२५७४१' or '4180...').
           - dob: Extract if present.
           - income: For Income certificates, extract the highest or most recent annual income value (e.g., 6,64,932).
           - address: Extract village/city (e.g., 'Ambole', 'Sudhagad').
        
        Return RAW JSON exclusively. Absolutely no markdown wrappers.
        JSON format:
        {{
            "isValid": boolean,
            "rejectionReason": string or null,
            "extractedData": {{
                "fullName": string or null,
                "idNumber": string or null,
                "dob": string or null,
                "income": string or null,
                "address": string or null,
                "gender": string or null
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
