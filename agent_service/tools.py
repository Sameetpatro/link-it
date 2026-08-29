"""
tools.py
Database and ML bridge tools.
"""

import os
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()


def get_db_url() -> str:
    return os.getenv("DATABASE_URL") or os.getenv("DB") or ""


def execute_scoped_sql(query: str, user_id: int) -> List[Dict[str, Any]]:
    db_url = get_db_url()
    if not db_url:
        raise ValueError("DATABASE_URL / DB environment variable is not set.")

    conn = psycopg2.connect(db_url)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query)
        rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_traffic_forecast(short_code: str, days: int = 30) -> Dict[str, Any]:
    ml_url = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
    try:
        resp = requests.get(f"{ml_url}/predict/{short_code}?days={days}", timeout=5)
        if resp.status_code == 200:
            return resp.json()
        return {"error": f"ML Service returned status {resp.status_code}"}
    except Exception as e:
        return {"error": f"Failed to connect to ML service: {str(e)}"}


def get_detected_anomalies(short_code: str, user_id: int) -> List[Dict[str, Any]]:
    db_url = get_db_url()
    if not db_url:
        return []

    conn = psycopg2.connect(db_url)
    query = """
        SELECT bucket_start, request_count, avg_latency_ms, bot_count
        FROM traffic_aggregates
        WHERE short_code = %s
          AND short_code IN (SELECT short_code FROM urls WHERE user_id = %s)
          AND (avg_latency_ms > 200 OR bot_count > 10)
        ORDER BY bucket_start DESC
        LIMIT 10;
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, (short_code, user_id))
        rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def search_knowledge_base(query: str) -> str:
    knowledge = {
        "p95": "P95 latency represents the 95th percentile response time, meaning 95% of redirect requests finished faster than this threshold.",
        "p50": "P50 is the median latency where 50% of requests are faster and 50% are slower.",
        "gradient_boosting": "Quantile Gradient Boosting builds an ensemble of decision trees that learn sequentially from residual errors to forecast lower (P10), median (P50), and upper (P90) traffic bounds.",
        "5min_buckets": "Traffic aggregates are rolled up every 5 minutes by an asynchronous background worker to avoid expensive table scans on raw click events."
    }
    query_lower = query.lower()
    for k, v in knowledge.items():
        if k in query_lower:
            return v
    return "LinkIT is an enterprise URL shortening platform with high-concurrency event ingestion, 5-minute aggregations, and ML forecasting."
