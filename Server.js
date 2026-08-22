const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Mock PM GatiShakti & Socioeconomic Dataset (Real-world API integration target)
const DATASET_INDEX = [
  { state: "Bihar", district: "Purnia", infrastructureIndex: 3.2, povertyRate: 41.2, pmgsyRoadGapKm: 142 },
  { state: "Uttar Pradesh", district: "Sitapur", infrastructureIndex: 4.1, povertyRate: 32.8, pmgsyRoadGapKm: 88 },
  { state: "Assam", district: "Dhubri", infrastructureIndex: 2.8, povertyRate: 38.5, pmgsyRoadGapKm: 190 }
];

// 1. Process Voice / Text Citizen Feedback (Multilingual)
app.post('/api/feedback/process', upload.single('audio'), async (req, res) => {
  try {
    let rawInput = req.body.text;
    
    // If voice input is provided, send to Gemini Multimodal for transcription + translation
    if (req.file) {
      const audioPart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };
      const audioResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          'Transcribe this voice message verbatim and translate it to English. Format: {"transcription": "...", "english_text": "..."}',
          audioPart
        ],
        config: { responseMimeType: "application/json" }
      });
      const parsedAudio = JSON.parse(audioResponse.text);
      rawInput = parsedAudio.english_text;
    }

    // 2. Perform Structured Entity & Intent Extraction using Gemini
    const structPrompt = `
      Analyze the following citizen request in India:
      "${rawInput}"
      Extract structured metadata as JSON:
      {
        "category": "Roads/Water/Healthcare/Education/Electricity/Other",
        "urgency": "Low/Medium/High/Critical",
        "district": "Extracted district name or 'Unknown'",
        "state": "Extracted state name or 'Unknown'",
        "summary": "1 sentence English summary of grievance",
        "sentimentScore": Float between -1.0 (very negative) and 1.0 (positive)
      }
    `;

    const aiResult = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: structPrompt,
      config: { responseMimeType: "application/json" }
    });

    const parsedData = JSON.parse(aiResult.text);

    // 3. Match with National Datasets & Calculate Priority Index
    const geoData = DATASET_INDEX.find(d => 
      d.district.toLowerCase() === parsedData.district.toLowerCase()
    ) || DATASET_INDEX[0]; // Fallback mock match

    // Composite Priority Index Formula:
    // Urgency (0-4) * 0.3 + (10 - InfraIndex) * 0.4 + PovertyRate/10 * 0.3
    const urgencyWeight = { Low: 1, Medium: 2, High: 3, Critical: 4 }[parsedData.urgency] || 2;
    const priorityScore = (
      (urgencyWeight * 0.3) + 
      ((10 - geoData.infrastructureIndex) * 0.4) + 
      ((geoData.povertyRate / 10) * 0.3)
    ).toFixed(2);

    const record = {
      id: `FEEDBACK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      rawInput,
      ...parsedData,
      geoMetrics: geoData,
      calculatedPriorityScore: parseFloat(priorityScore)
    };

    res.status(200).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Synthesize High-Level National Priority Recommendations for Policy Makers
app.get('/api/policy/recommendations', async (req, res) => {
  const prompt = `
    Act as a Senior Infrastructure Advisor for the NITI Aayog / PM GatiShakti taskforce.
    Based on high priority citizen clusters in Purnia (Bihar) and Dhubri (Assam) regarding unpaved roads and hospital access, generate 3 actionable policy recommendations.
    Return JSON array of objects: [{"title": "", "sector": "", "estimatedCostINR": "", "impactScore": "", "justification": ""}]
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  res.json(JSON.parse(response.text));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`JanAawaaz Engine running on port ${PORT}`));
