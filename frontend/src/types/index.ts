export interface PipelineStatus {
  dataset_loaded: boolean;
  preprocessing_ready: boolean;
  models_trained: boolean;
  clustering_ready: boolean;
  dataset_name: string;
  best_model_name: string | null;
  n_clusters: number | null;
}

export interface DatasetProfile {
  name: string;
  source: string;
  total_rows: number;
  total_columns: number;
  numerical_features: string[];
  categorical_features: string[];
  target_variable: string;
  missing_values: Record<string, number>;
  duplicate_rows: number;
  target_distribution: Record<string, number>;
  target_churn_rate: number;
  features_list: string[];
}

export interface ExecutiveOverview {
  kpis: {
    total_customers: number;
    churned_customers: number;
    churn_rate: number;
    active_customers: number;
    highest_risk_customers: number;
    number_of_segments: number;
  };
  churn_distribution: Array<{ name: string; value: number; color: string }>;
  churn_by_contract: Array<{ contract: string; active: number; churned: number; churn_rate: number }>;
  churn_by_internet: Array<{ service: string; active: number; churned: number; churn_rate: number }>;
  risk_distribution: Record<string, number>;
  segment_overview: Array<{
    cluster_id: number;
    segment_name: string;
    customer_count: number;
    percentage_of_total: number;
    avg_churn_probability: number;
    observed_churn_rate: number;
  }>;
  key_findings: Array<{
    title: string;
    insight: string;
    type: 'warning' | 'positive' | 'neutral' | 'critical';
  }>;
}

export interface PreprocessingSummary {
  raw_shape: [number, number];
  processed_shape: [number, number];
  missing_handled: Array<{ column: string; type: string; missing_count: number; method: string }>;
  categorical_encoded: Array<{ original_column: string; encoding_type: string; dummy_count: number; generated_columns: string[] }>;
  removed_features: Array<{ column: string; reason: string }>;
  scaled_features: string[];
  target_encoding: Record<string, number>;
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ModelEvalResult {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: ConfusionMatrix;
  is_best: boolean;
  selection_reason?: string;
  training_duration_sec: number;
}

export interface ContributingFactor {
  feature: string;
  value: any;
  impact: string;
}

export interface SinglePredictionResponse {
  customer_id: string;
  predicted_class: string;
  churn_probability: number;
  non_churn_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  contributing_factors: ContributingFactor[];
  recommendation: string;
}

export interface BatchPredictionRecord {
  customer_id: string;
  churn_probability: number;
  predicted_class: string;
  risk_level: string;
  cluster_id?: number;
  segment_name?: string;
  recommendation: string;
  attributes: Record<string, any>;
}

export interface BatchPredictionResponse {
  total_records: number;
  churn_count: number;
  churn_rate: number;
  records: BatchPredictionRecord[];
}

export interface ClusterProfile {
  cluster_id: number;
  segment_name: string;
  customer_count: number;
  percentage_of_total: number;
  avg_tenure: number;
  avg_monthly_charges: number;
  avg_total_charges: number;
  observed_churn_rate: number;
  avg_churn_probability: number;
  characteristics: string[];
  recommended_strategy: string;
}

export interface ElbowSilhouetteResult {
  k: number;
  wss: number;
  silhouette_score: number;
}

export interface PCA2DPoint {
  customer_id: string;
  pc1: number;
  pc2: number;
  cluster_id: number;
  churn: string;
  churn_prob: number;
  tenure: number;
  monthly_charges: number;
  contract: string;
}

export interface KMeansSegmentationResponse {
  n_clusters: number;
  recommended_k: number;
  elbow_silhouette: ElbowSilhouetteResult[];
  cluster_profiles: ClusterProfile[];
  pca_points: PCA2DPoint[];
  explained_variance_ratio: number[];
}

export interface HighRiskCustomer {
  customer_id: string;
  churn_probability: number;
  risk_level: string;
  tenure: number;
  contract: string;
  monthly_charges: number;
  internet_service: string;
  cluster_id: number;
  recommendation: string;
}

export interface RiskRetentionOverview {
  total_customers: number;
  low_risk_count: number;
  medium_risk_count: number;
  high_risk_count: number;
  filtered_count: number;
  risk_distribution: Record<string, number>;
  top_high_risk_customers: HighRiskCustomer[];
  segment_summary: Array<{
    cluster_id: number;
    total_customers: number;
    high_risk_count: number;
    observed_churn_rate: number;
    avg_churn_probability: number;
    retention_priority: string;
  }>;
}
