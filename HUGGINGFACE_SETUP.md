# 🆓 Free Hugging Face API Setup Guide

## Step 1: Get Your FREE API Key (No Credit Card Required!)

1. **Go to Hugging Face**: https://huggingface.co/
2. **Sign up** for a free account (or log in if you have one)
3. **Go to Settings**: Click your profile → Settings
4. **Access Tokens**: Click "Access Tokens" in the left menu
5. **Create New Token**:
   - Click "New token"
   - Name: `mlops-chatbot-api`
   - Type: **Read** (this is enough for inference API)
   - Click "Generate token"
6. **Copy the token** - You'll see something like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Save it immediately** - you won't see it again!

## Step 2: Add to Azure DevOps Pipeline

1. Go to your Azure DevOps pipeline
2. Click **Edit** → **Variables** (top right)
3. Click **New variable**:
   - **Name**: `HUGGINGFACE_API_KEY`
   - **Value**: Paste your token (starts with `hf_`)
   - ✅ **Check "Keep this value secret"**
   - Click **OK** → **Save**

## Step 3: Deploy!

The pipeline will automatically use Hugging Face API. No other changes needed!

## Available Free Models

You can change the model by setting `HUGGINGFACE_MODEL` in pipeline variables:

- `meta-llama/Llama-2-7b-chat-hf` (default) - Fast and good quality
- `mistralai/Mistral-7B-Instruct-v0.2` - Very fast
- `microsoft/DialoGPT-large` - Conversational
- `google/flan-t5-large` - Good for instructions

## Test Locally

1. Create a `.env` file:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

2. Run:
   ```bash
   npm install
   node server.js
   ```

3. Test at: http://localhost:3000

## Why Hugging Face?

✅ **100% FREE** - No credit card needed  
✅ **No usage limits** (reasonable rate limits)  
✅ **Multiple models** - Choose the best one  
✅ **Fast inference** - Good response times  
✅ **Production ready** - Used by thousands of apps  

## Troubleshooting

- **"Model is loading"**: Wait 30-60 seconds for first request (cold start)
- **Rate limit**: Free tier has limits, but very generous
- **Model not found**: Check the model name is correct

---

**Note**: The code automatically falls back to Gemini if Hugging Face fails (if GEMINI_API_KEY is set).
