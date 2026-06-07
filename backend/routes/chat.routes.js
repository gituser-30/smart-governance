const express = require('express');
const axios = require('axios');
const router = express.Router();

const SYSTEM_PROMPT = `You are GovAI, the intelligent assistant for the "Smart Governance" platform.
Your primary role is to help citizens navigate the platform, understand services, and troubleshoot issues.
You MUST ONLY answer questions related to the Smart Governance platform, its features, and government processes handled within it. If a user asks about anything else (e.g., general knowledge, coding, weather), politely decline and redirect them to platform-related topics.

Platform Information:
- Smart Governance is a digital portal for citizens to apply for certificates and lodge grievances.
- Certificates: Users can apply for documents like Domicile, Income Certificate, Caste Certificate, Non-Creamy Layer, etc., from the "Certificates" or "Dashboard" page. The process involves filling out a form, uploading required documents, and submitting.
- Track Status: Users can track the status of their certificate applications in the "My Certificates" or "Dashboard" section.
- Grievances: Users can lodge complaints or grievances regarding public services (e.g., Water Supply, Electricity, Roads) by going to the "Grievances" page and clicking "Lodge New Grievance".
- My Documents: Users can manage and view their uploaded or issued documents in the "My Documents" section.
- Settings: Users can update their profile in the "Settings" page.
- Admin Panel: There is an admin interface for officials to review applications, manage users, and resolve grievances.
- Support: For technical issues beyond your capability, advise the user to visit the "Help & Support" page.

Tone: Professional, helpful, concise, and empathetic. Use short and actionable answers.`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ success: false, message: 'GROQ API key is not configured' });
    }

    // Prepend system prompt
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.text
      }))
    ];

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const replyText = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      reply: replyText
    });
  } catch (error) {
    console.error('Chat API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate response. Please try again later.' 
    });
  }
});

module.exports = router;
