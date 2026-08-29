"""
main.py
FastAPI microservice running the DeepSeek-powered LangGraph agent.
"""

import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from graph import build_analytics_graph

app = FastAPI(title="LinkIT DeepSeek Agentic Analytics", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile LangGraph
analytics_agent = build_analytics_graph()


class ChatRequest(BaseModel):
    user_id: int = 1
    username: str = "sameet"
    message: str
    history: Optional[List[dict]] = []


@app.get("/health")
def health():
    has_key = bool(os.getenv("DEEPSEEK_API") or os.getenv("DEEPSEEK_API_KEY"))
    return {
        "status": "ok",
        "service": "linkit-deepseek-agent",
        "deepseek_configured": has_key
    }


@app.post("/chat")
def chat_with_analytics(req: ChatRequest):
    try:
        initial_state = {
            "user_id": req.user_id,
            "username": req.username,
            "messages": req.history + [{"role": "user", "content": req.message}],
            "target_short_codes": [],
            "sql_query": None,
            "sql_result": [],
            "forecast_result": None,
            "anomaly_result": [],
            "comparison_result": None,
            "knowledge_result": None,
            "is_safe": True,
            "security_reason": None,
            "final_answer": "",
        }

        # Run LangGraph with DeepSeek LLM
        final_state = analytics_agent.invoke(initial_state)

        return {
            "answer": final_state["final_answer"],
            "intent": final_state.get("intent"),
            "sql_query": final_state.get("sql_query"),
            "messages": final_state["messages"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
