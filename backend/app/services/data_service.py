import pandas as pd
import numpy as np
import os
from typing import Tuple, Dict, Any, Optional

DEFAULT_DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "telco_churn.csv")

class DataService:
    def __init__(self):
        self.raw_df: Optional[pd.DataFrame] = None
        self.dataset_name: str = "IBM Telco Customer Churn"
        self.dataset_source: str = "IBM / Kaggle Public Telco Customer Churn Dataset"
        self.load_default_dataset()

    def load_default_dataset(self) -> pd.DataFrame:
        path = os.path.abspath(DEFAULT_DATASET_PATH)
        if os.path.exists(path):
            self.raw_df = pd.read_csv(path)
            self.dataset_name = "IBM Telco Customer Churn"
            self.dataset_source = "IBM / Kaggle Public Telco Customer Churn Dataset"
        else:
            raise FileNotFoundError(f"Default dataset file not found at {path}")
        return self.raw_df

    def load_custom_df(self, df: pd.DataFrame, filename: str) -> pd.DataFrame:
        # Normalize column names if needed
        self.raw_df = df.copy()
        self.dataset_name = filename
        self.dataset_source = f"User Uploaded File: {filename}"
        return self.raw_df

    def get_raw_df(self) -> pd.DataFrame:
        if self.raw_df is None:
            self.load_default_dataset()
        return self.raw_df

    def validate_dataset(self, df: pd.DataFrame) -> Tuple[bool, str]:
        if df.empty:
            return False, "The uploaded dataset is empty."
        
        # Check target column candidates
        target_cols = [c for c in df.columns if c.lower() in ['churn', 'target', 'churn_label', 'attrition']]
        if not target_cols and 'Churn' not in df.columns:
            return False, "Dataset does not contain a recognizable target column ('Churn' or 'target')."
        
        return True, "Dataset validated successfully."

    def get_dataset_profile(self) -> Dict[str, Any]:
        df = self.get_raw_df()
        
        # Find target col
        target_col = 'Churn' if 'Churn' in df.columns else [c for c in df.columns if c.lower() in ['churn', 'target']][0]
        
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        if target_col in cat_cols:
            cat_cols.remove(target_col)
        if target_col in num_cols:
            num_cols.remove(target_col)

        missing_counts = df.isnull().sum().to_dict()
        # Check string spaces like ' ' in object columns
        for col in df.select_dtypes(include=['object']).columns:
            space_count = int((df[col].astype(str).str.strip() == '').sum())
            if space_count > 0:
                missing_counts[col] = missing_counts.get(col, 0) + space_count

        # Filter out 0 missing
        missing_counts = {k: int(v) for k, v in missing_counts.items() if v > 0}
        
        dup_count = int(df.duplicated().sum())

        target_counts = df[target_col].astype(str).value_counts().to_dict()
        total = len(df)
        churn_yes = target_counts.get('Yes', target_counts.get('1', target_counts.get(1, 0)))
        churn_rate = round(float(churn_yes / total * 100), 2) if total > 0 else 0.0

        return {
            "name": self.dataset_name,
            "source": self.dataset_source,
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "numerical_features": num_cols,
            "categorical_features": cat_cols,
            "target_variable": target_col,
            "missing_values": missing_counts,
            "duplicate_rows": dup_count,
            "target_distribution": {str(k): int(v) for k, v in target_counts.items()},
            "target_churn_rate": churn_rate,
            "features_list": [c for c in df.columns if c != target_col]
        }

data_service = DataService()
