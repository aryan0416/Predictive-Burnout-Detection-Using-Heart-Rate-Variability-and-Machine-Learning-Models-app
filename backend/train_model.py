import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
import joblib
import argparse

import neurokit2 as nk
from scipy.stats import mode

def load_wesad_subject(subject_path):
    with open(subject_path, 'rb') as file:
        data = pickle.load(file, encoding='latin1')
    ecg = data['signal']['chest']['ECG'].flatten()
    labels = data['label']
    df = pd.DataFrame({'ECG': ecg, 'Label': labels})
    df = df[df['Label'].isin([1, 2, 3])]
    return df

def extract_features_from_subject(df, subject_id):
    print(f"Processing Subject {subject_id}...")
    fs = 700 
    window_size = 60 * fs 
    step_size = 30 * fs   
    
    features_list = []
    if df.empty: return pd.DataFrame()

    for start in range(0, len(df) - window_size, step_size):
        end = start + window_size
        window_data = df.iloc[start:end]
        window_label = mode(window_data['Label'], keepdims=True)[0][0]
        try:
            ecg_cleaned = nk.ecg_clean(window_data['ECG'], sampling_rate=fs)
            peaks, _ = nk.ecg_peaks(ecg_cleaned, sampling_rate=fs)
            if len(peaks['ECG_R_Peaks']) < 10: continue

            hrv_time = nk.hrv_time(peaks, sampling_rate=fs)
            hrv_freq = nk.hrv_frequency(peaks, sampling_rate=fs)
            hrv_indices = pd.concat([hrv_time, hrv_freq], axis=1)
            
            feature_row = {
                'Subject': subject_id,
                'Label': window_label,
                'HRV_RMSSD': hrv_indices['HRV_RMSSD'].values[0],
                'HRV_MeanNN': hrv_indices['HRV_MeanNN'].values[0],
                'HRV_SDNN': hrv_indices['HRV_SDNN'].values[0],
                'HRV_LF': hrv_indices['HRV_LF'].values[0],
                'HRV_HF': hrv_indices['HRV_HF'].values[0],
                'HRV_LFHF': hrv_indices['HRV_LFHF'].values[0]
            }
            features_list.append(feature_row)
        except Exception as e:
            continue
    return pd.DataFrame(features_list)

def process_wesad_data(base_path):
    print(f"Scanning for subjects in: {base_path}")
    all_subjects = [d for d in os.listdir(base_path) if d.startswith('S') and os.path.isdir(os.path.join(base_path, d))]
    all_subjects = [s for s in all_subjects if len(s) <= 3] 
    all_subjects.sort()
    
    full_dataset_list = []
    for sub in all_subjects:
        current_file_path = os.path.join(base_path, sub, f"{sub}.pkl")
        if os.path.exists(current_file_path):
            df_temp = load_wesad_subject(current_file_path)
            features_temp = extract_features_from_subject(df_temp, sub)
            if not features_temp.empty:
                full_dataset_list.append(features_temp)
    if full_dataset_list:
        return pd.concat(full_dataset_list, ignore_index=True)
    return pd.DataFrame()

def generate_mock_data():
    print("Generating MOCK dataset for testing...")
    np.random.seed(42)
    n_samples = 500
    data = {
        'Subject': np.random.choice(['S2', 'S3', 'S4'], n_samples),
        'Label': np.random.choice([1, 2], n_samples), # 1: Baseline, 2: Stress
        'HRV_RMSSD': np.random.normal(40, 15, n_samples),
        'HRV_MeanNN': np.random.normal(800, 100, n_samples),
        'HRV_SDNN': np.random.normal(50, 20, n_samples),
        'HRV_LF': np.random.normal(0.04, 0.01, n_samples),
        'HRV_HF': np.random.normal(0.02, 0.01, n_samples),
        'HRV_LFHF': np.random.normal(2.0, 1.0, n_samples)
    }
    data['HRV_RMSSD'] -= (data['Label'] == 2) * 15
    data['HRV_LFHF'] += (data['Label'] == 2) * 1.5
    return pd.DataFrame(data)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mock", action="store_true", help="Use mock data instead of parsing WESAD dataset")
    parser.add_argument("--wesad_path", type=str, default="./WESAD", help="Path to WESAD dataset directory")
    args = parser.parse_args()

    if args.mock:
        master_df = generate_mock_data()
    else:
        if not os.path.exists(args.wesad_path):
            print(f"Error: Path {args.wesad_path} not found. Use --mock for testing.")
            return
        master_df = process_wesad_data(args.wesad_path)
        
    if master_df.empty:
        print("Dataset is empty. Exiting.")
        return

    # Keep ONLY Label 1 (Baseline) and Label 2 (Stress)
    binary_df = master_df[master_df['Label'].isin([1, 2])].copy()
    binary_df['Label'] = binary_df['Label'].replace({1: 0, 2: 1})

    X = binary_df.drop(['Subject', 'Label'], axis=1)
    y = binary_df['Label']

    # We will fit a GLOBAL StandardScaler here for saving
    print("Fitting StandardScaler...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled_df = pd.DataFrame(X_scaled, columns=X.columns)
    
    # Save the scaler
    joblib.dump(scaler, 'scaler.pkl')
    print("Saved scaler to scaler.pkl")

    X_train, X_test, y_train, y_test = train_test_split(X_scaled_df, y, test_size=0.2, random_state=42, stratify=y)

    print("Applying SMOTE to training data...")
    smote = SMOTE(random_state=42)
    X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)

    print("Training Random Forest Model...")
    rf_model = RandomForestClassifier(
        n_estimators=300,
        max_depth=6,
        random_state=42
    )
    rf_model.fit(X_train_smote, y_train_smote)

    # Evaluate
    y_pred_rf = rf_model.predict(X_test)
    acc_rf = accuracy_score(y_test, y_pred_rf)
    print(f"FINAL RANDOM FOREST ACCURACY: {acc_rf*100:.2f}%")
    print(classification_report(y_test, y_pred_rf, target_names=['Baseline', 'Stress']))

    # Save model
    joblib.dump(rf_model, "rf_model.pkl")
    print("Saved model to rf_model.pkl")

if __name__ == "__main__":
    main()
