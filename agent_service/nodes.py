"""
nodes.py
State transformation nodes powered by DeepSeek-V3 LLM.
"""

import json
import os
import re
from typing import Any, Dict
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI

from state import ConversationState
from tools import (
    execute_scoped_sql,
    get_detected_anomalies,
    get_traffic_forecast,
    search_knowledge_base,
)

# Load environment variables (.env)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

# Initialize DeepSeek Chat Model
deepseek_api_key = os.getenv("DEEPSEEK_API") or os.getenv("DEEPSEEK_API_KEY")

llm = ChatOpenAI(
    model="deepseek-chat",
    api_key=deepseek_api_key,
    base_url="https://api.deepseek.com",
    temperature=0.2,
)


def intent_classifier_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 1: DeepSeek classifies the user's intent and extracts any short codes.
    """
    last_message = state["messages"][-1]["content"]

    system_prompt = """
You are the LinkIT Intent Router. Analyze the user's message and output JSON only.
Choose one intent from:
- "SQL_QUERY": Asking about historical clicks, countries, devices, referrers, or link stats.
- "FORECAST": Asking to predict or forecast future traffic.
- "ANOMALY_CHECK": Asking about traffic spikes, drops, bot attacks, or unusual behavior.
- "COMPARE_LINKS": Asking to compare performance between two or more links.
- "EXPLAIN_CONCEPT": Asking conceptual questions (e.g. what is P95, how does caching work).
- "GENERAL_CHAT": Greetings or general conversation.

Output JSON format strictly:
{
    "intent": "<ONE_OF_THE_ABOVE>",
    "target_short_codes": ["code1", "code2"]
}
"""
    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=last_message)
        ])
        
        # Clean any markdown code blocks
        clean_json = response.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_json)
        
        return {
            "intent": parsed.get("intent", "SQL_QUERY"),
            "target_short_codes": parsed.get("target_short_codes", []),
            "is_safe": True
        }
    except Exception:
        # Heuristic fallback if LLM JSON parsing fails or API key has insufficient balance
        stopwords = {"predict", "forecast", "compare", "anomaly", "check", "explain", "latency", "traffic", "aggregate", "for", "the", "and", "with", "link", "code", "this", "that", "what", "from", "many", "how", "all", "our", "are"}
        codes = [w.strip("?,.'\"") for w in last_message.split() if len(w.strip("?,.'\"")) >= 3 and w.strip("?,.'\"").lower() not in stopwords and w.strip("?,.'\"").isalnum()]
        intent = "SQL_QUERY"
        msg_lower = last_message.lower()
        if "predict" in msg_lower or "forecast" in msg_lower:
            intent = "FORECAST"
        elif "anomaly" in msg_lower or "spike" in msg_lower or "drop" in msg_lower:
            intent = "ANOMALY_CHECK"
        elif "compare" in msg_lower:
            intent = "COMPARE_LINKS"
        elif "what is" in msg_lower or "how does" in msg_lower or "explain" in msg_lower or "p95" in msg_lower or "p50" in msg_lower:
            intent = "EXPLAIN_CONCEPT"
        return {"intent": intent, "target_short_codes": codes, "is_safe": True}


def sql_analyst_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 2: DeepSeek generates tenant-scoped PostgreSQL queries.
    """
    user_id = state["user_id"]
    last_message = state["messages"][-1]["content"]
    codes = state.get("target_short_codes", [])
    code = codes[0] if codes else ""

    system_prompt = f"""
You are an expert PostgreSQL DBA for LinkIT.
Database Schema:
- click_events (id, short_code, clicked_at, response_time_ms, http_status, is_bot, device_type, browser, os, country, city, referer, visitor_hash)
- urls (id, short_code, original_url, user_id, created_at)
- traffic_aggregates (id, short_code, user_id, bucket_start, request_count, avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_count, bot_count)

SECURITY RULES:
1. ONLY generate SELECT queries. Never generate INSERT, UPDATE, DELETE, or DROP.
2. ALWAYS filter urls by user_id = {user_id} or short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id}).
3. Target short_code is: '{code}' (if specified).

Output ONLY the raw SQL query, without markdown blocks.
"""
    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=last_message)
        ])
        query = response.content.replace("```sql", "").replace("```", "").strip()
        return {"sql_query": query}
    except Exception as e:
        # Fallback default query
        query = f"SELECT COUNT(*) AS total_clicks FROM click_events WHERE short_code = '{code}' AND short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id});"
        return {"sql_query": query}


