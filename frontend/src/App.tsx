import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { GlobalHeader } from './components/GlobalHeader';
import { OverviewView } from './views/OverviewView';
import { DatasetView } from './views/DatasetView';
import { PreprocessingView } from './views/PreprocessingView';
import { EDAView } from './views/EDAView';
import { PredictionView } from './views/PredictionView';
import { ModelLabView } from './views/ModelLabView';
import { SegmentationView } from './views/SegmentationView';
import { RiskRetentionView } from './views/RiskRetentionView';
import { ProjectInfoView } from './views/ProjectInfoView';
import { apiClient } from './api/client';
import { PipelineStatus } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [status, setStatus] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [activeTab]);

  const fetchStatus = async () => {
    try {
      const res = await apiClient.getStatus();
      setStatus(res);
    } catch (err) {
      console.error("Failed to fetch pipeline status:", err);
    }
  };

  const pageHeaders: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: "Executive Overview",
      subtitle: "Understand customer attrition, identify high-risk customers, and uncover behavioral segments."
    },
    dataset: {
      title: "Dataset & Preprocessing Workspace",
      subtitle: "Data profiling, validation, custom CSV upload, and preprocessing pipeline operations."
    },
    eda: {
      title: "Exploratory Data Analysis (EDA)",
      subtitle: "Visualizing tenure, billing, contract, and service relationships with churn."
    },
    prediction: {
      title: "Churn Prediction Engine",
      subtitle: "Run real-time ML risk inference for single customers or batch CSV uploads."
    },
    modellab: {
      title: "Supervised ML Model Lab",
      subtitle: "Benchmark 6 supervised classifiers with confusion matrix heatmaps and best model selection."
    },
    segmentation: {
      title: "Customer Segmentation & PCA Map",
      subtitle: "K-Means clustering with Elbow WSS, Silhouette scores, and 2D PCA customer scatter projection."
    },
    risk: {
      title: "Risk & Retention Action Portal",
      subtitle: "High-risk group queue, interactive global filters, and rule-based retention recommendations."
    },
    project: {
      title: "Project Information & Architecture",
      subtitle: "University Machine Learning project methodology, mathematical background, and pipeline diagrams."
    }
  };

  const headerInfo = pageHeaders[activeTab] || pageHeaders.overview;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'dataset':
        return <DatasetView />;
      case 'eda':
        return <EDAView />;
      case 'prediction':
        return <PredictionView />;
      case 'modellab':
        return <ModelLabView />;
      case 'segmentation':
        return <SegmentationView />;
      case 'risk':
        return <RiskRetentionView />;
      case 'project':
        return <ProjectInfoView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans flex">
      {/* Fixed Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status={status} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Global Sticky Header */}
        <GlobalHeader title={headerInfo.title} subtitle={headerInfo.subtitle} status={status} />

        {/* View Content */}
        <main className="flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;
