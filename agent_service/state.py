"""
state.py
Defines the ConversationState schema used across all LangGraph nodes.
"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict


class ConversationState(TypedDict):
    user_id: int
    username: str
    messages: List[Dict[str, str]]
    
    intent: Optional[str]
    target_short_codes: List[str]
    
    sql_query: Optional[str]
    sql_result: List[Dict[str, Any]]
    forecast_result: Optional[Dict[str, Any]]
    anomaly_result: List[Dict[str, Any]]
    comparison_result: Optional[Dict[str, Any]]
    knowledge_result: Optional[str]
    
    is_safe: bool
    security_reason: Optional[str]
    
    final_answer: str
