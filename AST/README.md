# Customer Churn Intelligence

> **Churn Prediction & Customer Segmentation Platform**  
> *A Production-Quality Full-Stack Machine Learning Web Application for Enterprise Predictive Analytics.*

---

## 📌 Executive Overview

**Customer Churn Intelligence** is a complete, enterprise-grade web application designed to help service-based organizations understand customer behavior, predict attrition risk, segment customers based on behavioral attributes, and deliver targeted retention strategies.

Built as a university Machine Learning assignment project based on a real-world telecommunications scenario, the platform demonstrates an end-to-end machine learning engineering pipeline:

```
[Dataset] ➔ [Validation] ➔ [Preprocessing Pipeline] ➔ [EDA] ➔ [Train/Test Split]
                                                                     │
 ┌───────────────────────────────────────────────────────────────────┴──────────────────────────────────┐
 │                                                                                                      │
 ▼                                                                                                      ▼
[Supervised Models Benchmarking]                                                       [Unsupervised K-Means Clustering]
 (Logistic Reg, Decision Tree, Random Forest,                                            (Elbow Method WSS, Silhouette Score)
  Gradient Boosting, KNN, Naive Bayes)                                                                  │
 │                                                                                                      ▼
 ▼                                                                                     [PCA 2D Customer Map Visualization]
[Model Evaluation & Confusion Matrix]                                                                   │
 │                                                                                                      ▼
 ▼                                                                                     [Cluster Profiling & Statistical Labels]
[Best Model Selection (F1-Score)]                                                                       │
 │                                                                                                      │
 └───────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                     ▼
                                     [Churn Risk Probability Inference]
                                                     │
                                                     ▼
                                 [High-Risk Queue & Data-Driven Retention]
```

---

## 🎨 Luxury Enterprise Design System

The application strictly adheres to an enterprise luxury visual language:
- **Primary Color Palette:** Deep Charcoal (`#171717`), Graphite (`#252525`), Warm Ivory (`#F6F3EC`), Soft White (`#FCFBF8`).
- **Accent Color:** Champagne Gold (`#B89B5E`), Muted Gold (`#8F7848`).
- **Semantic Indicators:** Deep Forest Green (`#1E4620`), Muted Amber (`#8A5B00`), Deep Burgundy (`#6B1D1D`), Steel Blue (`#1E3A5F`).
- **Typography:** Inter / Manrope clean sans-serif with tabular numeric formatting.
- **Strictly Excluded:** No neon colors, cyberpunk styling, glowing borders, or artificial AI chat elements.

---

## 🚀 Key Modules & Capabilities

1. **Executive Overview Dashboard:** High-level KPIs (Total Customers, Baseline Churn Rate, High-Risk Accounts Count, Customer Segments), Churn Distribution Donut, Contract Breakdown Bar Chart, Risk Proportions, Segment Summary, and Empirical Data-Derived Findings.
2. **Dataset & Preprocessing Workspace:** Dataset profile, IBM Telco Customer Churn source attribution, custom CSV upload capability, and live visual rendering of the 7-stage preprocessing pipeline (Missing Imputation, One-Hot Encoding, Identifier Removal, StandardScaler).
3. **Exploratory Data Analysis (EDA):** Interactive charts showing Tenure Distribution, Monthly Charges, Lifetime Spend, Churn by Payment Method, and a Pearson Correlation Matrix heatmap across top numerical features.
4. **Churn Prediction Workspace:**
   - **Individual Form Mode:** Structured customer inputs (Demographics, Subscribed Services, Contract & Billing) generating predicted churn probability %, risk score (`LOW`, `MEDIUM`, `HIGH`), key feature drivers, and retention advice.
   - **Batch CSV Mode:** Mass prediction inference on uploaded customer files with CSV export.
5. **Model Lab:** Trains and benchmarks 6 supervised classifiers (*Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, K-Nearest Neighbors, Naive Bayes*) using stratified 80/20 train/test splits. Provides interactive confusion matrix heatmaps (TN, FP, FN, TP) and dynamic best model selection based on F1-Score.
6. **Customer Segmentation:** K-Means clustering with Elbow Method (WSS inertia curve) and Silhouette Analysis (K=2..8). Features an interactive PCA 2D Scatter Plot (PC1 vs PC2) with hover details, cluster statistical profiles, and automated segment labeling.
7. **Risk & Retention Action Portal:** Interactive multi-attribute filtering (*Risk Level, Cluster, Contract, Internet Service*), priority retention queue, and rule-based data-driven action recommendations.
8. **Project Information:** University assignment methodology, mathematical formulas for Accuracy, Precision, Recall, F1-Score, PCA variance ratios, and pipeline architecture diagrams.

