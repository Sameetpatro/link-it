"""
graph.py
Assembles StateGraph nodes, sets conditional routing edges, and compiles the agent.
"""

from langgraph.graph import StateGraph, END
from state import ConversationState
from nodes import (
    intent_classifier_node,
    sql_analyst_node,
    forecaster_node,
    anomaly_detective_node,
    comparator_node,
    knowledge_base_node,
    security_guard_node,
    insight_synthesizer_node,
    memory_writer_node,
)


def route_by_intent(state: ConversationState) -> str:
    """
    Conditional router mapping intent to execution branch.
    """
    intent = state.get("intent", "GENERAL_CHAT")
    if intent == "SQL_QUERY":
        return "sql_analyst"
    elif intent == "FORECAST":
        return "forecaster"
    elif intent == "ANOMALY_CHECK":
        return "anomaly_detective"
    elif intent == "COMPARE_LINKS":
        return "comparator"
    elif intent == "EXPLAIN_CONCEPT":
        return "knowledge_base"
    return "insight_synthesizer"


def build_analytics_graph():
    """
    Constructs and compiles the full LangGraph state machine.
    """
    workflow = StateGraph(ConversationState)

    # 1. Register Nodes
    workflow.add_node("intent_classifier", intent_classifier_node)
    workflow.add_node("sql_analyst", sql_analyst_node)
    workflow.add_node("forecaster", forecaster_node)
    workflow.add_node("anomaly_detective", anomaly_detective_node)
    workflow.add_node("comparator", comparator_node)
    workflow.add_node("knowledge_base", knowledge_base_node)
    workflow.add_node("security_guard", security_guard_node)
    workflow.add_node("insight_synthesizer", insight_synthesizer_node)
    workflow.add_node("memory_writer", memory_writer_node)

    # 2. Set Entry Point
    workflow.set_entry_point("intent_classifier")

    # 3. Add Conditional Routing from Intent Classifier
    workflow.add_conditional_edges(
        "intent_classifier",
        route_by_intent,
        {
            "sql_analyst": "sql_analyst",
            "forecaster": "forecaster",
            "anomaly_detective": "anomaly_detective",
            "comparator": "comparator",
            "knowledge_base": "knowledge_base",
            "insight_synthesizer": "insight_synthesizer",
        },
    )

    # 4. Route from Tools to Security and Synthesizer
    workflow.add_edge("sql_analyst", "security_guard")
    workflow.add_edge("security_guard", "insight_synthesizer")
    workflow.add_edge("forecaster", "insight_synthesizer")
    workflow.add_edge("anomaly_detective", "insight_synthesizer")
    workflow.add_edge("comparator", "insight_synthesizer")
    workflow.add_edge("knowledge_base", "insight_synthesizer")

    # 5. Output Flow
    workflow.add_edge("insight_synthesizer", "memory_writer")
    workflow.add_edge("memory_writer", END)

    return workflow.compile()
