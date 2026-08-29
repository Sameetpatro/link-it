# LinkIT Agent Service: LangGraph Analytics Architecture

This document describes the state machine, nodes, routing logic, and execution lifecycle of the conversational analytics engine.

## 1. Graph State Diagram

```text
                               +-----------------------------+
                               |            START            |
                               |    Incoming User Message    |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |      intent_classifier      |
                               |  Routes query to specialist |
                               +--------------+--------------+
                                              |
              +---------------+---------------+---------------+---------------+
              |               |               |               |               |
              v               v               v               v               v
      +---------------+---------------+---------------+---------------+---------------+
      |  sql_analyst  |  forecaster   |   anomalies   |  comparator   |   knowledge   |
      | Scoped DB SQL | Step 6 ML API | Anomaly Scans | Multi-URL SQL | ChromaDB Docs |
      +-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
              |               |               |               |               |
              +---------------+---------------+---------------+---------------+
                                              |
                                              v
                               +-----------------------------+
                               |       security_guard        |
                               |  Validates user scope & SQL |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |     insight_synthesizer     |
                               | Structured text generation  |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |        memory_writer        |
                               | Saves context for follow-up |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |             END             |
                               |  Returns response to client |
                               +-----------------------------+
```

## 2. State Definition

The `ConversationState` dictionary is passed and updated across every node in the graph:

| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `int` | ID of the authenticated user making the request. |
| `username` | `str` | Name of the authenticated user. |
| `messages` | `list[dict]` | Full conversation message history. |
| `intent` | `str` | Classified intent category. |
| `target_short_codes` | `list[str]` | Short codes identified in user question. |
| `sql_query` | `str` | Generated SQL query. |
| `sql_result` | `list[dict]` | Database query output. |
| `forecast_result` | `dict` | Output from ML forecasting model. |
| `anomaly_result` | `list[dict]` | List of detected anomalies. |
| `comparison_result` | `dict` | Multi-link comparative metrics. |
| `knowledge_result` | `str` | Vector store context snippets. |
| `is_safe` | `bool` | True if passed security audit. |
| `security_reason` | `str` | Reason for rejection if is_safe is False. |
| `final_answer` | `str` | Final synthesized natural language response. |

## 3. Node Responsibilities

1. **intent_classifier**: Parses natural language prompt into intent categories (SQL_QUERY, FORECAST, ANOMALY_CHECK, COMPARE_LINKS, EXPLAIN_CONCEPT, GENERAL_CHAT).
2. **sql_analyst**: Builds tenant-scoped SELECT queries referencing `click_events`, `urls`, or `traffic_aggregates`.
3. **forecaster**: Connects to the Step 6 FastAPI ML service to retrieve Quantile Gradient Boosting predictions and explanations.
4. **anomaly_detective**: Queries for traffic spikes, drops, and latency shifts.
5. **comparator**: Executes parallel metrics extraction for multiple links.
6. **knowledge_base**: Performs similarity search over ChromaDB for documentation.
7. **security_guard**: Enforces read-only permissions, blocks mutation queries, and verifies user tenancy.
8. **insight_synthesizer**: Structures final response with Key Findings, Supporting Data, and Recommendations.
9. **memory_writer**: Commits current interaction to conversational state for contextual continuity.
