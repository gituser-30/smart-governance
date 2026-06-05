const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');
const Tesseract = require('tesseract.js');

// Helper to communicate with Python AI Service
const verifyWithAI = async (documentUrl, documentType, extractedText) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/ai/verify', {
      document_url: documentUrl,
      document_type: documentType,
      extracted_text: extractedText
    });
    return response.data;
  } catch (err) {
    console.error("AI Service Error:", err.message);
    throw new Error('AI Service is currently unavailable. Please try again later.');
  }
};

// @desc    Get user's stored vault documents
// @route   GET /api/documents/me
exports.getMyDocuments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('documents extractedData');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({
      success: true,
      data: {
        documents: user.documents || [],
        extractedData: user.extractedData || {}
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload and verify a document for the vault
// @route   POST /api/documents/upload
exports.uploadVaultDocument = async (req, res, next) => {
  try {
    const { docType } = req.body;
    if (!docType) return res.status(400).json({ success: false, message: 'Document type is required' });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No document uploaded' });
    }

    const file = req.files[0];
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;

    let documentUrl = dataURI;
    
    // Cloudinary upload
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'placeholder_api_key') {
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'smart-governance/vault'
      });
      documentUrl = cldRes.secure_url;
    }

    let rawExtractedText = "Unreadable";
    let isPdf = file.mimetype === 'application/pdf';

    if (isPdf) {
      console.log("Parsing PDF directly...");
      const pdfParse = require('pdf-parse');
      try {
        const pdfData = await pdfParse(file.buffer);
        rawExtractedText = pdfData.text;
      } catch (err) {
        console.log("PDF Parse Error:", err.message);
      }
    } else {
      // Jimp pre-processing for images
      const Jimp = require('jimp');
      let processedDataURI = dataURI;

      try {
        const base64Data = dataURI.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const image = await Jimp.read(imageBuffer);
        image.greyscale().contrast(0.2).normalize();
        if (image.getWidth() > 2000) image.resize(2000, Jimp.AUTO);
        image.quality(80);
        const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        processedDataURI = 'data:image/jpeg;base64,' + processedBuffer.toString('base64');
      } catch (imgErr) {
        console.log("Jimp Error:", imgErr.message);
      }

      // OCR Space API Fallback logic
      if (docType !== 'Passport Photo') {
        console.log("Attempting fast Cloud OCR...");
        try {
          const ocrResponse = await axios.post('https://api.ocr.space/parse/image', new URLSearchParams({
            apikey: 'helloworld',
            base64Image: processedDataURI,
            language: 'eng'
          }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

          if (!ocrResponse.data.IsErroredOnProcessing && ocrResponse.data.ParsedResults?.length > 0) {
            rawExtractedText = ocrResponse.data.ParsedResults[0].ParsedText;
          }
        } catch (cloudErr) {
          console.log("Cloud OCR failed:", cloudErr.message);
        }

        if (!rawExtractedText || rawExtractedText.trim().length < 10) {
          console.log("Cloud OCR failed. Falling back to local Tesseract...");
          const worker = await Tesseract.createWorker(['eng']); 
          const ret = await worker.recognize(processedDataURI);
          rawExtractedText = ret.data.text;
          await worker.terminate();
        }

        if (!rawExtractedText || rawExtractedText.trim().length < 2) {
          rawExtractedText = "OCR extracted no readable text. Document might be too blurry.";
        }
      }
    }

    // AI Verification
    let aiData = { isValid: true, extractedData: {} };
    let docStatus = 'verified';
    let aiRemark = null;

    if (docType !== 'Passport Photo') {
      let aiDocUrl = documentUrl;
      if (isPdf) {
         // Convert Cloudinary PDF URL to JPG so Groq Vision can read the scanned document!
         if (documentUrl.includes('cloudinary.com')) {
             aiDocUrl = documentUrl.replace(/\.pdf$/i, '.jpg');
         } else {
             aiDocUrl = null;
         }
      }
      const aiResult = await verifyWithAI(aiDocUrl, docType, rawExtractedText);
      aiData = aiResult.data || {};

      if (aiData.isValid === false) {
        docStatus = 'rejected';
        aiRemark = aiData.rejectionReason || "Invalid document type or expired.";
      }
    }

    // BSON Payload limits
    if (documentUrl === dataURI && processedDataURI) {
      documentUrl = processedDataURI;
    }

    // Update User
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove existing document of the same type if it exists
    user.documents = user.documents.filter(doc => doc.docType !== docType);
    
    // Add new document
    const newDoc = {
      docType: docType,
      url: documentUrl,
      status: docStatus,
      aiRemark: aiRemark,
      verifiedAt: docStatus === 'verified' ? new Date() : null
    };
    user.documents.push(newDoc);

    // If verified, merge extracted data (prioritize Aadhar if it's an Aadhar card)
    if (docStatus === 'verified' && aiData.extractedData) {
      const extractedFields = aiData.extractedData;
      const isAadhar = docType.toLowerCase().includes('aadhar');
      
      let currentData = user.extractedData ? Object.fromEntries(user.extractedData) : {};
      
      for (const key in extractedFields) {
        const value = extractedFields[key];
        if (value !== null && value !== "" && value !== undefined) {
          if (isAadhar) {
            currentData[key] = value;
            currentData[`${key}_source`] = 'aadhar';
          } else {
            if (currentData[`${key}_source`] !== 'aadhar') {
              currentData[key] = value;
            }
          }
        }
      }
      user.extractedData = currentData;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: docStatus === 'verified' ? 'Document verified and saved to vault' : 'Document rejected',
      data: {
        document: newDoc,
        extractedData: user.extractedData || {}
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
