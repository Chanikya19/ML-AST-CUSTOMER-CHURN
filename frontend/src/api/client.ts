import axios from 'axios';
import {
  PipelineStatus,
  ExecutiveOverview,
  DatasetProfile,
  PreprocessingSummary,
  ModelEvalResult,
  SinglePredictionResponse,
  BatchPredictionResponse,
  KMeansSegmentationResponse,
  RiskRetentionOverview
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  getStatus: async (): Promise<PipelineStatus> => {
    const res = await axios.get(`${API_BASE}/status`);
    return res.data;
  },

  getOverview: async (): Promise<ExecutiveOverview> => {
    const res = await axios.get(`${API_BASE}/overview`);
    return res.data;
  },

  getDataset: async (): Promise<{ profile: DatasetProfile; sample_data: any[] }> => {
    const res = await axios.get(`${API_BASE}/dataset`);
    return res.data;
  },

  uploadDataset: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/dataset/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  resetDataset: async (): Promise<any> => {
    const res = await axios.post(`${API_BASE}/dataset/reset`);
    return res.data;
  },

  getPreprocessing: async (): Promise<PreprocessingSummary> => {
    const res = await axios.get(`${API_BASE}/preprocessing`);
    return res.data;
  },

  getEDA: async (): Promise<any> => {
    const res = await axios.get(`${API_BASE}/eda`);
    return res.data;
  },

  trainModels: async (): Promise<any> => {
    const res = await axios.post(`${API_BASE}/models/train`);
    return res.data;
  },

  getModelEvaluations: async (): Promise<{ results: ModelEvalResult[]; best_model_name: string; dummy_columns: string[] }> => {
    const res = await axios.get(`${API_BASE}/models/evaluation`);
    return res.data;
  },

  predictSingle: async (data: Record<string, any>): Promise<SinglePredictionResponse> => {
    const res = await axios.post(`${API_BASE}/predict/single`, data);
    return res.data;
  },

  predictBatch: async (file: File): Promise<BatchPredictionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/predict/batch`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  runKMeans: async (nClusters: number): Promise<KMeansSegmentationResponse> => {
    const res = await axios.post(`${API_BASE}/segmentation/kmeans?n_clusters=${nClusters}`);
    return res.data;
  },

  getRiskRetention: async (risk = 'ALL', cluster = 'ALL', contract = 'ALL', internet = 'ALL'): Promise<RiskRetentionOverview> => {
    const res = await axios.get(`${API_BASE}/risk-retention`, {
      params: { risk_filter: risk, cluster_filter: cluster, contract_filter: contract, internet_filter: internet }
    });
    return res.data;
  }
};
