import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.services.ml_service import ml_service
from app.services.clustering_service import clustering_service
from app.services.data_service import data_service

class RecommendationService:
    def __init__(self):
        pass

    def get_risk_retention_overview(self, 
                                     risk_filter: str = "ALL", 
                                     cluster_filter: str = "ALL",
                                     contract_filter: str = "ALL",
                                     internet_filter: str = "ALL") -> Dict[str, Any]:
        if not ml_service.is_trained:
            ml_service.train_all_models()

        raw_df = data_service.get_raw_df().copy()
        X_processed = ml_service.processed_df.drop(columns=['Churn_Target'])

        # Predictions
        probas = ml_service.best_model.predict_proba(X_processed)[:, 1]
        raw_df['Churn_Prob'] = np.round(probas * 100, 2)
        
        # Risk Levels
        def get_risk(p):
            if p >= 67.0:
                return "HIGH"
            elif p >= 34.0:
                return "MEDIUM"
            else:
                return "LOW"

        raw_df['Risk_Level'] = raw_df['Churn_Prob'].apply(get_risk)

        # Clustering assignment
        if clustering_service.kmeans_model is not None:
            raw_df['Cluster'] = clustering_service.kmeans_model.predict(X_processed)
        else:
            raw_df['Cluster'] = 0

        # High risk count breakdown
        total_customers = len(raw_df)
        low_count = int((raw_df['Risk_Level'] == 'LOW').sum())
        med_count = int((raw_df['Risk_Level'] == 'MEDIUM').sum())
        high_count = int((raw_df['Risk_Level'] == 'HIGH').sum())

        # Filtering logic
        filtered_df = raw_df.copy()
        if risk_filter != "ALL":
            filtered_df = filtered_df[filtered_df['Risk_Level'] == risk_filter]
        if cluster_filter != "ALL" and cluster_filter.isdigit():
            filtered_df = filtered_df[filtered_df['Cluster'] == int(cluster_filter)]
        if contract_filter != "ALL" and 'Contract' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['Contract'] == contract_filter]
        if internet_filter != "ALL" and 'InternetService' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['InternetService'] == internet_filter]

        # Top high-risk customer list (sorted by Churn_Prob desc)
        high_risk_sorted = filtered_df.sort_values(by='Churn_Prob', ascending=False).head(100)
        
        high_risk_list = []
        for idx, r in high_risk_sorted.iterrows():
            cust_id = str(r.get('customerID', f"CUST-{idx}"))
            prob = float(r['Churn_Prob'])
            risk = str(r['Risk_Level'])
            tenure = int(r['tenure']) if 'tenure' in r else 0
            contract = str(r.get('Contract', 'Month-to-month'))
            monthly = float(r['MonthlyCharges']) if 'MonthlyCharges' in r else 0.0
            internet = str(r.get('InternetService', 'Fiber optic'))
            cluster_id = int(r['Cluster'])

            rec = self.generate_rule_recommendation(prob, tenure, contract, monthly, internet)

            high_risk_list.append({
                "customer_id": cust_id,
                "churn_probability": prob,
                "risk_level": risk,
                "tenure": tenure,
                "contract": contract,
                "monthly_charges": monthly,
                "internet_service": internet,
                "cluster_id": cluster_id,
                "recommendation": rec
            })

        # Segment Risk Analysis Table
        segment_summary = []
        for c_id in sorted(raw_df['Cluster'].unique()):
            c_df = raw_df[raw_df['Cluster'] == c_id]
            c_high = int((c_df['Risk_Level'] == 'HIGH').sum())
            c_avg_prob = round(float(c_df['Churn_Prob'].mean()), 2)
            c_obs_rate = round(float((c_df[ml_service.target_col].astype(str).str.strip().isin(['Yes', '1'])).mean() * 100), 2)
            
            priority = "URGENT" if c_avg_prob >= 50.0 else ("HIGH" if c_avg_prob >= 35.0 else "STANDARD")

            segment_summary.append({
                "cluster_id": int(c_id),
                "total_customers": len(c_df),
                "high_risk_count": c_high,
                "observed_churn_rate": c_obs_rate,
                "avg_churn_probability": c_avg_prob,
                "retention_priority": priority
            })

        return {
            "total_customers": total_customers,
            "low_risk_count": low_count,
            "medium_risk_count": med_count,
            "high_risk_count": high_count,
            "filtered_count": len(filtered_df),
            "risk_distribution": {
                "Low Risk (0-33%)": low_count,
                "Medium Risk (34-66%)": med_count,
                "High Risk (67-100%)": high_count
            },
            "top_high_risk_customers": high_risk_list,
            "segment_summary": segment_summary
        }

    def generate_rule_recommendation(self, prob: float, tenure: int, contract: str, monthly: float, internet: str) -> str:
        actions = []
        if tenure <= 12 and contract == "Month-to-month":
            actions.append("Prioritize early onboarding support and offer a 15% 1-year contract transition discount.")
        elif monthly >= 80.0:
            actions.append("Review service tier value perception and provide an optimized bundle rate.")
        elif internet == "Fiber optic":
            actions.append("Provide a complimentary 3-month Tech Support and Security add-on.")
        else:
            actions.append("Schedule a proactive customer success call and assign loyalty reward points.")

        return " ".join(actions)

recommendation_service = RecommendationService()
