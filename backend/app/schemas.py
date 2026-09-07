from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DatasetProfile(BaseModel):
    name: str
    source: str
    total_rows: int
    total_columns: int
    numerical_features: List[str]
    categorical_features: List[str]
    target_variable: str
    missing_values: Dict[str, int]
    duplicate_rows: int
    target_distribution: Dict[str, int]
    target_churn_rate: float
    features_list: List[str]

class PreprocessingSummary(BaseModel):
    raw_shape: List[int]
    processed_shape: List[int]
    missing_handled: List[Dict[str, Any]]
    categorical_encoded: List[Dict[str, Any]]
    removed_features: List[Dict[str, str]]
    scaled_features: List[str]
    target_encoding: Dict[str, int]

class ConfusionMatrixSchema(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int

class ModelEvalResult(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: ConfusionMatrixSchema
    is_best: bool = False
    selection_reason: Optional[str] = None
    training_duration_sec: float

class TrainModelsResponse(BaseModel):
    status: str
    message: str
    train_size: int
    test_size: int
    features_count: int
    target_variable: str
    model_results: List[ModelEvalResult]
    best_model: ModelEvalResult

class SinglePredictionRequest(BaseModel):
    gender: Optional[str] = "Female"
    SeniorCitizen: Optional[int] = 0
    Partner: Optional[str] = "Yes"
    Dependents: Optional[str] = "No"
    tenure: Optional[int] = 12
    PhoneService: Optional[str] = "Yes"
    MultipleLines: Optional[str] = "No"
    InternetService: Optional[str] = "Fiber optic"
    OnlineSecurity: Optional[str] = "No"
    OnlineBackup: Optional[str] = "No"
    DeviceProtection: Optional[str] = "No"
    TechSupport: Optional[str] = "No"
    StreamingTV: Optional[str] = "No"
    StreamingMovies: Optional[str] = "No"
    Contract: Optional[str] = "Month-to-month"
    PaperlessBilling: Optional[str] = "Yes"
    PaymentMethod: Optional[str] = "Electronic check"
    MonthlyCharges: Optional[float] = 70.0
    TotalCharges: Optional[float] = 840.0
    custom_attributes: Optional[Dict[str, Any]] = None

class ContributingFactor(BaseModel):
    feature: str
    value: Any
    impact: str # 'Increases Risk' or 'Decreases Risk'

class SinglePredictionResponse(BaseModel):
    customer_id: str
    predicted_class: str # "Yes" or "No"
    churn_probability: float
    non_churn_probability: float
    risk_level: str # "LOW", "MEDIUM", "HIGH"
    contributing_factors: List[ContributingFactor]
    recommendation: str
    cluster_id: Optional[int] = None
    segment_name: Optional[str] = None

class BatchPredictionRecord(BaseModel):
    customer_id: str
    churn_probability: float
    predicted_class: str
    risk_level: str
    cluster_id: Optional[int] = None
    segment_name: Optional[str] = None
    recommendation: str
    attributes: Dict[str, Any]

class BatchPredictionResponse(BaseModel):
    total_records: int
    churn_count: int
    churn_rate: float
    records: List[BatchPredictionRecord]

class ClusterProfile(BaseModel):
    cluster_id: int
    segment_name: str
    customer_count: int
    percentage_of_total: float
    avg_tenure: float
    avg_monthly_charges: float
    avg_total_charges: float
    observed_churn_rate: float
    avg_churn_probability: float
    characteristics: List[str]
    recommended_strategy: str

class ElbowSilhouetteResult(BaseModel):
    k: int
    wss: float
    silhouette_score: float

class PCA2DPoint(BaseModel):
    customer_id: str
    pc1: float
    pc2: float
    cluster_id: int
    churn: str
    churn_prob: float
    tenure: int
    monthly_charges: float
    contract: str

class KMeansSegmentationResponse(BaseModel):
    n_clusters: int
    recommended_k: int
    elbow_silhouette: List[ElbowSilhouetteResult]
    cluster_profiles: List[ClusterProfile]
    pca_points: List[PCA2DPoint]
    explained_variance_ratio: List[float]

class ExecutiveKPIs(BaseModel):
    total_customers: int
    churned_customers: int
    churn_rate: float
    active_customers: int
    highest_risk_customers: int
    number_of_segments: int

class KeyFinding(BaseModel):
    title: str
    insight: str
    type: str # 'warning', 'positive', 'neutral', 'critical'

class RiskRetentionSummary(BaseModel):
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    risk_distribution: Dict[str, int]
    top_high_risk_customers: List[Dict[str, Any]]
