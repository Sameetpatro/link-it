"""
nodes.py
State transformation nodes for the LangGraph agent pipeline.
"""

import re
from state import ConversationState
from tools import execute_scoped_sql, get_traffic_forecast, get_detected_anomalies, search_knowledge_base


def intent_classifier_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 1: Analyzes user input and identifies the primary intent and target short codes.
    """
    last_message = state["messages"][-1]["content"].lower()
    
    # Extract short code patterns (e.g. alphanumeric strings)
    words = state["messages"][-1]["content"].split()
    codes = [w.strip("?,.'\"") for w in words if len(w) in [6, 7] and w.isalnum()]
    
    intent = "SQL_QUERY"
    if "predict" in last_message or "forecast" in last_message or "tomorrow" in last_message:
        intent = "FORECAST"
    elif "spike" in last_message or "drop" in last_message or "anomaly" in last_message or "unusual" in last_message:
        intent = "ANOMALY_CHECK"
    elif "compare" in last_message or "versus" in last_message or "vs" in last_message:
        intent = "COMPARE_LINKS"
    elif "what is" in last_message or "explain" in last_message or "how does" in last_message:
        intent = "EXPLAIN_CONCEPT"
    elif last_message in ["hi", "hello", "help", "who are you"]:
        intent = "GENERAL_CHAT"

    return {
        "intent": intent,
        "target_short_codes": codes,
        "is_safe": True
    }


def sql_analyst_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 2: Generates and runs a tenant-scoped SQL query based on the user's question.
    """
    user_id = state["user_id"]
    codes = state.get("target_short_codes", [])
    code = codes[0] if codes else ""
    last_msg = state["messages"][-1]["content"].lower()

    if "country" in last_msg or "where" in last_msg:
        query = f"""
            SELECT country, COUNT(id) AS clicks
            FROM click_events
            WHERE short_code = '{code}'
              AND short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id})
            GROUP BY country ORDER BY clicks DESC LIMIT 5;
        """
    elif "device" in last_msg or "browser" in last_msg:
        query = f"""
            SELECT device_type, browser, COUNT(id) AS clicks
            FROM click_events
            WHERE short_code = '{code}'
              AND short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id})
            GROUP BY device_type, browser ORDER BY clicks DESC LIMIT 5;
        """
    else:
        query = f"""
            SELECT COUNT(id) AS total_clicks, COUNT(DISTINCT visitor_hash) AS unique_visitors, AVG(response_time_ms) AS avg_latency
            FROM click_events
            WHERE short_code = '{code}'
              AND short_code IN (SELECT short_code FROM urls WHERE user_id = {user_id});
        """

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

    # Execute SQL if safe
    try:
        results = execute_scoped_sql(query, state["user_id"])
        return {"is_safe": True, "sql_result": results}
    except Exception as e:
        return {"is_safe": False, "security_reason": str(e)}


def insight_synthesizer_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 8: Synthesizes final response with Key Findings, Supporting Data, and Suggestions.
    """
    intent = state.get("intent", "GENERAL_CHAT")
    
    if not state.get("is_safe", True):
        return {"final_answer": f"Request blocked by Security Guard: {state.get('security_reason')}"}

    if intent == "FORECAST":
        fc = state.get("forecast_result", {})
        if "prediction" in fc:
            p = fc["prediction"]
            summary = fc.get("plain_english_summary", "")
            ans = f"Forecast for link:\n\n{summary}\n\nExpected: {p.get('estimated_clicks')} clicks (Range: {p.get('lower_bound_p10')} to {p.get('upper_bound_p90')} clicks)."
        else:
            ans = "Forecast unavailable: Insufficient data for this link."

    elif intent == "SQL_QUERY":
        res = state.get("sql_result", [])
        ans = f"Query Results:\n{str(res)}"

    elif intent == "ANOMALY_CHECK":
        anoms = state.get("anomaly_result", [])
        if anoms:
            ans = f"Detected {len(anoms)} anomaly events for this link. Recent records indicate elevated latency or high bot activity."
        else:
            ans = "No critical anomalies detected for this link in the requested window."

    elif intent == "COMPARE_LINKS":
        cmp_data = state.get("comparison_result", {})
        ans = f"Link Comparison Summary:\n{str(cmp_data)}"

    elif intent == "EXPLAIN_CONCEPT":
        ans = state.get("knowledge_result", "Documentation information retrieved.")

    else:
        ans = "Hello! I am your LinkIT Conversational Analytics Assistant. You can ask me to forecast traffic, detect spikes, compare links, or explain metrics."

    return {"final_answer": ans}


def memory_writer_node(state: ConversationState) -> Dict[str, Any]:
    """
    Node 9: Appends final response to conversational history.
    """
    updated_messages = list(state["messages"])
    updated_messages.append({"role": "assistant", "content": state["final_answer"]})
    return {"messages": updated_messages}
