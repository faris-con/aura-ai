# 🚀 AURA AI

### Multi-Model AI Platform for Intelligent Prediction, Detection & AI-Powered Explanations

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/TensorFlow-Deep%20Learning-orange?style=for-the-badge&logo=tensorflow" />
  <img src="https://img.shields.io/badge/XGBoost-Machine%20Learning-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Google-Gemini-8E75B2?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Deployment-Railway-purple?style=for-the-badge&logo=railway" />
</p>

<p align="center">
  <strong>AURA AI</strong> is a multi-model artificial intelligence platform that combines
  Machine Learning, Deep Learning, Computer Vision, and Generative AI
  into a unified application.
</p>

---

## 📌 Overview

AURA AI is a multi-model Artificial Intelligence platform developed as part of the Huawei AI Training Program.

The project combines multiple Artificial Intelligence technologies into one unified platform, including:

🤖 Machine Learning
🧠 Deep Learning
👁️ Computer Vision
✨ Generative AI
⚡ REST APIs
☁️ Cloud Deployment

AURA AI integrates three independent AI models, each designed for a different real-world problem, while Google Gemini provides natural-language explanations and conversational interaction with the model outputs.

🧠 AI Models
1. 💳 Credit Card Fraud Detection

A Machine Learning classification model designed to identify potentially fraudulent credit card transactions.

Model: XGBoost Classifier

Input:

Structured transaction data
CSV
Excel
Single transaction features

Output:

Fraud / Legitimate classification
Prediction probability

Accuracy: 99.98%

2. 🏠 House Price Prediction

A Regression model designed to estimate residential property prices based on property characteristics.

Model: Stacking Regressor Pipeline

The system performs feature engineering before generating the final prediction.

Feature Engineering

Examples include:

TotalSF
TotalPorchSF
TotalBath
HouseAge
RemodAge
Quality ordinal encoding

The model also applies the required inverse transformation to return predictions in the original price scale.

Accuracy: 94.5%

Output:

Estimated property price
Minimum predicted price
Maximum predicted price
Mean predicted price
Median predicted price
3. 🍅 Tomato Leaf Disease Detection

A Deep Learning Computer Vision model designed to classify tomato leaf images and identify potential diseases.

Architecture: DenseNet121-based CNN

The production deployment uses a TensorFlow Lite model optimized for deployment.

Input:

.jpg
.jpeg
.png
.webp

Images are resized and preprocessed before inference.

Output:

Predicted disease class
Confidence score
Top class probabilities

Accuracy: 99.5%

The model supports 10 tomato leaf classes.

✨ AURA AI — Gemini Integration

AURA AI also integrates Google Gemini as the Generative AI layer.

Gemini does not replace the machine-learning models.

Instead, the architecture separates:

Prediction → Explanation → Conversation

The ML/DL models are responsible for generating predictions, while Gemini explains those predictions in natural language.

For example:

Model:

Predicted House Price: $203,500

AURA:

Hi I am Aura 👋
The estimated property price is approximately $203,500 based on the provided property characteristics...

This separation keeps the model prediction authoritative while allowing users to interact with the result conversationally.

🏗️ System Architecture
                    ┌──────────────────────┐
                    │      AURA AI UI      │
                    │   Web Application    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │      REST API        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │    Fraud     │ │ House Price  │ │    Tomato    │
      │   XGBoost    │ │   Regression │ │  CNN / TFLite│
      └──────────────┘ └──────────────┘ └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Google Gemini     │
                    │ AI Explanation Layer │
                    └──────────────────────┘
⚡ Core Features
Multi-Model AI

Three different AI models are integrated into a single application.

Independent Model Workflows

Each model has its own input format and prediction workflow.

AI-Powered Explanations

Gemini converts technical model outputs into understandable explanations.

RESTful API

The entire AI backend is exposed through FastAPI endpoints.

Batch Prediction

The Fraud Detection and House Price modules support dataset-based predictions.

Computer Vision

The Tomato Disease module accepts real-world plant images.

Cloud Deployment

The backend is deployed as a production API using Railway.

🔌 API Endpoints
Fraud Detection
POST /predict/fraud
POST /api/predict/fraud

POST /predict/fraud/csv
POST /api/predict/fraud/csv

