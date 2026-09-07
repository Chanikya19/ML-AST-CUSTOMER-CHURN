import time
import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.services.data_service import data_service

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "saved_models"))

class MLService:
    def __init__(self):
        self.is_trained: bool = False
        self.feature_names: List[str] = []
        self.cat_cols: List[str] = []
        self.num_cols: List[str] = []
        self.target_col: str = "Churn"
        
        self.scaler: Optional[StandardScaler] = None
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.num_imputer: Optional[SimpleImputer] = None
        self.dummy_columns: List[str] = []
        
        self.models: Dict[str, Any] = {}
        self.evaluation_results: List[Dict[str, Any]] = []
        self.best_model_name: str = ""
        self.best_model: Any = None
        self.X_test_scaled: Optional[np.ndarray] = None
        self.y_test: Optional[np.ndarray] = None
        self.processed_df: Optional[pd.DataFrame] = None
        self.preprocessing_summary: Optional[Dict[str, Any]] = None
        
        # Auto-train default models on startup
        self.train_all_models()

    def preprocess_dataset(self, raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, Dict[str, Any]]:
        df = raw_df.copy()
        raw_shape = list(df.shape)
        
        # 1. Target identification
        target_col = 'Churn' if 'Churn' in df.columns else [c for c in df.columns if c.lower() in ['churn', 'target']][0]
        self.target_col = target_col
        
        # Clean target values
        y_raw = df[target_col].astype(str).str.strip()
        y = y_raw.map(lambda v: 1 if v in ['Yes', '1', 'True', 'true', 'Y', 'y'] else 0)
        df = df.drop(columns=[target_col])
        
        # 2. Remove irrelevant identifiers
        removed_features = []
        id_cols = [c for c in df.columns if c.lower() in ['customerid', 'id', 'user_id', 'client_id', 'index']]
        for c in id_cols:
            df = df.drop(columns=[c])
            removed_features.append({"column": c, "reason": "Non-predictive unique identifier"})

        # 3. Clean numeric columns (e.g. TotalCharges with spaces)
        missing_handled = []
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check if it should be numeric
                numeric_converted = pd.to_numeric(df[col].astype(str).str.strip(), errors='coerce')
                # If more than 80% converted cleanly to numeric, convert it
                if numeric_converted.notnull().sum() / len(df) > 0.8 and df[col].nunique() > 10:
                    df[col] = numeric_converted

        # Separate num and cat
        self.num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        self.cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

        # 4. Missing value imputation
        for num_c in self.num_cols:
            n_miss = df[num_c].isnull().sum()
            if n_miss > 0:
                median_val = df[num_c].median()
                df[num_c] = df[num_c].fillna(median_val)
                missing_handled.append({
                    "column": num_c,
                    "type": "Numeric",
                    "missing_count": int(n_miss),
                    "method": f"Median Imputation ({round(median_val, 2)})"
                })

        for cat_c in self.cat_cols:
            n_miss = df[cat_c].isnull().sum()
            if n_miss > 0:
                mode_val = df[cat_c].mode()[0]
                df[cat_c] = df[cat_c].fillna(mode_val)
                missing_handled.append({
                    "column": cat_c,
                    "type": "Categorical",
                    "missing_count": int(n_miss),
                    "method": f"Mode Imputation ({mode_val})"
                })

        # 5. Categorical Encoding (One-Hot Encoding)
        categorical_encoded = []
        df_encoded = pd.get_dummies(df, columns=self.cat_cols, drop_first=False)
        for cat_c in self.cat_cols:
            generated_dummies = [c for c in df_encoded.columns if c.startswith(f"{cat_c}_")]
            categorical_encoded.append({
                "original_column": cat_c,
                "encoding_type": "One-Hot Encoding",
                "dummy_count": len(generated_dummies),
                "generated_columns": generated_dummies
            })

        self.dummy_columns = list(df_encoded.columns)
        
        # 6. Feature Scaling
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(df_encoded)
        X_processed = pd.DataFrame(X_scaled, columns=self.dummy_columns)

        summary = {
            "raw_shape": raw_shape,
            "processed_shape": list(X_processed.shape),
            "missing_handled": missing_handled,
            "categorical_encoded": categorical_encoded,
            "removed_features": removed_features,
            "scaled_features": self.dummy_columns,
            "target_encoding": {"No / 0": 0, "Yes / 1": 1}
        }
        self.preprocessing_summary = summary
        self.processed_df = X_processed.copy()
        self.processed_df['Churn_Target'] = y.values

        return X_processed, y, summary

    def train_all_models(self) -> Dict[str, Any]:
        raw_df = data_service.get_raw_df()
        X_processed, y, summary = self.preprocess_dataset(raw_df)

        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42, stratify=y
        )
        self.X_test_scaled = X_test
        self.y_test = y_test

        classifiers = {
            "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
            "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=6),
            "Random Forest": RandomForestClassifier(random_state=42, n_estimators=100, max_depth=10),
            "Gradient Boosting": GradientBoostingClassifier(random_state=42, n_estimators=100),
            "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
            "Naive Bayes": GaussianNB()
        }

        results = []
        best_f1 = -1.0
        best_name = ""

        for name, clf in classifiers.items():
            t0 = time.time()
            clf.fit(X_train, y_train)
            t1 = time.time()
            
            y_pred = clf.predict(X_test)
            
            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            
            cm = confusion_matrix(y_test, y_pred)
            tn, fp, fn, tp = int(cm[0,0]), int(cm[0,1]), int(cm[1,0]), int(cm[1,1])
            
            res_item = {
                "model_name": name,
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "confusion_matrix": {
                    "true_negative": tn,
                    "false_positive": fp,
                    "false_negative": fn,
                    "true_positive": tp
                },
                "is_best": False,
                "selection_reason": None,
                "training_duration_sec": round(t1 - t0, 3)
            }
            
            self.models[name] = clf
            results.append(res_item)

            if f1 > best_f1:
                best_f1 = f1
                best_name = name

        # Mark best model
        for r in results:
            if r["model_name"] == best_name:
                r["is_best"] = True
                r["selection_reason"] = f"{best_name} achieved the highest F1-score ({r['f1_score']:.4f}) on the held-out test set, providing the optimal balance between churn precision ({r['precision']:.4f}) and recall ({r['recall']:.4f})."

        self.evaluation_results = results
        self.best_model_name = best_name
        self.best_model = self.models[best_name]
        self.is_trained = True

        # Save models to disk
        self._save_models()

        return {
            "status": "success",
            "message": "All models trained successfully.",
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features_count": X_processed.shape[1],
            "target_variable": self.target_col,
            "model_results": results,
            "best_model": [r for r in results if r["model_name"] == best_name][0]
        }

    def _save_models(self):
        os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
        joblib.dump(self.best_model, os.path.join(SAVED_MODELS_DIR, "best_model.pkl"))
        joblib.dump(self.scaler, os.path.join(SAVED_MODELS_DIR, "scaler.pkl"))
        joblib.dump(self.dummy_columns, os.path.join(SAVED_MODELS_DIR, "dummy_columns.pkl"))

    def predict_single(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_trained:
            self.train_all_models()

        # Convert dict to single-row dataframe
        input_df = pd.DataFrame([customer_data])
        
        # Prepare dummy row matching dummy_columns
        row_dict = {col: 0.0 for col in self.dummy_columns}
        
        # Fill numeric values
        for num_c in self.num_cols:
            if num_c in input_df.columns:
                val = pd.to_numeric(input_df[num_c].iloc[0], errors='coerce')
                row_dict[num_c] = float(val) if pd.notnull(val) else 0.0

        # Fill categorical dummy columns
        for cat_c in self.cat_cols:
            if cat_c in input_df.columns:
                val = str(input_df[cat_c].iloc[0])
                dummy_col_name = f"{cat_c}_{val}"
                if dummy_col_name in row_dict:
                    row_dict[dummy_col_name] = 1.0

        single_row_df = pd.DataFrame([row_dict], columns=self.dummy_columns)
        scaled_row = self.scaler.transform(single_row_df)

        # Predict with best model
        proba = self.best_model.predict_proba(scaled_row)[0]
        non_churn_prob = float(proba[0])
        churn_prob = float(proba[1])
        pred_class = "Yes" if churn_prob >= 0.5 else "No"

        # Risk level
        if churn_prob >= 0.6:
            risk_level = "HIGH"
        elif churn_prob >= 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Key contributing factors
        factors = []
        contract = customer_data.get('Contract', 'Month-to-month')
        tenure = customer_data.get('tenure', 12)
        internet = customer_data.get('InternetService', 'Fiber optic')
        charges = customer_data.get('MonthlyCharges', 70.0)
        tech_support = customer_data.get('TechSupport', 'No')

        if contract == 'Month-to-month':
            factors.append({"feature": "Contract Type", "value": contract, "impact": "Increases Risk"})
        elif contract in ['One year', 'Two year']:
            factors.append({"feature": "Contract Type", "value": contract, "impact": "Decreases Risk"})

        if tenure <= 12:
            factors.append({"feature": "Tenure", "value": f"{tenure} months", "impact": "Increases Risk"})
        else:
            factors.append({"feature": "Tenure", "value": f"{tenure} months", "impact": "Decreases Risk"})

        if internet == 'Fiber optic':
            factors.append({"feature": "Internet Service", "value": internet, "impact": "Increases Risk"})

        if tech_support == 'No':
            factors.append({"feature": "Tech Support", "value": "No Support", "impact": "Increases Risk"})

        # Action recommendation
        if risk_level == "HIGH":
            rec = "Prioritize proactive retention outreach, offer long-term contract discounts, and provide dedicated tech support setup."
        elif risk_level == "MEDIUM":
            rec = "Monitor usage patterns, suggest relevant add-on features (Online Backup/Security), and check service satisfaction."
        else:
            rec = "Maintain current service level. Recommend loyalty rewards or annual billing transition."

        customer_id = str(customer_data.get('customerID', customer_data.get('id', 'CUST-NEW')))

        return {
            "customer_id": customer_id,
            "predicted_class": pred_class,
            "churn_probability": round(churn_prob * 100, 2),
            "non_churn_probability": round(non_churn_prob * 100, 2),
            "risk_level": risk_level,
            "contributing_factors": factors,
            "recommendation": rec
        }

    def predict_batch(self, df: pd.DataFrame) -> Dict[str, Any]:
        if not self.is_trained:
            self.train_all_models()

        records = []
        churn_count = 0
        
        for idx, row in df.iterrows():
            cust_dict = row.to_dict()
            res = self.predict_single(cust_dict)
            if res["predicted_class"] == "Yes":
                churn_count += 1
            
            records.append({
                "customer_id": res["customer_id"],
                "churn_probability": res["churn_probability"],
                "predicted_class": res["predicted_class"],
                "risk_level": res["risk_level"],
                "recommendation": res["recommendation"],
                "attributes": {k: str(v) for k, v in cust_dict.items() if k not in ['customerID', 'id']}
            })

        total = len(df)
        rate = round(float(churn_count / total * 100), 2) if total > 0 else 0.0

        return {
            "total_records": total,
            "churn_count": churn_count,
            "churn_rate": rate,
            "records": records
        }

ml_service = MLService()
