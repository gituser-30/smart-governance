const Application = require('../models/Application');
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
    return response.data; // Expected: { success: true, data: { isValid, rejectionReason, extractedData } }
  } catch (err) {
    console.error("AI Service Error:", err.message);
    throw new Error('AI Service is currently unavailable. Please try again later.');
  }
};

// @desc    Pre-validate documents using AI before submission
// @route   POST /api/applications/analyze
exports.analyzeDocuments = async (req, res, next) => {
  try {
    const { certificateType } = req.body;
    let docTypes = req.body.documentTypes || [];
    if (!Array.isArray(docTypes)) docTypes = [docTypes];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No documents uploaded' });
    }

    let uploadedDocs = [];
    let aggregatedExtractedData = {};

    // 1. Upload to Cloudinary & AI Validate
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const assignedType = docTypes[i] || file.originalname;

      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = 'data:' + file.mimetype + ';base64,' + b64;

      let documentUrl = dataURI;
      // Only upload to Cloudinary if real keys are provided
      if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'placeholder_api_key') {
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          resource_type: 'auto',
          folder: 'smart-governance/temp'
        });
        documentUrl = cldRes.secure_url;
      }

      const Jimp = require('jimp');

      // Local robust WASM OCR with Jimp Preprocessing
      let rawExtractedText = "Unreadable";
      let processedDataURI = dataURI;

      try {
        const base64Data = dataURI.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const image = await Jimp.read(imageBuffer);
        image.greyscale().contrast(0.6).normalize();
        if (image.getWidth() > 1500) {
          image.resize(1500, Jimp.AUTO);
        }
        // Compress aggressively to prevent BSON limits
        image.quality(40);

        const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        processedDataURI = 'data:image/jpeg;base64,' + processedBuffer.toString('base64');
      } catch (imgErr) {
        console.log("Jimp Error, falling back to raw image...");
      }

      try {
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(processedDataURI);
        rawExtractedText = ret.data.text;
        await worker.terminate();

        // If local Tesseract extracted poor/fragmented text (< 120 chars), it missed the name. Hit Cloud OCR.
        if (!rawExtractedText || rawExtractedText.trim().length < 120) {
          console.log("Local OCR fragmented text. Falling back to Cloud OCR.space for accurate Name/Data...");
          try {
            const ocrResponse = await axios.post('https://api.ocr.space/parse/image', new URLSearchParams({
              apikey: 'helloworld',
              base64Image: processedDataURI,
              language: 'eng'
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

            if (!ocrResponse.data.IsErroredOnProcessing && ocrResponse.data.ParsedResults?.length > 0) {
              rawExtractedText = ocrResponse.data.ParsedResults[0].ParsedText;
            }
          } catch (fallbackErr) {
            console.log("Cloud OCR Fallback failed:", fallbackErr.message);
          }
        }

        if (!rawExtractedText || rawExtractedText.trim().length < 2) {
          rawExtractedText = "OCR extracted no readable text. Document might be too blurry.";
        }
      } catch (e) {
        console.log("Local OCR Error:", e);
      }

      // 2. Pass to AI for Synchronous Semantic Check
      const aiResult = await verifyWithAI(documentUrl, assignedType, rawExtractedText);
      const aiData = aiResult.data || {};

      if (aiData.isValid === false) {
        return res.status(200).json({
          success: false,
          message: `AI Rejected Document (${assignedType})`,
          reason: aiData.rejectionReason || "Invalid document type or expired.",
          rejectedDocument: assignedType
        });
      }

      // Aggregate OCR fields intelligently to prioritize Aadhar details
      const extractedFields = aiData.extractedData || {};
      const isAadhar = assignedType.toLowerCase().includes('aadhar');

      for (const key in extractedFields) {
        const value = extractedFields[key];
        if (value !== null && value !== "" && value !== undefined) {
          if (isAadhar) {
            aggregatedExtractedData[key] = value;
            aggregatedExtractedData[`${key}_source`] = 'aadhar';
          } else {
            // Do not overwrite if it came from Aadhar
            if (aggregatedExtractedData[`${key}_source`] !== 'aadhar') {
              aggregatedExtractedData[key] = value;
            }
          }
        }
      }

      // BSONObjectTooLarge Fix: Shrink base64 payload to <500kb before MongoDB save
      if (documentUrl === dataURI && processedDataURI) {
        documentUrl = processedDataURI;
      }

      uploadedDocs.push({
        type: assignedType,
        url: documentUrl,
        status: 'verified',
        extractedData: aiData.extractedData || {}
      });
    }

    // 3. Return Success to Frontend for Final Form viewing
    res.status(200).json({
      success: true,
      message: 'Documents AI Verified Successfully',
      data: {
        documents: uploadedDocs,
        extractedFields: aggregatedExtractedData,
        certificateType
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// @desc    Submit final verified application
// @route   POST /api/applications/final-submit

//  ------------------------------------------------------
exports.finalSubmit = async (req, res, next) => {
  try {
    const { certificateType, documents, formFields } = req.body;

    // Duplicate Prevention
    const existingApp = await Application.findOne({
      user: req.user.id,
      certificateType,
      status: { $ne: 'Rejected' } // Allow if previous was rejected
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: `You already have an active or approved application for ${certificateType}.` });
    }

    if (!formFields?.area) {
      return res.status(400).json({ success: false, message: 'Area/Jurisdiction is required' });
    }

    const application = await Application.create({
      user: req.user.id,
      certificateType,
      area: formFields.area,
      status: 'Submitted',
      documents: documents, // These contain the URLs from the analyze step
      formFields: formFields || {}
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Final Application Submitted Successfully'
    });
  } catch (err) {
    console.error("FINAL SUBMIT CRASH:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// ---------------------------------------------------------

// @desc    Get current user's applications
// @route   GET /api/applications/my-applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin: Get all applications
// @route   GET /api/applications/all
exports.getAllApplications = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.area) {
       query.area = req.user.area; // Filter by Tahsildar's area
    }
    
    const applications = await Application.find(query).populate('user', 'fullName email').sort('-createdAt');
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin: Update status
// @route   PUT /api/applications/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get tracking status (Public/Citizen)
// @route   GET /api/applications/track/:trackingId
exports.trackStatus = async (req, res, next) => {
  try {
    const application = await Application.findOne({ trackingId: req.params.trackingId }).populate('user', 'fullName email');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Admin: Get specific user history
// @route   GET /api/applications/user-history/:userId
exports.getUserHistory = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.params.userId }).sort('-createdAt');
    // Optionally fetch grievances too
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
