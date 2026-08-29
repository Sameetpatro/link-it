"""
main.py
FastAPI Server providing the on-demand explainable prediction endpoint.
"""

import os
from fastapi import FastAPI, HTTPException
from predictor import predict_traffic_with_explanation

app = FastAPI(title="LinkIT ML Traffic Predictor", version="2.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "linkit-ml-predictor"}


@app.get("/predict/{short_code}")
def predict_link_traffic(short_code: str, days: int = 30):
    """
    Takes link 'short_code', trains a Gradient Boosting Regressor on its history,
    and returns the predicted traffic along with the exact reasons why!
    """
    try:
        result = predict_traffic_with_explanation(short_code, days=days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
