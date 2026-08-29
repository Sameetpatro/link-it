"""
main.py
FastAPI microservice exposing the LangGraph conversational analytics endpoint.
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from graph import build_analytics_graph

app = FastAPI(title="LinkIT Agentic Analytics Service", version="2.0.0")

# Compile LangGraph app
analytics_agent = build_analytics_graph()


class ChatRequest(BaseModel):
    user_id: int
    username: str = "sameet"
    message: str
    history: Optional[List[dict]] = []


@app.get("/health")
def health():
    return {"status": "ok", "service": "linkit-agent-service"}


@app.post("/chat")
def chat_with_analytics(req: ChatRequest):
    """
    Executes the multi-agent graph pipeline on the user prompt.
    """
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

        # Execute Graph
        final_state = analytics_agent.invoke(initial_state)

        return {
            "answer": final_state["final_answer"],
            "intent": final_state.get("intent"),
            "messages": final_state["messages"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
