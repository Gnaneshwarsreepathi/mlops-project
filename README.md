# MLOps AI Assistant

Built an AI-powered assistant using Node.js and Google Gemini API.
Implemented CI/CD using Azure DevOps Pipelines and deployed the application to Azure App Service.

## Documentation

A detailed step-by-step deployment guide for this project is available here:

📄 [MLOps AI Assistant Azure DevOps CI/CD Deployment Guide](docs/MLOps_AI_Assistant_Deployment_Guide.docx)

This guide covers:
- Azure CLI authentication
- Azure App Service creation
- Azure DevOps Service Connections
- Azure Pipelines (YAML)
- CI/CD deployment workflow
- Application verification and troubleshooting

## Technologies Used

- Azure DevOps
- Azure App Service
- Azure Pipelines
- Node.js
- Express.js
- Google Gemini API
- Git
- CI/CD
- Linux
---

## Project Structure

```
├── server.js              # Express API server (Gemini integration)
├── package.json
├── public/
│   └── index.html         # Chat UI (served as static files)
├── azure-pipelines.yml    # CI/CD pipeline definition
├── web.config             # IISNode config (Windows App Service only)
└── .gitignore
```

## Architecture

User
  ↓
Frontend (HTML/CSS/JS)
  ↓
Node.js + Express API
  ↓
Google Gemini API
  ↓
Response to User

CI/CD:
Azure Repos
  ↓
Azure Pipelines
  ↓
Azure App Service

---


# Screenshots

## 1. Azure DevOps Service Connection

![Azure DevOps Service Connection](screenshots/image%201.png)

Created an Azure Resource Manager service connection to securely connect Azure DevOps with Azure resources.

---

## 2. Azure Pipeline YAML Configuration

![Azure Pipeline YAML](screenshots/image%202.png)

Azure DevOps pipeline configured using YAML for automated build and deployment.

---

## 3. Successful Azure Pipeline Deployment

![Pipeline Success](screenshots/image%203.png)

CI/CD pipeline successfully deployed the application to Azure App Service.

---

## 4. Azure App Service Overview

![Azure App Service Overview](screenshots/image%204.png)

Azure App Service configuration showing Node.js runtime, Linux hosting, and deployment details.

---

## 5. Azure App Service Running

![Azure App Service Running](screenshots/image%205.png)

Application hosted successfully on Azure App Service and accessible through the Azure Web App URL.

---

## 6. MLOps AI Assistant User Interface

![MLOps AI Assistant](screenshots/image%206.png)

Deployed MLOps AI Assistant web application integrated with Google Gemini API.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key
export GEMINI_API_KEY=your_key_here   # Linux/Mac
set GEMINI_API_KEY=your_key_here      # Windows CMD

# 3. Start the server
npm start                # production
npm run dev              # development (auto-reload)
```

Open `http://localhost:3000` in your browser.

---

## Azure Deployment Setup

### Quick Summary

| Step | What you do |
|---|---|
| 1 | Create DevOps project + repo, push code |
| 2 | Create Resource Group + App Service Plan + Web App (CLI or Portal) |
| 3 | Create Service Connection in Azure DevOps |
| 4 | Set `GEMINI_API_KEY` as a pipeline secret variable |
| 5 | Update `webAppName` in YAML, push → pipeline auto-runs |

Your app will be live at `https://<your-app-name>.azurewebsites.net` after the first successful pipeline run.

---

### Step 1 — Create Azure DevOps Repo & Push Code

#### Option A: Azure DevOps Web Console (Portal)

1. Go to **dev.azure.com** → your org → **New Project**
2. Give it a name (e.g., `mlops-ai-chatbot`) → **Create**
3. Go to **Repos** → click **Initialize** or follow the push instructions shown
4. Copy the remote URL shown on the page

Then in your local terminal:
```bash
git remote add origin https://dev.azure.com/<org>/mlops-ai-chatbot/_git/mlops-ai-chatbot
git push -u origin main
```

#### Option B: Azure DevOps CLI