POST /predict/fraud/excel
POST /api/predict/fraud/excel
House Price Regression
POST /predict/house-price/csv
POST /api/predict/house-price/csv
Tomato Disease Detection
POST /predict/cnn/image
POST /api/predict/cnn/image
Gemini AI
POST /api/ai/analyze
POST /api/ai/analyze-regression
POST /api/ai/analyze-disease
🛠️ Technology Stack
Technology	Purpose
Python 3.13	Backend & AI
FastAPI	REST API
Scikit-learn	Machine Learning
XGBoost	Fraud Detection
TensorFlow	Deep Learning
TensorFlow Lite	CNN Deployment
DenseNet121	Image Classification
Google Gemini	Generative AI
JavaScript	Frontend Logic
Railway	Cloud Deployment
Joblib	Model Serialization
📁 Project Structure
nexa-ai-api/
│
├── api/
│   └── index.py
│
├── models/
│   ├── fraud_model.joblib
│   ├── fraud_scaler.joblib
│   ├── house_price_model.joblib
│   ├── house_price_model_info.joblib
│   ├── tomato_leaf_disease_model.tflite
│   └── tomato_class_names.json
│
├── js/
│   ├── api.js
│   ├── models.js
│   └── chat.js
│
├── test_api.py
├── requirements.txt
└── README.md
🔄 User Workflow
Fraud Detection
Upload Transaction Dataset
          ↓
Data Validation
          ↓
Feature Processing
          ↓
XGBoost Model
          ↓
Fraud Prediction
          ↓
Gemini Explanation
House Price Prediction
Upload Property Dataset
          ↓
Feature Engineering
          ↓
Regression Model
          ↓
Price Prediction
          ↓
Summary Statistics
          ↓
Gemini Explanation
Tomato Disease Detection
Upload Leaf Image
          ↓
Image Preprocessing
          ↓
TensorFlow Lite CNN
          ↓
Disease Classification
          ↓
Confidence Score
          ↓
Gemini Explanation & Plant Care
🧪 Testing & Validation

The backend includes automated tests covering the major AI workflows.

The test suite validates:

API availability
Health endpoints
Fraud prediction
Fraud CSV processing
Fraud Excel processing
Input validation
Missing columns
Non-numeric values
Empty files
Invalid file extensions
House Price regression
Tomato disease classification
Gemini fallback handling

All three core AI model workflows were successfully validated during development.

📊 Model Performance
Model	Task	Architecture	Accuracy
Fraud Detection	Classification	XGBoost	99.98%
House Price	Regression	Stacking Regressor	94.5%
Tomato Disease	Image Classification	DenseNet121 / TFLite	99.5%

Note: Reported performance values correspond to the evaluation performed during the project development/training process.

☁️ Deployment

The FastAPI backend is deployed on:

Railway

The deployment provides a production-ready API that can be consumed by the AURA AI frontend.

The architecture also separates sensitive configuration such as:

GEMINI_API_KEY

from the source code by using environment variables.

🔐 Security

Sensitive credentials are not hardcoded into the application source code.

Environment variables are used for protected configuration:

GEMINI_API_KEY=your_api_key

The API key should never be committed to GitHub.

🎯 Project Goals

AURA AI was built to demonstrate how different Artificial Intelligence techniques can work together inside one practical system.

The main goals were:

Build multiple real-world AI solutions.
Integrate Machine Learning and Deep Learning models.
Expose AI models through production APIs.
Integrate Generative AI with traditional ML workflows.
Build independent model-specific workflows.
Deploy the backend to the cloud.
Create a user-friendly interface for interacting with AI systems.
🎓 Huawei AI Training Project

This project was developed as part of the Huawei AI Training Program, combining the concepts and practical skills gained throughout the training into a single multi-model AI application.

👥 Team

This project was developed collaboratively by:

Team Members

@YOUR_FRIEND_1
@YOUR_FRIEND_2
@YOUR_FRIEND_3
@YOUR_FRIEND_4
@YOUR_FRIEND_5

Instructor

@YOUR_INSTRUCTOR
🔗 Links
💻 Source Code

GitHub Repository:
[Add your GitHub repository link here]

🌐 Frontend Demo

Live Frontend:
[Add your frontend-only demo link here]

⚠️ The live demo above represents the frontend interface only. The production AI backend is deployed separately.

🚀 Future Improvements

Potential future improvements include:

Real-time model monitoring
More disease classes
Additional financial fraud patterns
Explainable AI visualizations
Advanced model analytics
User authentication
Prediction history
Database integration
Mobile application
More conversational Gemini capabilities
📜 License

This project was developed for educational and training purposes as part of the Huawei AI Training Program.

⭐ AURA AI

Predict. Detect. Explain.

A unified AI platform bringing together Machine Learning, Deep Learning, Computer Vision, and Generative AI in one application.
