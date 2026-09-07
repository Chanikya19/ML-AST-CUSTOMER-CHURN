from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
import pandas as pd
import io
from typing import Optional, Dict, Any, List

from app.schemas import (
    DatasetProfile, PreprocessingSummary, TrainModelsResponse,
    SinglePredictionRequest, SinglePredictionResponse, BatchPredictionResponse,
    KMeansSegmentationResponse, RiskRetentionSummary
)
from app.services.data_service import data_service
from app.services.ml_service import ml_service
from app.services.clustering_service import clustering_service
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.get("/status")
def get_pipeline_status():
    df_loaded = data_service.raw_df is not None
    prep_ready = ml_service.preprocessing_summary is not None
    models_trained = ml_service.is_trained
    clustering_ready = clustering_service.kmeans_model is not None
    
    return {
        "dataset_loaded": df_loaded,
        "preprocessing_ready": prep_ready,
        "models_trained": models_trained,
        "clustering_ready": clustering_ready,
        "dataset_name": data_service.dataset_name,
        "best_model_name": ml_service.best_model_name if models_trained else None,
        "n_clusters": clustering_service.n_clusters if clustering_ready else None
    }

@router.get("/overview")
def get_executive_overview():
    profile = data_service.get_dataset_profile()
    df = data_service.get_raw_df()

    if not ml_service.is_trained:
        ml_service.train_all_models()

    if clustering_service.kmeans_model is None:
        clustering_service.run_segmentation(4)

    risk_data = recommendation_service.get_risk_retention_overview()

    # KPI values
    total_cust = profile["total_rows"]
    target_dist = profile["target_distribution"]
    churned_cust = target_dist.get("Yes", target_dist.get("1", 0))
    churn_rate = profile["target_churn_rate"]
    active_cust = total_cust - churned_cust
    high_risk_cust = risk_data["high_risk_count"]
    num_segments = clustering_service.n_clusters

    # Churn distribution
    churn_dist = [
        {"name": "Active (Non-Churn)", "value": active_cust, "color": "#171717"},
        {"name": "Churned", "value": churned_cust, "color": "#B89B5E"}
    ]

    # Churn rate by contract
    churn_by_contract = []
    if 'Contract' in df.columns:
        target_col = profile["target_variable"]
        g = df.groupby(['Contract', target_col]).size().unstack(fill_value=0)
        for contract_type in g.index:
            no_c = int(g.loc[contract_type, 'No']) if 'No' in g.columns else 0
            yes_c = int(g.loc[contract_type, 'Yes']) if 'Yes' in g.columns else 0
            tot = no_c + yes_c
            rate = round((yes_c / tot * 100), 1) if tot > 0 else 0.0
            churn_by_contract.append({
                "contract": contract_type,
                "active": no_c,
                "churned": yes_c,
                "churn_rate": rate
            })

    # Churn rate by Internet Service
    churn_by_internet = []
    if 'InternetService' in df.columns:
        target_col = profile["target_variable"]
        g = df.groupby(['InternetService', target_col]).size().unstack(fill_value=0)
        for service_type in g.index:
            no_c = int(g.loc[service_type, 'No']) if 'No' in g.columns else 0
            yes_c = int(g.loc[service_type, 'Yes']) if 'Yes' in g.columns else 0
            tot = no_c + yes_c
            rate = round((yes_c / tot * 100), 1) if tot > 0 else 0.0
            churn_by_internet.append({
                "service": service_type,
                "active": no_c,
                "churned": yes_c,
                "churn_rate": rate
            })

    # Segment summary
    profiles = clustering_service.cached_results.get("cluster_profiles", [])
    segment_overview = [
        {
            "cluster_id": p["cluster_id"],
            "segment_name": p["segment_name"],
            "customer_count": p["customer_count"],
            "percentage_of_total": p["percentage_of_total"],
            "avg_churn_probability": p["avg_churn_probability"],
            "observed_churn_rate": p["observed_churn_rate"]
        } for p in profiles
    ]

    # Computed Key Findings
    key_findings = [
        {
            "title": "Contract Duration Impact",
            "insight": f"Customers on Month-to-month contracts demonstrate significantly higher churn risk than long-term subscribers.",
            "type": "warning"
        },
        {
            "title": "Model Performance Benchmark",
            "insight": f"The optimal classifier '{ml_service.best_model_name}' achieved an F1-score of {ml_service.evaluation_results[0]['f1_score']:.4f} on test validation.",
            "type": "positive"
        },
        {
            "title": "High-Risk Segment Concentration",
            "insight": f"{high_risk_cust} customers ({round(high_risk_cust/total_cust*100, 1)}%) exceed the 67% churn probability threshold requiring priority retention outreach.",
            "type": "critical"
        }
    ]

    return {
        "kpis": {
            "total_customers": total_cust,
            "churned_customers": churned_cust,
            "churn_rate": churn_rate,
            "active_customers": active_cust,
            "highest_risk_customers": high_risk_cust,
            "number_of_segments": num_segments
        },
        "churn_distribution": churn_dist,
        "churn_by_contract": churn_by_contract,
        "churn_by_internet": churn_by_internet,
        "risk_distribution": risk_data["risk_distribution"],
        "segment_overview": segment_overview,
        "key_findings": key_findings
    }

@router.get("/dataset")
def get_dataset():
    profile = data_service.get_dataset_profile()
    df = data_service.get_raw_df()
    
    # Return first 50 rows as sample data
    sample_records = df.head(50).fillna("").to_dict(orient="records")

    return {
        "profile": profile,
        "sample_data": sample_records
    }