```bash
# Install DevOps extension if not already
az extension add --name azure-devops

# Login
az devops login --org https://dev.azure.com/<your-org>

# Create project
az devops project create \
  --name "mlops-ai-chatbot" \
  --org https://dev.azure.com/<your-org>

# Set defaults
az devops configure --defaults \
  organization=https://dev.azure.com/<your-org> \
  project=mlops-ai-chatbot

# Create the repo
az repos create --name mlops-ai-chatbot

# Push your code
git remote add origin https://dev.azure.com/<your-org>/mlops-ai-chatbot/_git/mlops-ai-chatbot
git push -u origin main
```

---

### Step 2 — Create Azure App Service

#### Option A: Azure CLI (recommended)

```bash
# Login
az login

# Create Resource Group
az group create \
  --name rg-mlops-chatbot \
  --location eastus

# Create App Service Plan (Linux)
az appservice plan create \
  --name asp-mlops-chatbot \
  --resource-group rg-mlops-chatbot \
  --sku B1 \
  --is-linux

# Create Web App (Node 20 LTS)
az webapp create \
  --name mlops-chatbot-app \
  --resource-group rg-mlops-chatbot \
  --plan asp-mlops-chatbot \
  --runtime "NODE:20-lts"

# Set startup command
az webapp config set \
  --name mlops-chatbot-app \
  --resource-group rg-mlops-chatbot \
  --startup-file "node server.js"

# Set environment variables
az webapp config appsettings set \
  --name mlops-chatbot-app \
  --resource-group rg-mlops-chatbot \
  --settings GEMINI_API_KEY="your-api-key-here" NODE_ENV="production"
```

> The app name must be **globally unique** — it becomes `<name>.azurewebsites.net`

#### Option B: Azure Portal (Web Console)

1. Go to **portal.azure.com** → search **App Services** → **+ Create**
2. Fill in:
   - **Resource Group**: create new → `rg-mlops-chatbot`
   - **Name**: `mlops-chatbot-app` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 20 LTS
   - **OS**: Linux
   - **Region**: East US (or your nearest)
   - **Pricing plan**: B1 Basic (or F1 Free for testing)
3. Click **Review + Create** → **Create**
4. After creation → **Configuration** → **Application settings** → add `GEMINI_API_KEY`

---

### Step 3 — Create Azure DevOps Service Connection

Azure DevOps → **Project Settings → Service connections → New service connection**:
- Type: **Azure Resource Manager**
- Auth method: **Service principal (automatic)**
- Select your subscription and resource group
- Name it exactly: **`AzureServiceConnection`**
- Tick **Grant access permission to all pipelines** → **Save**

---

### Step 4 — Set Pipeline Secret Variable

**Pipelines** → your pipeline → **Edit** → **Variables** → **New variable**:
- Name: `GEMINI_API_KEY`
- Value: your Gemini API key
- Tick **Keep this value secret**
- Click **Save**

---

### Step 5 — Configure & Run the Pipeline

**A. Update `webAppName` in `azure-pipelines.yml`:**
```yaml
# line 25 — change this:
webAppName: '<YOUR-APP-SERVICE-NAME>'

# to your actual app name:
webAppName: 'mlops-chatbot-app'
```

**B. Create the pipeline in Azure DevOps:**
1. Go to **Pipelines → New pipeline**
2. Select **Azure Repos Git** → pick your repo
3. Select **Existing Azure Pipelines YAML file**
4. Choose `/azure-pipelines.yml` → **Continue** → **Run**

The pipeline will automatically build and deploy on every push to `main`.

---

## API Endpoints

| Endpoint     | Method | Description                     |
|-------------|--------|---------------------------------|
| `/`          | GET    | Serves the chat UI              |
| `/api/chat`  | POST   | Sends a message to Gemini       |
| `/health`    | GET    | Health check for App Service    |

### `/api/chat` Request Body

```json
{
  "message": "What is MLOps?",
  "history": [
    { "role": "user",  "content": "Hello" },
    { "role": "model", "content": "Hi! ..." }
  ]
}
```

---


