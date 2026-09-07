import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

from app.services.ml_service import ml_service
from app.services.data_service import data_service

class ClusteringService:
    def __init__(self):
        self.kmeans_model: Any = None
        self.pca_model: Any = None
        self.n_clusters: int = 4
        self.cached_results: Dict[str, Any] = {}

    def compute_elbow_silhouette(self, X: pd.DataFrame) -> Tuple[List[Dict[str, float]], int]:
        results = []
        best_k = 4
        max_silhouette = -1.0
        
        # Subsample if X is very large for performance
        sample_size = min(len(X), 2000)
        X_sample = X.sample(n=sample_size, random_state=42) if len(X) > sample_size else X

        for k in range(2, 9):
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(X_sample)
            wss = float(km.inertia_)
            sil = float(silhouette_score(X_sample, labels))
            
            results.append({
                "k": k,
                "wss": round(wss, 2),
                "silhouette_score": round(sil, 4)
            })

            if sil > max_silhouette:
                max_silhouette = sil
                best_k = k

        return results, best_k

    def run_segmentation(self, n_clusters: int = 4) -> Dict[str, Any]:
        self.n_clusters = n_clusters
        
        if not ml_service.is_trained:
            ml_service.train_all_models()

        X_processed = ml_service.processed_df.drop(columns=['Churn_Target'])
        raw_df = data_service.get_raw_df()

        # 1. Elbow & Silhouette
        elbow_silhouette_data, recommended_k = self.compute_elbow_silhouette(X_processed)

        # 2. Fit K-Means
        self.kmeans_model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = self.kmeans_model.fit_predict(X_processed)

        # 3. Fit PCA 2D
        self.pca_model = PCA(n_components=2, random_state=42)
        X_pca = self.pca_model.fit_transform(X_processed)
        exp_var = [round(float(v * 100), 2) for v in self.pca_model.explained_variance_ratio_]

        # Combine with raw_df & prediction probabilities
        df_analysis = raw_df.copy()
        df_analysis['Cluster'] = cluster_labels
        df_analysis['PC1'] = X_pca[:, 0]
        df_analysis['PC2'] = X_pca[:, 1]
        
        # Get churn target
        target_col = ml_service.target_col
        df_analysis['Churn_Num'] = df_analysis[target_col].astype(str).str.strip().map(
            lambda v: 1 if v in ['Yes', '1', 'True', 'Y'] else 0
        )

        # Pre-calculate predictions probabilities for all samples
        proba_list = ml_service.best_model.predict_proba(X_processed)[:, 1]
        df_analysis['Churn_Prob'] = proba_list

        # Build Cluster Profiles
        profiles = []
        total_customers = len(df_analysis)

        for c_id in range(n_clusters):
            c_df = df_analysis[df_analysis['Cluster'] == c_id]
            c_count = len(c_df)
            c_pct = round((c_count / total_customers) * 100, 2)
            
            avg_tenure = round(float(c_df['tenure'].mean()), 1) if 'tenure' in c_df.columns else 0.0
            avg_monthly = round(float(c_df['MonthlyCharges'].mean()), 2) if 'MonthlyCharges' in c_df.columns else 0.0
            
            # Clean TotalCharges numeric
            if 'TotalCharges' in c_df.columns:
                tc_num = pd.to_numeric(c_df['TotalCharges'].astype(str).str.strip(), errors='coerce').fillna(0)
                avg_total = round(float(tc_num.mean()), 2)
            else:
                avg_total = 0.0

            obs_churn_rate = round(float(c_df['Churn_Num'].mean() * 100), 2)
            avg_churn_prob = round(float(c_df['Churn_Prob'].mean() * 100), 2)

            # Auto-interpret cluster label & characteristics based on stats
            segment_name, characteristics, strategy = self._interpret_cluster(
                c_id, avg_tenure, avg_monthly, obs_churn_rate, c_df
            )

            profiles.append({
                "cluster_id": c_id,
                "segment_name": segment_name,
                "customer_count": c_count,
                "percentage_of_total": c_pct,
                "avg_tenure": avg_tenure,
                "avg_monthly_charges": avg_monthly,
                "avg_total_charges": avg_total,
                "observed_churn_rate": obs_churn_rate,
                "avg_churn_probability": avg_churn_prob,
                "characteristics": characteristics,
                "recommended_strategy": strategy
            })

        # Sample PCA points for visualization (cap at 600 points for fast UI rendering)
        pca_sample_df = df_analysis.sample(n=min(600, len(df_analysis)), random_state=42)
        pca_points = []

        for idx, row in pca_sample_df.iterrows():
            cust_id = str(row.get('customerID', f"CUST-{idx}"))
            pca_points.append({
                "customer_id": cust_id,
                "pc1": round(float(row['PC1']), 3),
                "pc2": round(float(row['PC2']), 3),
                "cluster_id": int(row['Cluster']),
                "churn": str(row[target_col]),
                "churn_prob": round(float(row['Churn_Prob'] * 100), 1),
                "tenure": int(row['tenure']) if 'tenure' in row else 0,
                "monthly_charges": round(float(row['MonthlyCharges']), 2) if 'MonthlyCharges' in row else 0.0,
                "contract": str(row.get('Contract', 'Month-to-month'))
            })

        res = {
            "n_clusters": n_clusters,
            "recommended_k": recommended_k,
            "elbow_silhouette": elbow_silhouette_data,
            "cluster_profiles": profiles,
            "pca_points": pca_points,
            "explained_variance_ratio": exp_var
        }

        self.cached_results = res
        return res

    def _interpret_cluster(self, c_id: int, tenure: float, monthly: float, churn_rate: float, c_df: pd.DataFrame) -> Tuple[str, List[str], str]:
        # Top contract
        top_contract = "Month-to-month"
        if 'Contract' in c_df.columns:
            top_contract = str(c_df['Contract'].mode()[0])

        top_internet = "Fiber optic"
        if 'InternetService' in c_df.columns:
            top_internet = str(c_df['InternetService'].mode()[0])

        if churn_rate >= 40.0:
            name = f"Segment {c_id+1}: At-Risk Short-Tenure Subscribers"
            chars = [
                f"High observed churn rate ({churn_rate}%)",
                f"Low average tenure ({tenure} months)",
                f"Predominantly {top_contract} contracts with {top_internet}"
            ]
            strat = "Prioritize immediate retention outreach, offer contract renewal discounts, and engage with onboarding support."
        elif monthly >= 75.0 and tenure >= 36.0:
            name = f"Segment {c_id+1}: High-Value Loyal Power Users"
            chars = [
                f"High monthly revenue (${monthly}/mo)",
                f"Long established tenure ({tenure} months)",
                f"Low churn risk ({churn_rate}%)"
            ]
            strat = "VIP rewards program, premium service priority, and account executive check-ins."
        elif tenure <= 20.0 and monthly < 50.0:
            name = f"Segment {c_id+1}: Budget-Conscious Entry Customers"
            chars = [
                f"Low monthly expenditure (${monthly}/mo)",
                f"Short to moderate tenure ({tenure} months)",
                f"Moderate churn risk ({churn_rate}%)"
            ]
            strat = "Encourage bundle upgrades (Online Security/Backup) and introduce value-added services."
        else:
            name = f"Segment {c_id+1}: Stable Long-Term Subscribers"
            chars = [
                f"Steady tenure ({tenure} months)",
                f"Moderate monthly charges (${monthly}/mo)",
                f"Low churn risk ({churn_rate}%)"
            ]
            strat = "Maintain high service uptime and provide automatic loyalty tenure milestone rewards."

        return name, chars, strat

clustering_service = ClusteringService()