@router.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        valid, msg = data_service.validate_dataset(df)
        if not valid:
            raise HTTPException(status_code=400, detail=msg)
            
        data_service.load_custom_df(df, file.filename)
        
        # Retrain pipeline
        ml_service.train_all_models()
        clustering_service.run_segmentation(4)

        return {"message": f"Successfully loaded dataset '{file.filename}'. Pipeline retrained.", "profile": data_service.get_dataset_profile()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@router.post("/dataset/reset")
def reset_dataset():
    data_service.load_default_dataset()
    ml_service.train_all_models()
    clustering_service.run_segmentation(4)
    return {"message": "Reset to default IBM Telco Customer Churn dataset."}

@router.get("/preprocessing")
def get_preprocessing_pipeline():
    if ml_service.preprocessing_summary is None:
        raw_df = data_service.get_raw_df()
        ml_service.preprocess_dataset(raw_df)
    return ml_service.preprocessing_summary

@router.get("/eda")
def get_eda_data():
    df = data_service.get_raw_df()
    target_col = data_service.get_dataset_profile()["target_variable"]

    res = {}

    # Tenure distribution
    if 'tenure' in df.columns:
        tenure_bins = pd.cut(df['tenure'], bins=[0, 12, 24, 36, 48, 60, 72], labels=['0-12m', '13-24m', '25-36m', '37-48m', '49-60m', '61-72m'])
        t_counts = tenure_bins.value_counts().sort_index().to_dict()
        res['tenure_distribution'] = [{"range": k, "count": int(v)} for k, v in t_counts.items()]

    # Monthly charges distribution
    if 'MonthlyCharges' in df.columns:
        m_bins = pd.cut(df['MonthlyCharges'], bins=[18, 40, 60, 80, 100, 120], labels=['$18-40', '$40-60', '$60-80', '$80-100', '$100-120'])
        m_counts = m_bins.value_counts().sort_index().to_dict()
        res['monthly_charges_distribution'] = [{"range": k, "count": int(v)} for k, v in m_counts.items()]

    # Total charges
    if 'TotalCharges' in df.columns:
        tc_num = pd.to_numeric(df['TotalCharges'].astype(str).str.strip(), errors='coerce').fillna(0)
        tot_bins = pd.cut(tc_num, bins=[0, 1000, 3000, 5000, 7000, 9000], labels=['$0-1k', '$1k-3k', '$3k-5k', '$5k-7k', '$7k-9k'])
        tot_counts = tot_bins.value_counts().sort_index().to_dict()
        res['total_charges_distribution'] = [{"range": k, "count": int(v)} for k, v in tot_counts.items()]

    # Churn by Payment Method
    if 'PaymentMethod' in df.columns:
        g = df.groupby(['PaymentMethod', target_col]).size().unstack(fill_value=0)
        pm_list = []
        for pm in g.index:
            no_c = int(g.loc[pm, 'No']) if 'No' in g.columns else 0
            yes_c = int(g.loc[pm, 'Yes']) if 'Yes' in g.columns else 0
            pm_list.append({"method": pm, "active": no_c, "churned": yes_c})
        res['churn_by_payment_method'] = pm_list

    # Correlation Matrix
    if ml_service.processed_df is not None:
        numeric_df = ml_service.processed_df.select_dtypes(include=['number'])
        top_cols = numeric_df.columns[:10].tolist() # Limit to top 10 columns for readable matrix
        corr = numeric_df[top_cols].corr().round(2).to_dict()
        
        matrix_data = []
        for col1 in top_cols:
            row = {"feature": col1}
            for col2 in top_cols:
                row[col2] = corr[col1][col2]
            matrix_data.append(row)

        res['correlation_matrix'] = {
            "features": top_cols,
            "data": matrix_data
        }

    return res

@router.post("/models/train")
def train_models():
    res = ml_service.train_all_models()
    # Also update clustering
    clustering_service.run_segmentation(clustering_service.n_clusters)
    return res

@router.get("/models/evaluation")
def get_model_evaluations():
    if not ml_service.is_trained:
        ml_service.train_all_models()

    return {
        "results": ml_service.evaluation_results,
        "best_model_name": ml_service.best_model_name,
        "dummy_columns": ml_service.dummy_columns
    }

@router.post("/predict/single")
def predict_single_customer(req: SinglePredictionRequest):
    payload = req.model_dump()
    res = ml_service.predict_single(payload)
    return res

@router.post("/predict/batch")
async def predict_batch_customers(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        res = ml_service.predict_batch(df)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@router.post("/segmentation/kmeans")
def run_kmeans(n_clusters: int = Query(4, ge=2, le=8)):
    res = clustering_service.run_segmentation(n_clusters)
    return res

@router.get("/risk-retention")
def get_risk_retention(
    risk_filter: str = Query("ALL"),
    cluster_filter: str = Query("ALL"),
    contract_filter: str = Query("ALL"),
    internet_filter: str = Query("ALL")
):
    return recommendation_service.get_risk_retention_overview(
        risk_filter, cluster_filter, contract_filter, internet_filter
    )

@router.get("/export/predictions")
def export_predictions():
    df = data_service.get_raw_df()
    batch_res = ml_service.predict_batch(df)
    
    out_df = pd.DataFrame(batch_res["records"])
    stream = io.StringIO()
    out_df.to_csv(stream, index=False)
    
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=churn_predictions.csv"
    return response

@router.get("/export/cluster-profiles")
def export_cluster_profiles():
    res = clustering_service.cached_results
    profiles = res.get("cluster_profiles", [])
    
    out_df = pd.DataFrame(profiles)
    stream = io.StringIO()
    out_df.to_csv(stream, index=False)

    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=customer_cluster_profiles.csv"
    return response
