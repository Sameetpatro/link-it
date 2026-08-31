# ⚡ LinkIT v2 — Enterprise URL Management, Telemetry & Predictive Analytics Engine

[![Go Version](https://img.shields.io/badge/Go-1.26+-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Python Version](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![React Version](https://img.shields.io/badge/React-19.2+-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**LinkIT v2** is a distributed, high-throughput URL shortening and traffic intelligence platform. Engineered from the ground up for low-latency redirection, real-time analytics aggregation, asynchronous batch telemetry, Quantile ML traffic forecasting with explainability, and an autonomous multi-agent AI copilot.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [Complete Tech Stack](#-complete-tech-stack)
- [System Architecture](#-system-architecture)
- [Redis Caching Layer & Redirection Engine](#-redis-caching-layer--redirection-engine)
- [Real-Time Analytics & Aggregation Engine](#-real-time-analytics--aggregation-engine)
- [Quantile Gradient Boosting ML Forecasting](#-quantile-gradient-boosting-ml-forecasting)
- [Multi-Agent AI Copilot (LangGraph)](#-multi-agent-ai-copilot-langgraph)
- [Database Schema & Data Pipeline](#-database-schema--data-pipeline)
- [API Reference](#-api-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Production & Reliability Considerations](#-production--reliability-considerations)

---

## 🌟 Key Highlights

- **Sub-Millisecond Redirection:** High-performance Go HTTP redirector with an intelligent **Redis Cache** bypass fallback.
- **Asynchronous Click Ingestion:** Non-blocking buffered channels and multi-goroutine worker pools flushing bulk SQL batch insertions without adding redirect latency.
- **Continuous 5-Minute Time-Bucket Aggregator:** Background aggregator calculating percentile latencies ($P_{50}, P_{95}, P_{99}$), bot ratios, error rates, and unique visitor counts.
- **Quantile Gradient Boosting Forecaster:** Machine Learning regression engine using quantile pinball loss ($\alpha \in \{0.10, 0.50, 0.90\}$) to output median traffic expectations and $[P_{10}, P_{90}]$ confidence bounds with human-readable factor decomposition.
- **Multi-Agent LangGraph Copilot:** An intelligent state machine with dedicated specialized sub-agents for SQL analytics, anomaly detection, competitor link comparison, and conversational querying.
- **Modern Cybernetic Dashboard:** React 19 SPA featuring Apache ECharts, real-time cache hit/miss telemetry dials, and JWT-authenticated link management.

---

## 🛠 Complete Tech Stack

### 1. Backend Core & Redirection (Go)
| Technology | Role | Description |
| :--- | :--- | :--- |
| **Go (Golang 1.26+)** | Core Runtime | High-concurrency backend runtime with native goroutines and channels |
| **Standard `net/http`** | Web Server | Lightweight, zero-dependency REST routing and HTTP redirect handler |
| **`github.com/redis/go-redis/v9`** | Redis Client | Connection-pooled client for fast key-value caching and eviction |
| **`github.com/lib/pq`** | PostgreSQL Driver | Native PostgreSQL driver utilizing connection pooling |
| **`github.com/golang-jwt/jwt/v5`** | Authentication | Stateless HMAC-SHA256 JWT tokens for secure user sessions |
| **`golang.org/x/crypto/bcrypt`** | Security | Cryptographic salted hashing for user authentication |
| **`github.com/joho/godotenv`** | Config Management | Environment configuration loader |

### 2. Machine Learning & Predictive Service (Python)
| Technology | Role | Description |
| :--- | :--- | :--- |
| **Python 3.11+** | ML Runtime | High-level data processing and model execution runtime |
| **FastAPI** | REST API Microservice | High-performance asynchronous API layer exposing prediction endpoints |
| **Uvicorn** | ASGI Web Server | Lightning-fast ASGI server for Python microservices |
| **Scikit-Learn (`GradientBoostingRegressor`)** | ML Algorithm | Quantile loss gradient boosted decision trees for asymmetric bounds |
| **Pandas & NumPy** | Data Processing | Time-series resampling, lag features, and rolling window computations |
| **Psycopg2-binary** | Database Adapter | Direct PostgreSQL connectivity for training data ingestion |

### 3. AI Agent Service (LangGraph & LangChain)
| Technology | Role | Description |
| :--- | :--- | :--- |
| **LangGraph** | Multi-Agent Orchestration | Stateful cyclic graph modeling complex agent workflows and conditional routing |
| **LangChain Core** | Prompt Engineering | LLM integration abstractions, output parsing, and structured tools |
| **ChromaDB** | Vector Database | Semantic embedding store for RAG link context and domain heuristics |
| **Pydantic v2** | Data Validation | Strict schema validation for state transitions and agent outputs |

### 4. Frontend & Visualization (React)
| Technology | Role | Description |
| :--- | :--- | :--- |
| **React 19** | UI Library | Modern component-based declarative interface |
| **Vite 8** | Build Tooling | Next-generation ultra-fast frontend build engine with HMR |
| **Material UI (MUI v9) & Emotion** | Design System | Component library tailored with a custom cybernetic dark theme |
| **Apache ECharts (`echarts-for-react`)** | Data Visualization | Interactive time-series charts, confidence band bounds, and donut breakdowns |
| **Lucide React** | Iconography | Modern, consistent icon set |
| **Axios** | HTTP Client | Promise-based asynchronous HTTP requests with interceptors |

### 5. Storage & Databases
| Technology | Role | Description |
| :--- | :--- | :--- |
| **PostgreSQL 16+** | Primary Relational DB | ACID storage for URLs, users, raw click events, and 5-min aggregate rollups |
| **Redis 7+** | In-Memory Cache | Sub-millisecond lookup cache for `shortCode -> originalURL` mappings |

---

## 🏛 System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["🌐 User & Client Layer"]
        Browser["User Browser / Client Request"]
        Dashboard["React 19 Frontend Dashboard"]
    end

    subgraph GoServer["⚡ Go High-Performance Server (:8080)"]
        Router["Mux Router & CORS Handler"]
        RedirectHandler["Redirect Handler (GET /:code)"]
        URLService["URL Service"]
        WorkerPool["Async Worker Pool (5 Goroutines)"]
        EventChannel["Buffered Channel (Capacity: 10,000)"]
        AggregatorWorker["Traffic Aggregator Worker (1-Min Cron)"]
    end

    subgraph CacheDB["💾 In-Memory & Relational Storage"]
        Redis[("⚡ Redis 7 Cache\nKey: url:{shortCode}")]
        Postgres[("🐘 PostgreSQL 16\n- urls\n- click_events\n- traffic_aggregates")]
    end

    subgraph MLService["🧠 ML Prediction Microservice (:8000)"]
        FastAPI_ML["FastAPI Predictor"]
        FeatureEngine["Time-Series Feature Extractor"]
        QuantileGBM["Quantile Gradient Boosting\n(p10 / p50 / p90 Models)"]
        Explainer["Why-Breakdown Explainability Engine"]
    end

    subgraph AgentService["🤖 LangGraph Multi-Agent Copilot (:8001)"]
        IntentRouter{"Intent Classifier"}
        SQLAgent["SQL Analyst Node"]
        ForecastAgent["Forecaster Node"]
        AnomalyAgent["Anomaly Detective"]
        Synthesizer["Insight Synthesizer"]
        ChromaStore[("ChromaDB Vector Store")]
    end

    %% Redirection Flow
    Browser -->|1. Clicks Short Link| RedirectHandler
    RedirectHandler --> URLService
    URLService -->|2. Fast Cache Check| Redis
    Redis -.->|Cache Miss| Postgres
    RedirectHandler -->|3. HTTP 302 Redirect| Browser
    RedirectHandler -->|4. Non-Blocking Event Push| EventChannel
    EventChannel --> WorkerPool
    WorkerPool -->|5. Batch Insert (100 rows/1s)| Postgres

    %% Aggregation Flow
    AggregatorWorker -->|6. Roll up 5-min traffic buckets| Postgres

    %% Analytics & ML Flow
    Dashboard -->|Fetch Analytics| GoServer
    Dashboard -->|Request AI Copilot| AgentService
    Dashboard -->|Request Traffic Forecast| GoServer
    GoServer -->|Proxy Forecast Request| FastAPI_ML
    FastAPI_ML -->|Query Historical Buckets| Postgres
    FastAPI_ML --> FeatureEngine --> QuantileGBM --> Explainer

    %% Agent Flow
    AgentService --> IntentRouter
    IntentRouter --> SQLAgent & ForecastAgent & AnomalyAgent
    SQLAgent --> Postgres
    ForecastAgent --> FastAPI_ML
    AgentService --> ChromaStore
```

---

## ⚡ Redis Caching Layer & Redirection Engine

To guarantee extreme throughput and minimize database connection contention during viral click spikes, LinkIT v2 employs an asynchronous write-through / lazy cache hydration strategy.

### 1. Sub-Millisecond Read Path
1. When a redirect request hits `/{shortCode}`, `URLService.GetOriginalURL` first inspects Redis under key `url:<shortCode>`.
2. **Cache Hit:** The URL is returned immediately, incrementing an atomic thread-safe counter (`cacheHit.Add(1)`).
3. **Cache Miss:** The service queries PostgreSQL, resolves the URL, and asynchronously sets the Redis key with a 24-hour TTL (`cacheMiss.Add(1)`).
4. **Graceful Fallback:** If Redis is unavailable or crashes, the system automatically runs in pure PostgreSQL fallback mode with zero downtime.

### 2. Live Telemetry & Cache Hit Rate
LinkIT tracks cache metrics dynamically via atomic primitives:
$$\text{Hit Rate (\%)} = \left( \frac{\text{Hits}}{\text{Hits} + \text{Misses}} \right) \times 100$$
These statistics are exposed directly to the frontend's **Engine Vitals** dashboard.

---

## 📊 Real-Time Analytics & Aggregation Engine

### 1. Asynchronous Non-Blocking Event Ingestion
Logging client metadata during a redirect must **never** degrade user latency. LinkIT v2 uses an internal message-passing pipeline:
- The redirect HTTP handler extracts rich telemetry (Client IP, Visitor Fingerprint Hash, Device Type, Browser, OS, Referrer, Geolocation Country/City, Latency, Bot detection).
- The event is pushed into a **buffered Go channel** (`chan model.ClickEvent`, capacity `10,000`).
- A **Worker Pool of 5 dedicated Goroutines** continuously drains the queue.
- Events are batched into chunks of **100 records** or flushed every **1 second** using parameterized multi-row SQL statements (`BatchInsert`), drastically reducing DB IOPS.

### 2. Automated 5-Minute Time-Bucket Rollup
A background `AggregatorWorker` runs every 60 seconds to precompute rollups in `traffic_aggregates`:
- **Epoch Floor Partitioning:**
  ```sql
  to_timestamp(floor(extract(epoch from clicked_at) / 300) * 300) AS bucket_start
  ```
- **Statistical Metric Rollups:**
  - `request_count`: Total clicks in window.
  - `unique_visitors`: Count of distinct visitor hashes.
  - `avg_latency_ms`: Mean handler response duration.
  - `p50_latency_ms`, `p95_latency_ms`, `p99_latency_ms`: Calculated via PostgreSQL `percentile_cont()`.
  - `bot_count` & `error_count`: Filtered telemetry counts.
- **Idempotency:** Utilizes `ON CONFLICT (short_code, bucket_start) DO UPDATE` to ensure aggregate precision even during system reboots.

---

## 🧠 Quantile Gradient Boosting ML Forecasting

Unlike standard regression algorithms that only estimate the mean and assume a symmetrical normal error distribution (often resulting in negative or misleading click forecasts during volatile spikes), LinkIT v2 implements **Quantile Gradient Boosting**.

```
                           ▲ Traffic (Clicks / Hour)
                           │
                           │                 ╭─── Upper Bound (p90 - Surge Peak)
                           │   ╭─────────────┴─────────────╮
                           │  ╭╯   Predicted Median (p50)  │  ◄── Best Guess
                           │ ╭╯                            │
                           ╭─┴─────────────────────────────╯
                           │   ╰─── Lower Bound (p10 - Traffic Floor)
                           │
                           └────────────────────────────────────────► Time
```

### 1. Why Quantile Regression?
Click traffic exhibits extreme skewness, weekend drops, bursty viral spikes, and zero-inflation. Quantile regression fits the model using the **Pinball (Tilted) Loss Function**:

$$\mathcal{L}_\alpha(y, \hat{y}) = \max \Big( \alpha (y - \hat{y}), (\alpha - 1)(y - \hat{y}) \Big)$$

We train three distinct gradient-boosted tree ensembles:
1. **$\alpha = 0.10$ (10th Percentile / Lower Bound):** Represents the reliable traffic floor.
2. **$\alpha = 0.50$ (50th Percentile / Median):** Best estimate of expected traffic.
3. **$\alpha = 0.90$ (90th Percentile / Upper Bound):** Anticipated traffic ceiling for capacity planning.

### 2. Feature Engineering Pipeline
The `predictor.py` service resamples historical 5-minute buckets into hourly intervals and constructs:
- **Temporal Cyclics:** `hour` (0–23), `day_of_week` (0=Monday, 6=Sunday), `is_weekend` flag.
- **Autoregressive Lags:**
  - `lag_1`: Volume in the prior 1-hour window ($t-1$).
  - `lag_2`: Volume in the prior 2-hour window ($t-2$).
- **Momentum Indicators:** `rolling_3h_mean` tracking recent velocity and acceleration.

### 3. Human-Readable "Why-Breakdown" Explainability
Each forecast returns an attribution breakdown translating ML tree outputs into intuitive business drivers:
- **Baseline Average:** The overall link baseline click rate.
- **Day-of-Week Effect:** Historical deviation for this particular day ($+/- \Delta \text{ clicks}$).
- **Hour-of-Day Effect:** Peak vs. off-peak hour adjustments.
- **Momentum Surge:** Real-time surge detection compared to historical averages.

---

## 🤖 Multi-Agent AI Copilot (LangGraph)

LinkIT v2 incorporates an autonomous **LangGraph StateGraph** copilot capable of complex analytical workflows.

```mermaid
graph TD
    UserQuery[User Question / Query] --> IntentClassifier{Intent Classifier}
    
    IntentClassifier -->|SQL Query| SQLAnalyst[SQL Analyst Node]
    IntentClassifier -->|Forecast| Forecaster[Forecaster Node]
    IntentClassifier -->|Anomaly Check| AnomalyDetective[Anomaly Detective Node]
    IntentClassifier -->|Compare Links| Comparator[Comparator Node]
    IntentClassifier -->|Explain / Docs| KnowledgeBase[ChromaDB Knowledge Base]
    
    SQLAnalyst --> SecurityGuard[Security Guardrail Node]
    SecurityGuard --> Synthesizer[Insight Synthesizer]
    Forecaster --> Synthesizer
    AnomalyDetective --> Synthesizer
    Comparator --> Synthesizer
    KnowledgeBase --> Synthesizer
    
    Synthesizer --> MemoryWriter[Memory & State Writer]
    MemoryWriter --> FinalOutput[Rendered Insight & Visuals]
```

- **SQL Analyst Node:** Translates natural language into safe, read-only analytical PostgreSQL queries.
- **Security Guardrail Node:** Sanitizes and blocks malicious SQL injection patterns or schema modifications (`DROP`, `DELETE`, `UPDATE`).
- **Anomaly Detective:** Flags sudden surges, unusual bot activity, or sudden latency degradation.
- **Forecaster Node:** Interacts directly with the Quantile ML engine to summarize future traffic windows.

---

## 🗄 Database Schema & Data Pipeline

```
┌─────────────────────────┐         ┌───────────────────────────────┐
│          urls           │         │         click_events          │
├─────────────────────────┤         ├───────────────────────────────┤
│ id (PK, SERIAL)         │1       *│ id (PK, BIGSERIAL)            │
│ short_code (UNIQUE)     ├─────────┤ short_code (FK)               │
│ original_url            │         │ clicked_at (TIMESTAMPTZ)      │
│ user_id (FK, nullable)  │         │ response_time_ms (FLOAT)      │
│ created_at (TIMESTAMPTZ)│         │ http_status (INT)             │
└─────────────────────────┘         │ visitor_hash, ip_address      │
                                    │ country, city, device, browser│
                                    │ is_bot (BOOLEAN)              │
                                    └───────────────────────────────┘
                                                    │
                                     Rolls up every │ 5 minutes
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │      traffic_aggregates       │
                                    ├───────────────────────────────┤
                                    │ id (PK, BIGSERIAL)            │
                                    │ short_code, user_id           │
                                    │ bucket_start, bucket_end      │
                                    │ request_count, unique_visitors│
                                    │ avg, p50, p95, p99 latency_ms │
                                    │ error_count, bot_count        │
                                    └───────────────────────────────┘
```

---

## 📡 API Reference

### Go Core Backend (`http://localhost:8080`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/shorten` | Shortens a target URL into a Base62 code | Optional (Bearer JWT) |
| `GET` | `/{short_code}` | Redirects (302) to target URL & logs telemetry | No |
| `GET` | `/api/links` | Returns recent links, clicks, and cache stats | Optional (Bearer JWT) |
| `GET` | `/api/analytics/{code}?days=30` | Returns full metrics, time series, & geo distribution | No |
| `GET` | `/api/forecast/{code}?days=30` | Proxies to ML microservice for traffic prediction | No |
| `POST` | `/register` | Registers a new user account | No |
| `POST` | `/login` | Authenticates user and returns JWT token | No |

### ML Predictor Microservice (`http://localhost:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck and service readiness |
| `GET` | `/predict/{short_code}?days=30` | Trains Quantile Gradient Boosting trees and returns prediction + explanation |

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- **Go:** `1.26+` installed
- **Python:** `3.11+` installed
- **Node.js:** `18+` & `npm`
- **PostgreSQL 16+** & **Redis 7+** running locally or via Docker

### 2. Clone and Configure Environment
```bash
git clone https://github.com/your-username/linkit-v2.git
cd linkit-v2
```

Create a `.env` file in the root directory:
```env
# Server
PORT=8080
JWT_SECRET=your_super_secret_jwt_key_here

# PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/linkit?sslmode=disable

# Redis Cache
REDIS_URL=localhost:6379

# ML & Agent Services
ML_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key_here
```

### 3. Initialize Database Migrations
Run the SQL migration scripts in order:
```bash
psql -d linkit -f migrations/001_create_urls.sql
psql -d linkit -f migrations/002_create_click_events.sql
psql -d linkit -f migrations/003_create_users.sql
psql -d linkit -f migrations/004_create_traffic_aggregates.sql
psql -d linkit -f migrations/005_create_powerbi_views.sql
```

### 4. Start the ML Service
```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000
```

### 5. Start the Agent Service (Optional for AI Copilot)
```bash
cd agent_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
# Running on http://localhost:8001
```

### 6. Start the Go Backend Server
```bash
# In project root
go run main.go
# Running on http://localhost:8080
```

### 7. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## ⚙️ Configuration & Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/linkit?sslmode=disable` | PostgreSQL connection string |
| `REDIS_URL` | `localhost:6379` | Redis host/port or URL |
| `JWT_SECRET` | `linkit_secret` | Secret key used to sign and verify JWT auth tokens |
| `ML_SERVICE_URL` | `http://localhost:8000` | URL to the Python FastAPI prediction service |
| `OPENAI_API_KEY` | — | API key for LangGraph agent reasoning nodes |

---

## 🔒 Production & Reliability Considerations

- **Connection Pool Hardening:** Go database connections are constrained to `SetMaxOpenConns(25)` and `SetMaxIdleConns(5)` with a 5-minute max lifetime to prevent pool starvation.
- **Graceful Shutdown:** The server captures `SIGINT` and `SIGTERM` OS signals, gracefully terminating HTTP connections within a 5-second deadline while safely completing background worker flushes and aggregate calculations.
- **Bot Filtering:** User-agents are evaluated for crawler signatures (`Googlebot`, `bingbot`, `Twitterbot`, `curl`, etc.) to prevent analytics corruption.
- **Data Retention & Aggregation:** Raw `click_events` are compressed into `traffic_aggregates`, enabling long-term BI reporting without table bloat.

---
