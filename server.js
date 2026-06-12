require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are an expert AI teaching assistant created by Trainer Rajinikanth Vadla. 
Your role is to answer questions about the following topics comprehensively and clearly:

1. **MLOps (Machine Learning Operations)** — ML pipelines, model versioning, CI/CD for ML, drift detection, monitoring, model serving, feature stores, MLflow, Kubeflow, Azure ML, AWS SageMaker, GCP Vertex AI.

2. **AIOps (AI for IT Operations)** — Intelligent event correlation, anomaly detection in IT systems, predictive maintenance, incident management automation, log analytics with AI.

3. **LLMOps (Large Language Model Operations)** — LLM fine-tuning, prompt engineering, RAG (Retrieval-Augmented Generation), vector databases (Pinecone, Weaviate, ChromaDB), LLM evaluation, LangChain, LlamaIndex, model deployment for LLMs.

4. **AI Agents** — ReAct agents, tool use, function calling, multi-agent systems, AutoGen, CrewAI, LangGraph, agent memory, planning, reasoning, autonomous AI systems.

Guidelines:
- Provide detailed, educational answers with examples and code snippets when relevant.
- Use markdown formatting with headers, bullet points, and code blocks.
- If asked about something unrelated, kindly redirect the user to the above topics.
- Always be encouraging and supportive as an educator.
- Answer in a professional yet approachable teaching style.

IMPORTANT: Always end every response with this exact signature on a new line:
---
*— Trainer: Rajinikanth Vadla*`;

async function getHuggingFaceResponse(message, history) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }

  const model = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-2-7b-chat-hf';
  let conversationText = SYSTEM_PROMPT + '\n\n';
  
  if (history && history.length > 0) {
    history.forEach(msg => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
  }
  
  conversationText += `User: ${message}\nAssistant:`;

  const response = await axios.post(
    `https://router.huggingface.co/models/${model}`,
    {
      inputs: conversationText,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data && response.data[0] && response.data[0].generated_text) {
    return response.data[0].generated_text.trim();
  }
  throw new Error('Unexpected response format from Hugging Face');
}

async function getGeminiResponse(message, history) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: SYSTEM_PROMPT,
  });

  const chatHistory = (history || []).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let reply;
    
    try {
      if (process.env.GEMINI_API_KEY) {
        reply = await getGeminiResponse(message, history);
      } else if (process.env.HUGGINGFACE_API_KEY) {
        reply = await getHuggingFaceResponse(message, history);
      } else {
        return res.status(500).json({ 
          error: 'No AI API key configured. Please set GEMINI_API_KEY or HUGGINGFACE_API_KEY' 
        });
      }
    } catch (apiError) {
      if (process.env.GEMINI_API_KEY && process.env.HUGGINGFACE_API_KEY) {
        console.log('Gemini failed, trying Hugging Face fallback...');
        reply = await getHuggingFaceResponse(message, history);
      } else {
        throw apiError;
      }
    }

    reply += '\n\n---\n*— Trainer: Rajinikanth Vadla*';

    res.json({ reply });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI API',
      details: error.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MLOps AI Chatbot server running on port ${PORT}`);
});
