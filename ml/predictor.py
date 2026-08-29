"""
predictor.py
Simple, beginner-friendly Quantile Gradient Boosting model with human-readable explanations.
"""

import os
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from sklearn.ensemble import GradientBoostingRegressor


def fetch_link_data(short_code: str, days: int = 30) -> pd.DataFrame:
    """
    Step 1: Fetch whatever historical data exists for this specific link.
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is missing!")

    conn = psycopg2.connect(db_url)
    query = """
        SELECT bucket_start, request_count, avg_latency_ms, bot_count
        FROM traffic_aggregates
        WHERE short_code = %s
          AND bucket_start >= NOW() - (INTERVAL '1 day' * %s)
        ORDER BY bucket_start ASC;
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, (short_code, days))
        rows = cur.fetchall()
    conn.close()

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    df["bucket_start"] = pd.to_datetime(df["bucket_start"])
    return df


def predict_traffic_with_explanation(short_code: str, days: int = 30) -> dict:
    """
    Step 2: Train Gradient Boosting on this link's data and explain the prediction.
    """
    df_raw = fetch_link_data(short_code, days=days)

    # Check if we have enough data
    if len(df_raw) < 15:
        return {
            "short_code": short_code,
            "status": "not_enough_data",
            "message": f"Only found {len(df_raw)} records for link '{short_code}'. Need at least 15 records to predict accurately.",
        }

    # Resample 5-minute buckets into 1-hour chunks for clean hourly patterns
    df_raw.set_index("bucket_start", inplace=True)
    df = df_raw.resample("1h").agg({
        "request_count": "sum",
        "avg_latency_ms": "mean",
        "bot_count": "sum"
    }).fillna(0).reset_index()

    # --- FEATURE ENGINEERING (Extract Clues for the Model) ---
    df["hour"] = df["bucket_start"].dt.hour
    df["day_of_week"] = df["bucket_start"].dt.dayofweek  # 0 = Monday, 6 = Sunday
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    # Lags: what happened in the last 1 hour and 2 hours
    df["lag_1"] = df["request_count"].shift(1).fillna(df["request_count"].mean())
    df["lag_2"] = df["request_count"].shift(2).fillna(df["request_count"].mean())
    df["rolling_3h_mean"] = df["request_count"].shift(1).rolling(3, min_periods=1).mean().fillna(df["request_count"].mean())

    features = ["hour", "day_of_week", "is_weekend", "lag_1", "lag_2", "rolling_3h_mean"]
    X = df[features]
    y = df["request_count"]

    # --- TRAIN 3 QUANTILE GRADIENT BOOSTING TREES ---
    # Model 1: Lower bound (10th percentile - minimum expected)
    model_lower = GradientBoostingRegressor(loss="quantile", alpha=0.10, n_estimators=40, max_depth=3, random_state=42)
    # Model 2: Expected value (50th percentile - median best guess)
    model_median = GradientBoostingRegressor(loss="quantile", alpha=0.50, n_estimators=40, max_depth=3, random_state=42)
    # Model 3: Upper bound (90th percentile - maximum normal traffic)
    model_upper = GradientBoostingRegressor(loss="quantile", alpha=0.90, n_estimators=40, max_depth=3, random_state=42)

    model_lower.fit(X, y)
    model_median.fit(X, y)
    model_upper.fit(X, y)

    # --- TARGET: PREDICT FOR NEXT TARGET HOUR ---
    next_time = df["bucket_start"].max() + timedelta(hours=1)
    target_hour = next_time.hour
    target_dow = next_time.dayofweek
    is_weekend = 1 if target_dow in [5, 6] else 0
    recent_lag1 = df["request_count"].iloc[-1]
    recent_lag2 = df["request_count"].iloc[-2] if len(df) > 1 else recent_lag1
    recent_rolling = df["request_count"].tail(3).mean()

    target_features = pd.DataFrame([{
        "hour": target_hour,
        "day_of_week": target_dow,
        "is_weekend": is_weekend,
        "lag_1": recent_lag1,
        "lag_2": recent_lag2,
        "rolling_3h_mean": recent_rolling
    }])

    # Run ML Prediction
    predicted_val = float(np.maximum(0, model_median.predict(target_features)[0]))
    lower_val = float(np.maximum(0, model_lower.predict(target_features)[0]))
    upper_val = float(np.maximum(predicted_val + 1, model_upper.predict(target_features)[0]))

    # --- CALCULATE WHY VALUES WERE ADDED (EXPLAINABILITY) ---
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    target_day_name = day_names[target_dow]

    overall_avg = float(df["request_count"].mean())
    day_avg = float(df[df["day_of_week"] == target_dow]["request_count"].mean())
    hour_avg = float(df[df["hour"] == target_hour]["request_count"].mean())

    day_impact = round(day_avg - overall_avg, 1)
    hour_impact = round(hour_avg - overall_avg, 1)
    momentum_impact = round(recent_rolling - overall_avg, 1)

    # Build human-friendly reason cards
    reasons = []

    # 1. Day of Week explanation
    if day_impact > 2:
        reasons.append(f"🟢 +{day_impact} clicks: {target_day_name} is historically a high-traffic day for this link.")
    elif day_impact < -2:
        reasons.append(f"🔴 {day_impact} clicks: {target_day_name} is historically slower than usual.")
    else:
        reasons.append(f"⚪ +0 clicks: {target_day_name} traffic is near normal.")

    # 2. Hour of Day explanation
    time_str = f"{target_hour:02d}:00"
    if hour_impact > 2:
        reasons.append(f"🟢 +{hour_impact} clicks: {time_str} is typically an active peak hour.")
    elif hour_impact < -2:
        reasons.append(f"🔴 {hour_impact} clicks: {time_str} is typically an off-peak / night hour.")
    else:
        reasons.append(f"⚪ +0 clicks: {time_str} is around average hourly volume.")

    # 3. Recent Traffic Momentum
    if momentum_impact > 2:
        reasons.append(f"🟢 +{momentum_impact} clicks: Recent traffic in the last 3 hours has been surging.")
    elif momentum_impact < -2:
        reasons.append(f"🔴 {momentum_impact} clicks: Recent traffic has been cooling down.")

    return {
        "short_code": short_code,
        "target_prediction_time": next_time.strftime("%Y-%m-%d %H:%M"),
        "target_day": target_day_name,
        "prediction": {
            "estimated_clicks": round(predicted_val, 1),
            "lower_bound_p10": round(lower_val, 1),
            "upper_bound_p90": round(upper_val, 1),
            "confidence_band": f"Between {round(lower_val, 1)} and {round(upper_val, 1)} clicks"
        },
        "why_breakdown": {
            "baseline_average": round(overall_avg, 1),
            "day_of_week_effect": f"{'+' if day_impact >= 0 else ''}{day_impact}",
            "hour_of_day_effect": f"{'+' if hour_impact >= 0 else ''}{hour_impact}",
            "recent_momentum_effect": f"{'+' if momentum_impact >= 0 else ''}{momentum_impact}",
            "reasons_list": reasons
        },
        "plain_english_summary": (
            f"For {target_day_name} at {time_str}, we estimate ~{round(predicted_val, 0):.0f} clicks. "
            f"Baseline is {round(overall_avg, 1)} clicks, adjusted for {target_day_name} ({'+' if day_impact>=0 else ''}{day_impact}) "
            f"and the {time_str} time window ({'+' if hour_impact>=0 else ''}{hour_impact})."
        )
    }