---

## 📊 Dataset Specification & Attribution

- **Dataset Name:** IBM Telco Customer Churn Public Dataset
- **Records:** 7,043 Customers × 21 Feature Attributes
- **Target Variable:** `Churn` (Binary: Yes / No)
- **Features Included:** `gender`, `SeniorCitizen`, `Partner`, `Dependents`, `tenure`, `PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`, `Contract`, `PaperlessBilling`, `PaymentMethod`, `MonthlyCharges`, `TotalCharges`.

---

## 🛠️ Technology Stack

- **Backend Framework:** Python 3.11, FastAPI, Uvicorn
- **Machine Learning Engine:** Scikit-Learn 1.5.0, Pandas 2.2.2, NumPy 1.26.4, Joblib
- **Frontend UI:** React 18, TypeScript, Tailwind CSS 3.4, Recharts, Lucide Icons, Vite

---

## ⚡ Quickstart & Execution Guide

### Option 1: 1-Command Production Launcher (Recommended)

Simply run the root Python launcher:

```bash
python run.py
```

This starts the FastAPI server on `http://127.0.0.1:8000` (which serves the pre-built React frontend and REST API) and automatically opens your web browser.

### Option 2: Development Mode (Dual Process)

To run backend and frontend with live hot-reloading:

1. **Start Backend Server:**
   ```bash
   python -m uvicorn backend.app.main:app --port 8000 --reload
   ```

2. **Start Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📂 Project Directory Structure

```
ML AST/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py              # REST API Endpoints
│   │   ├── services/
│   │   │   ├── data_service.py        # Dataset loading & profiling
│   │   │   ├── ml_service.py          # Preprocessing & 6 ML classifiers
│   │   │   ├── clustering_service.py  # K-Means, Elbow/Silhouette, PCA 2D
│   │   │   └── recommendation_service.py # Risk analysis & retention rules
│   │   ├── main.py                    # FastAPI application entrypoint
│   │   └── schemas.py                 # Pydantic data schemas
│   ├── data/
│   │   └── telco_churn.csv            # Pre-loaded IBM Telco Churn dataset
│   └── saved_models/                  # Joblib persisted models & scalers
├── frontend/
│   ├── src/
│   │   ├── api/                       # Axios API client
│   │   ├── components/                # Sidebar, Header, KPICard
│   │   ├── types/                     # TypeScript interfaces
│   │   ├── views/                     # 8 Main Module views
│   │   ├── App.tsx                    # Main App container
│   │   ├── index.css                  # Tailwind CSS import
│   │   └── main.tsx                   # React root entry
│   ├── dist/                          # Compiled static bundle
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── run.py                             # 1-Command startup script
└── README.md                          # Project documentation
```

---

## 📋 University Assignment Requirements Verification

| Requirement | Implementation Status | Location |
| :--- | :---: | :--- |
| Real working ML pipeline | ✅ Verified | `backend/app/services/` |
| At least 3 Supervised ML algorithms | ✅ 6 Classifiers | `ml_service.py` |
| Evaluation: Accuracy, Precision, Recall, F1, Confusion Matrix | ✅ Verified | `ModelLabView.tsx` |
| Best Model selection dynamically based on metric | ✅ F1-Score Auto-Select | `ml_service.py` |
| K-Means Clustering & K Selection (Elbow / Silhouette) | ✅ Verified | `SegmentationView.tsx` |
| PCA Dimensionality Reduction & 2D Customer Map | ✅ Verified | `SegmentationView.tsx` |
| High-Risk Customer Identification | ✅ Verified | `RiskRetentionView.tsx` |
| Rule-Based Retention Recommendations | ✅ Verified | `recommendation_service.py` |
| Custom CSV Upload & Prediction Export | ✅ Verified | `PredictionView.tsx` |
| No fake data / hardcoded ML results | ✅ 100% Data-Driven | Real Pipeline Engine |

---

*Customer Churn Intelligence Platform © 2026. University Machine Learning Project.*