def forecaster_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 3: Calls the ML microservice for traffic prediction.
    """
    codes = state.get("target_short_codes", [])
    code = codes[0] if codes else "demo"
    result = get_traffic_forecast(code, days=30)
    return {"forecast_result": result}


def anomaly_detective_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 4: Scans for unexpected surges or performance regressions.
    """
    codes = state.get("target_short_codes", [])
    code = codes[0] if codes else "demo"
    anomalies = get_detected_anomalies(code, state["user_id"])
    return {"anomaly_result": anomalies}


def comparator_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 5: Pulls side-by-side performance metrics for comparison queries.
    """
    codes = state.get("target_short_codes", [])
    user_id = state["user_id"]
    if len(codes) < 2:
        codes = codes + ["demo"]

    comparison = {}
    for c in codes[:2]:
        query = f"""
            SELECT COUNT(id) AS total_clicks, COUNT(DISTINCT visitor_hash) AS unique_visitors
            FROM click_events
            WHERE short_code = '{c}'
              AND short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id});
        """
        rows = execute_scoped_sql(query, user_id)
        comparison[c] = rows[0] if rows else {"total_clicks": 0, "unique_visitors": 0}

    return {"comparison_result": comparison}


def knowledge_base_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 6: Searches vector documentation for conceptual questions.
    """
    last_msg = state["messages"][-1]["content"]
    answer = search_knowledge_base(last_msg)
    return {"knowledge_result": answer}


def security_guard_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 7: Validates safety of generated queries before database execution.
    """
    query = state.get("sql_query")
    if not query:
        return {"is_safe": True}

    forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "GRANT"]
    for keyword in forbidden:
        if re.search(r'\b' + keyword + r'\b', query, re.IGNORECASE):
            return {
                "is_safe": False,
                "security_reason": f"Security violation: Query contains forbidden command '{keyword}'."
            }

    try:
        results = execute_scoped_sql(query, state["user_id"])
        return {"is_safe": True, "sql_result": results}
    except Exception as e:
        return {"is_safe": False, "security_reason": str(e)}


def insight_synthesizer_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 8: DeepSeek synthesizes the final human-readable response.
    """
    if not state.get("is_safe", True):
        return {"final_answer": f"Request blocked by Security Guard: {state.get('security_reason')}"}

    system_prompt = """
You are the LinkIT Conversational Analytics Assistant.
Analyze the data collected by our analytics tools and provide a clear, professional answer.

Structure your response with:
1. Direct Answer / Key Finding
2. Supporting Data Points (numbers, percentages, comparisons)
3. Actionable Takeaway / Suggestion

Keep your tone helpful, concise, and executive-ready.
"""
    data_context = {
        "user_question": state["messages"][-1]["content"],
        "intent": state.get("intent"),
        "sql_result": state.get("sql_result"),
        "forecast_result": state.get("forecast_result"),
        "anomaly_result": state.get("anomaly_result"),
        "comparison_result": state.get("comparison_result"),
        "knowledge_result": state.get("knowledge_result"),
    }

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Context from analytics tools:\n{json.dumps(data_context, default=str)}")
        ])
        return {"final_answer": response.content}
    except Exception as e:
        return {"final_answer": f"Analysis complete. Result: {data_context}"}


def memory_writer_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 9: Appends final response to conversational history.
    """
    updated_messages = list(state["messages"])
    updated_messages.append({"role": "assistant", "content": state["final_answer"]})
    return {"messages": updated_messages}
