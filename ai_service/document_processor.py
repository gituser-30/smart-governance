import os
import json
import asyncio
from groq import AsyncGroq

async def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in your .env or run your terminal with GROQ_API_KEY='your_key'")
    return AsyncGroq(api_key=api_key)

async def process_document_with_ai(document_type: str, extracted_raw_text: str, document_url: str = None) -> dict:
    """
    Takes pre-extracted robust OCR text from the backend and performs
    advanced semantic verification against the expected document template.
    """
    print(f"Processing Semantic Validation for '{document_type}' from Tesseract OCR...")
    print(f"Incoming Extracted Text: {extracted_raw_text[:150]}...")
    
    try:
        client = await get_groq_client()
        
        if not document_url and (not extracted_raw_text or len(extracted_raw_text) < 5 or "Unreadable" in extracted_raw_text):
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
        
        4. DATA EXTRACTION (DO NOT INVENT DATA. ONLY EXTRACT WHAT IS PRESENT):
           - fullName: Extract exact legal name.
           - idNumber: Extract exact certificate or ID numbers.
           - dob: Extract if present.
           - income: For Income certificates, extract the highest or most recent annual income value.
           - address: Extract any remaining address line.
           - gender: Extract gender (Male/Female/Other).
           - fatherName: Extract father's name if present.
           - motherName: Extract mother's name if present.
           - placeOfBirth: Extract place of birth if present.
           - village: Look for 'गाव', 'मुक्काम', or 'Village' and extract the village name.
           - taluka: Look for 'तहसील', 'ता.', 'तालुका', or 'Taluka' and extract the taluka name.
           - district: Look for 'जिल्हा', 'जि.', 'District' and extract the district name.
           - pincode: Extract 6-digit pincode if present.
        
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
                "gender": string or null,
                "fatherName": string or null,
                "motherName": string or null,
                "placeOfBirth": string or null,
                "village": string or null,
                "taluka": string or null,
                "district": string or null,
                "pincode": string or null
            }}
        }}
        """
        
        import re
        
        messages = []
        if document_url and document_url.startswith("http"):
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt + "\n\nCRITICAL: Analyze the attached image directly. Ignore OCR errors."},
                    {"type": "image_url", "image_url": {"url": document_url}}
                ]
            })
            model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
            response_format = None
        else:
            messages.append({
                "role": "user",
                "content": prompt
            })
            model_name = "llama-3.1-8b-instant"
            response_format = {"type": "json_object"}
            
        completion_args = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.1
        }
        if response_format:
            completion_args["response_format"] = response_format

        try:
            completion = await client.chat.completions.create(**completion_args)
        except Exception as api_err:
            print(f"Vision API Error ({model_name}): {str(api_err)}")
            print("Falling back to text-only model llama-3.1-8b-instant...")
            
            # Fallback to Text Model
            if "Unreadable" in extracted_raw_text:
                 return {
                    "isValid": False,
                    "rejectionReason": "Uploaded document appears unreadable. Please ensure the image is clear.",
                    "extractedData": {}
                 }
                 
            completion = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            model_name = "llama-3.1-8b-instant (Fallback)"
        raw_text = completion.choices[0].message.content
        print(f"Groq Semantic Response ({model_name}):", raw_text)
        
        # Regex to extract JSON if it was wrapped in markdown by Vision model
        json_match = re.search(r'\{.*\}', raw_text.replace('\n', ''), re.DOTALL)
        if json_match:
            raw_text = json_match.group(0)
            
        return json.loads(raw_text)
        
    except Exception as e:
        print(f"AI Processing Exception: {str(e)}")
        return {
            "isValid": False,
            "rejectionReason": f"Deep AI Error: {str(e)}",
            "extractedData": {}
        }
