import pandas as pd
from sklearn.ensemble import IsolationForest
import os

MODEL_PATH = 'ai/nlp/delay_model.pkl'

# Train or load model
if os.path.exists(MODEL_PATH):
    import joblib
    model = joblib.load(MODEL_PATH)
else:
    # For demo: train on synthetic data
    import numpy as np
    X = np.random.rand(100, 3)
    model = IsolationForest(contamination=0.1)
    model.fit(X)
    import joblib
    joblib.dump(model, MODEL_PATH)

def predict_delay(data):
    # Expecting data as dict with numeric features
    X = pd.DataFrame([data.get('features', [0,0,0])])
    score = model.decision_function(X)[0]
    return {'delay_probability': float(1 - score)} 