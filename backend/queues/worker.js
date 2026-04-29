const { Worker } = require('bullmq');
const axios = require('axios');
const Application = require('../models/Application');
const { connection } = require('./documentQueue');

const worker = new Worker('documentVerificationQueue', async job => {
  const { applicationId, documentType, documentUrl, docId } = job.data;
  console.log(`Processing Job ${job.id} for Application: ${applicationId}`);

  try {
    // Ping FastAPI AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/api/ai/verify`, {
      document_url: documentUrl,
      document_type: documentType
    });

    const aiData = response.data.data;

    // Update the application based on AI outcome
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application Not Found');

    const docIndex = application.documents.findIndex(d => d._id.toString() === docId.toString());
    
    if (docIndex > -1) {
      if (aiData.isValid) {
        application.documents[docIndex].status = 'verified';
        application.documents[docIndex].extractedData = aiData.extracted_fields;
      } else {
        application.documents[docIndex].status = 'rejected';
      }
    }

    // Check if ALL documents for this application are verified
    const allVerified = application.documents.every(d => d.status === 'verified');
    const anyRejected = application.documents.some(d => d.status === 'rejected');

    if (allVerified) {
      application.status = 'AI Verified'; // Or go straight to Approved based on business logic!
    } else if (anyRejected) {
      application.status = 'Manual Review'; // Requires Tahsil intervention
    } else {
      application.status = 'In Progress'; // Wait for other docs
    }

    await application.save();
    console.log(`Application ${applicationId} status updated to: ${application.status}`);
    return aiData;

  } catch (err) {
    console.error(`Job ${job.id} failed:`, err.message);
    throw err; // BullMQ handles retries
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Worker Failed Job ${job.id}: ${err.message}`);
});
