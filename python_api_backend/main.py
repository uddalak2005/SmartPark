import os
import re
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import mean_absolute_error
from fastapi import FastAPI
from pydantic import BaseModel

# -------------------- CONFIG --------------------
CSV_PATH = "observation.csv"  # place your CSV in the same dir
MODEL_PATH = "best_model.pt"  # pretrained weights file
INPUT_LEN = 72
BATCH_SIZE = 128
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

CONGESTION_THRESHOLDS = {
    'LOW': 200,
    'MEDIUM': 300
}

# -------------------- HELPER FUNCS --------------------
def determine_congestion_level(mean_count, thresholds):
    if mean_count <= thresholds['LOW']:
        return "Low"
    elif mean_count <= thresholds['MEDIUM']:
        return "Medium"
    else:
        return "High"

# -------------------- MODEL --------------------
class TransformerForecaster(nn.Module):
    def __init__(self, input_size, hidden_size=256, num_heads=8, dropout=0.1, seq_len=INPUT_LEN):
        super().__init__()

        # ✅ Adjust number of heads dynamically if needed
        if input_size % num_heads != 0:
            for h in [1, 2, 4, 8, 16]:
                if input_size % h == 0:
                    num_heads = h
                    break
            else:
                num_heads = 1  # fallback to 1 head

        self.pos_embedding = nn.Parameter(torch.randn(1, seq_len, input_size) * 0.01)
        self.layer_norm = nn.LayerNorm(input_size)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=input_size,
            nhead=num_heads,
            dim_feedforward=hidden_size,
            dropout=dropout,
            batch_first=True,
            activation='gelu'
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=3)
        self.fc = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, 1)
        )

    def forward(self, x):
        x = x + self.pos_embedding[:, :x.size(1), :]
        x = self.layer_norm(x)
        x = self.transformer(x)
        x = x[:, -1, :]
        return self.fc(x).squeeze(-1)

class TrafficDataset(Dataset):
    def __init__(self, data, input_len=INPUT_LEN, feature_dim=None):
        self.X, self.y = [], []
        for i in range(len(data) - input_len):
            self.X.append(data[i:i + input_len, :feature_dim])
            self.y.append(data[i + input_len, -1])
        self.X = torch.tensor(np.array(self.X), dtype=torch.float32)
        self.y = torch.tensor(np.array(self.y), dtype=torch.float32)
    def __len__(self):
        return len(self.X)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

# -------------------- FASTAPI --------------------
app = FastAPI(title="Traffic Congestion Inference API")

class RequestModel(BaseModel):
    target_place: str

@app.on_event("startup")
def load_data_and_model():
    global df, scaler_X, scaler_y, feature_cols, model_loaded

    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    df = df.drop(columns=["Datetime"], errors="ignore")

    # Parse hours
    def extract_hour(timeslot):
        if pd.isna(timeslot): return None
        try:
            start_time = timeslot.split('-')[0].strip()
            start_time = re.sub(r'(?i)(AM|PM)', r' \1', start_time).strip().upper()
            return pd.to_datetime(start_time, format='%I:%M %p').hour
        except:
            try: return pd.to_datetime(start_time, format='%H:%M').hour
            except: return None

    df['StartHour'] = df['TimeSlot'].apply(extract_hour)
    df.dropna(subset=['StartHour'], inplace=True)
    df['StartHour'] = df['StartHour'].astype(int)

    # Encode and features
    le_to = LabelEncoder()
    df['To_encoded'] = le_to.fit_transform(df['To'])
    df['DayOfYear'] = (df['Month'] - 1) * 30 + df['Day']
    df['Day_sin'] = np.sin(2 * np.pi * df['DayOfYear'] / 365)
    df['Day_cos'] = np.cos(2 * np.pi * df['DayOfYear'] / 365)
    df['Hour_sin'] = np.sin(2 * np.pi * df['StartHour'] / 24)
    df['Hour_cos'] = np.cos(2 * np.pi * df['StartHour'] / 24)

    df = df.sort_values(['To', 'Year', 'Month', 'Day', 'StartHour']).reset_index(drop=True)

    for lag in [1, 2, 3, 6, 12, 24]:
        df[f'Lag_{lag}'] = df.groupby('To')['CarCount'].shift(lag)

    df['MA_3'] = df.groupby('To')['CarCount'].transform(lambda x: x.rolling(3).mean())
    df['EMA_5'] = df.groupby('To')['CarCount'].transform(lambda x: x.ewm(span=5, adjust=False).mean())
    df['ROLL12_mean'] = df.groupby('To')['CarCount'].transform(lambda x: x.rolling(12).mean())
    df['ROLL12_std'] = df.groupby('To')['CarCount'].transform(lambda x: x.rolling(12).std())
    df['Diff_1'] = df.groupby('To')['CarCount'].diff(1)
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)

    feature_cols = [
        'StartHour', 'Hour_sin', 'Hour_cos', 'Day_sin', 'Day_cos',
        'To_encoded', 'MA_3', 'EMA_5', 'ROLL12_mean', 'ROLL12_std', 'Diff_1'
    ] + [f'Lag_{i}' for i in [1, 2, 3, 6, 12, 24]]

    scaler_X = MinMaxScaler()
    df[feature_cols] = scaler_X.fit_transform(df[feature_cols])

    scaler_y = MinMaxScaler()
    df['y_scaled'] = scaler_y.fit_transform(df[['CarCount']])

    # Load model
    print("Loading model...")
    sample_input = len(feature_cols)
    model_loaded = TransformerForecaster(sample_input)
    model_loaded.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model_loaded.to(DEVICE)
    model_loaded.eval()

    print("✅ Model and data loaded successfully.")

@app.post("/infer")
def infer(request: RequestModel):
    target_place = request.target_place
    df_target = df[df['To'] == target_place].copy()
    if df_target.empty:
        return {"error": f"No data found for target location: {target_place}"}

    values = df_target[feature_cols + ['y_scaled']].values
    feature_dim = len(feature_cols)

    train_size = int(len(values) * 0.8)
    test_data = values[train_size:]

    if len(test_data) < INPUT_LEN + 10:
        return {"error": f"Not enough data for {target_place}"}

    test_dataset = TrafficDataset(test_data, input_len=INPUT_LEN, feature_dim=feature_dim)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

    preds_scaled_all, actuals_scaled_all = [], []

    with torch.no_grad():
        for X_batch, y_batch in test_loader:
            X_batch = X_batch.to(DEVICE)
            y_pred = model_loaded(X_batch).view(-1).cpu().numpy()
            preds_scaled_all.extend(y_pred)
            actuals_scaled_all.extend(y_batch.view(-1).cpu().numpy())
            if len(preds_scaled_all) >= 200:
                break

    preds_all = scaler_y.inverse_transform(np.array(preds_scaled_all).reshape(-1, 1)).flatten()
    actuals_all = scaler_y.inverse_transform(np.array(actuals_scaled_all).reshape(-1, 1)).flatten()

    N_SAMPLES = min(200, len(preds_all))
    preds_200 = preds_all[:N_SAMPLES]
    actuals_200 = actuals_all[:N_SAMPLES]

    mae_200 = mean_absolute_error(actuals_200, preds_200)
    mean_predicted_car_count = np.mean(preds_200)
    congestion_level = determine_congestion_level(mean_predicted_car_count, CONGESTION_THRESHOLDS)

    return {
    "target_place": target_place,
    "mean_absolute_error": float(mae_200),
    "mean_predicted_car_count": float(mean_predicted_car_count),
    "congestion_level": str(congestion_level)
}

