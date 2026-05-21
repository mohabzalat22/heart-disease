# 📊 CardioAI — System Diagrams & Architecture

This document contains high-fidelity Mermaid diagrams detailing the architectural, database, transactional, operational, and data flow layers of the **CardioAI** platform.

---

## 📋 Table of Contents

1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Database ER Diagram](#2-database-er-diagram)
3. [Sequence Diagram](#3-sequence-diagram)
4. [Use Case Diagram](#4-use-case-diagram)
5. [DFD Level 0 — Context Diagram](#5-dfd-level-0-context-diagram)
6. [Class Diagram](#6-class-diagram)
7. [System Integration & Prediction Methodology](#7-system-integration-prediction-methodology)
8. [UML Activity Diagram — Dynamic Token Auditing & num_predict](#8-uml-activity-diagram--dynamic-token-auditing--num_predict-generation-limits)

---

## 1. System Architecture Diagram

This diagram represents the multi-tiered architecture of CardioAI, highlighting the presentation (client), server-side application logic, data access, database, and third-party integration layers.

```mermaid
flowchart TB
    subgraph Client ["Presentation Layer (Next.js Client)"]
        UI["Next.js Pages & App Router Layouts<br/>(Tailwind CSS v4 + next-themes)"]
        ChatUI["Chat Interface Component<br/>(Framer Motion + Lucide React)"]
        AdminUI["Admin Dashboard UI<br/>(Log viewer, User toggler, Prompt editor)"]
        Store["Client State Store<br/>(React Hooks & Context)"]
    end

    subgraph Server ["Application & API Layer (Next.js Node.js Server)"]
        API["API Route Handlers<br/>(/api/chat, /api/auth)"]
        Actions["Server Actions<br/>(Settings & Admin configuration)"]

        subgraph Services ["Business Logic Services"]
            AI["aiService.ts<br/>(Ollama & Prompt Orchestration)"]
            MCP["mcpClientService.ts<br/>(SSE Tool Invoker)"]
            CS["chatService.ts<br/>(Chat Management)"]
            AS["authService.ts<br/>(Bcrypt & JWT Auth)"]
        end
    end

    subgraph Data ["Data Access Layer (Prisma ORM)"]
        Prisma["Prisma Client v7"]
        subgraph Repositories ["Database Repositories"]
            UR["userRepo.ts"]
            CR["chatRepository.ts"]
            MR["messageRepository.ts"]
            PR["promptRepo.ts"]
            SR["systemRepo.ts"]
        end
    end

    subgraph Infra ["Infrastructure & External Ecosystem"]
        DB[(PostgreSQL Database)]
        Ollama[["Ollama LLM Engine<br/>(Local HTTP :11434)"]]
        MCPServer[["External MCP Server<br/>(SSE Tool Provider)"]]
    end

    %% Component Interconnections
    UI --> API
    UI --> Actions
    AdminUI --> Actions
    ChatUI --> UI
    Store --> UI

    API --> AI
    API --> CS
    API --> AS
    Actions --> CS
    Actions --> AS

    AI --> MCP
    AI --> UR
    AI --> MR
    AI --> PR
    AI --> SR
    CS --> CR
    CS --> MR
    AS --> UR

    UR --> Prisma
    CR --> Prisma
    MR --> Prisma
    PR --> Prisma
    SR --> Prisma
    Prisma --> DB

    AI <--> Ollama
    MCP <--> MCPServer

    %% Visual Styling
    classDef client fill:#e0f7fa,stroke:#00acc1,stroke-width:2px;
    classDef server fill:#efebe9,stroke:#8d6e63,stroke-width:2px;
    classDef services fill:#fff3e0,stroke:#ffb74d,stroke-width:2px;
    classDef data fill:#e8f5e9,stroke:#81c784,stroke-width:2px;
    classDef infra fill:#eceff1,stroke:#90a4ae,stroke-width:2px;

    class UI,ChatUI,AdminUI,Store client;
    class API,Actions server;
    class AI,MCP,CS,AS services;
    class Prisma,UR,CR,MR,PR,SR data;
    class DB,Ollama,MCPServer infra;
```

---

## 2. Database ER Diagram

A visual representation of the PostgreSQL schema defined in `prisma/schema.prisma`. It represents entities, unique identifiers, properties, and relationships.

```mermaid
erDiagram
    User ||--o{ Chat : "owns"
    User ||--o| Prompt : "defines custom system prompt"
    Chat ||--|{ Message : "contains"

    User {
        Int id PK "autoincrement"
        String name "Full Name"
        String email UK "Unique Email Address"
        String password "Hashed Password"
        String image "Optional Avatar URL"
        Role role "USER | ADMIN (default: USER)"
        Int tokens "Token Balance (default: 500)"
        Boolean isActive "Account State (default: true)"
    }

    Chat {
        Int id PK "autoincrement"
        String title "Optional Chat Session Title"
        String token UK "Unique Chat Room Token"
        Int userId FK "References User.id"
        DateTime createdAt "Timestamp of creation (default: now)"
        Boolean isShared "Publicly accessible (default: false)"
        DateTime sharedAt "Optional sharing timestamp"
    }

    Message {
        Int id PK "autoincrement"
        Int chatId FK "References Chat.id"
        Actor actor "USER | ASSISTANT"
        String message "Text content of the message"
        DateTime createdAt "Timestamp of creation (default: now)"
    }

    Prompt {
        Int id PK "autoincrement"
        String prompt "Custom System Instructions override"
        Int userId FK "Unique reference to User.id"
    }

    SystemConfig {
        Int id PK "Default ID of 1"
        String defaultPrompt "Global Default System Prompt"
        DateTime updatedAt "Timestamp of last modification"
    }
```

---

## 3. Sequence Diagram

This sequence diagram outlines the entire request lifecycle of a conversational heart disease risk assessment, highlighting user authentication, token quota balance checks, prompt composition, dynamic MCP tool calls, Ollama response generation, and final database sync.

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient / User
    participant FE as Next.js Frontend
    participant API as /api/chat API Route
    participant DB as Postgres DB (via Repos)
    participant AI as AIService
    participant MCP as MCPClientService
    participant LLM as Local Ollama LLM
    participant MCPS as External MCP Server

    User->>FE: Input health metrics & message
    FE->>API: HTTP POST /api/chat (Message, Chat Token, JWT Cookie)

    activate API
    API->>DB: Verify JWT and retrieve User Session
    DB-->>API: User details (Active status, Role, Tokens)

    alt User is inactive or has insufficient tokens
        API-->>FE: HTTP 403 Forbidden / 402 Payment Required
        FE-->>User: Show system warning message
    else User is authorized
        API->>DB: Fetch SystemConfig (Default prompt) & User Custom Prompt
        DB-->>API: Active System Prompt

        API->>AI: sendMessage(chatHistory, userMessage, systemPrompt)
        activate AI

        AI->>MCP: getAvailableTools()
        activate MCP
        MCP->>MCPS: GET/SSE Handshake / Fetch Tool Definitions
        MCPS-->>MCP: Tool list (predict_heart_disease)
        MCP-->>AI: Register tool definitions in model context
        deactivate MCP

        AI->>LLM: POST /api/chat (History + System Prompt + Tools)
        activate LLM
        Note over LLM: Model processes request,<br/>recognizes clinical health data,<br/>and triggers tool prediction flow
        LLM-->>AI: Tool Call Request (predict_heart_disease with arguments)
        deactivate LLM

        AI->>MCP: executeTool("predict_heart_disease", args)
        activate MCP
        MCP->>MCPS: POST /tools/call (predict_heart_disease, args)
        MCPS-->>MCP: Prediction Result (e.g., riskScore: 78%, highRisk: true)
        MCP-->>AI: Return structured JSON results
        deactivate MCP

        AI->>LLM: POST /api/chat (Provide Tool Result back to LLM)
        activate LLM
        Note over LLM: Formulate conversational response<br/>explaining the risk percentage & recommendations
        LLM-->>AI: Final conversational assistant response
        deactivate LLM

        AI->>DB: Deduct computed token count from User's balance
        AI->>DB: Save User & Assistant messages to Message table

        AI-->>API: Return final response & token metadata
        deactivate AI

        API-->>FE: HTTP 200 OK (Response JSON + remaining tokens)
        deactivate API

        FE->>FE: Update store state & trigger entrance transitions
        FE-->>User: Display AI response & updated token count
    end
```

---

## 4. Use Case Diagram

This diagram maps system boundaries and shows how registered patients and administrative users interact with CardioAI's features, backed by local LLMs and MCP servers.

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["Actors"]
        UserActor["🫀 Patient / User"]
        AdminActor["⚙️ Administrator"]
        OllamaActor["🤖 Ollama LLM API<br/>(Supporting System)"]
        MCPActor["🛠️ MCP Server<br/>(Supporting System)"]
    end

    %% System Boundary
    subgraph CardioAI ["System Boundary: CardioAI Application"]
        %% User Use Cases
        UC1((Sign Up / Register))
        UC2((Log In / Authenticate))
        UC3((Manage Chat Sessions<br/>'Create, Delete, Rename'))
        UC4((Chat with AI Assistant))
        UC5((Run Clinical Risk Prediction))
        UC6((Share Health Assessment))
        UC7((Manage Profile Settings))
        UC8((View Token Balance))

        %% Admin Use Cases
        UC9((Manage Users<br/>'Search & Toggle Status'))
        UC10((Edit Default System Prompt))
        UC11((Monitor System Logs))
    end

    %% Relationships - User
    UserActor --> UC1
    UserActor --> UC2
    UserActor --> UC3
    UserActor --> UC4
    UserActor --> UC6
    UserActor --> UC7
    UserActor --> UC8

    %% Includes & Extends relations
    UC4 -.->|"<<include>> Check Quota"| UC8
    UC4 -.->|"<<include>>"| UC5

    %% Supporting systems
    UC4 --- OllamaActor
    UC5 --- MCPActor

    %% Relationships - Admin
    AdminActor --> UC2
    AdminActor --> UC9
    AdminActor --> UC10
    AdminActor --> UC11

    %% Styling
    classDef actor fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,shape:rect;
    classDef usecase fill:#fff9c4,stroke:#fbc02d,stroke-width:1.5px,shape:circle;
    classDef system fill:#fafafa,stroke:#37474f,stroke-width:2px;

    class UserActor,AdminActor,OllamaActor,MCPActor actor;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11 usecase;
    class CardioAI system;
```

---

## 5. DFD Level 0 — Context Diagram

The Data Flow Diagram (DFD) Level 0 illustrates the boundary of the **CardioAI** platform, depicting a unified central system process interacting cleanly with human actors and external intelligent services.

```mermaid
flowchart LR
    %% External Entities (Left Side - Human Actors)
    subgraph HumanActors ["Human Actors"]
        User["👤 Patient / User"]
        Admin["⚙️ Administrator"]
    end

    %% Central Process (Middle)
    System(("🫀 CardioAI Platform<br/><b>Process 0</b>"))

    %% External Systems (Right Side - Supporting Services)
    subgraph Services ["External Systems"]
        Ollama["🤖 Ollama LLM Engine"]
        MCP["🛠️ MCP Server"]
    end

    %% Data flows - User & System
    User -->|Auth credentials | System
    System -->|AI responses | User

    %% Data flows - Admin & System
    Admin -->|Prompt configurations | System
    System -->|System logs & user accounts| Admin

    %% Data flows - System & Ollama LLM
    System -->|Chat history & tool schemas| Ollama
    Ollama -->|Responses & tool calls| System

    %% Data flows - System & MCP Server
    System -->|Clinical health arguments| MCP
    MCP -->|Heart disease predictions | System

    %% Styling & Aesthetics
    classDef human fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px,color:#0369a1;
    classDef process fill:#fff7ed,stroke:#f97316,stroke-width:3px,color:#9a3412;
    classDef external fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#166534;

    class User,Admin human;
    class System process;
    class Ollama,MCP external;

    style HumanActors fill:#f8fafc,stroke:#e2e8f0,stroke-width:1.5px,stroke-dasharray: 4 4;
    style Services fill:#f8fafc,stroke:#e2e8f0,stroke-width:1.5px,stroke-dasharray: 4 4;
```

---

## 6. Class Diagram

This UML Class Diagram represents the structural blueprint of the **CardioAI** platform, depicting the Psuedo object-oriented structure, repositories, business logic services, methods, and relationships.

```mermaid
classDiagram
    direction TB

    class AuthService {
        +signUp(data: SignUpData) static
        +signIn(data: SignInData) static
    }

    class AIService {
        +respond(chatId: number, userId: number) static
        +saveResponse(chatId: number, message: string) static
    }

    class MCPClientService {
        -instance: MCPClientService static
        -getClient() Client
        +getInstance() MCPClientService static
        +connect() void
        +listTools() Promise
        +predictHeartDisease(args: PredictHeartDiseaseArgs) Promise
        +callTool(name: string, args: Record) Promise
    }

    class ChatService {
        +create(data: CreateChat) static
        +getAll(userId: number) static
        +getById(id: number) static
        +getByToken(token: string) static
        +update(id: number, data: Partial) static
        +deleteById(id: number) static
        +deleteByToken(token: string) static
    }

    class MessageService {
        +create(data: CreateMessage) static
        +getAll(chatId: number) static
        +getById(id: number) static
        +update(id: number, data: Partial) static
        +deleteById(id: number) static
    }

    class AdminActions {
        -checkAdmin() Promise
        +updateGlobalPrompt(prompt: string) Promise
        +getGlobalPrompt() Promise
        +getLogs(page: number, pageSize: number, level: string, date: string) Promise
        +getAllUsers() Promise
        +toggleUserStatus(userId: number, isActive: boolean) Promise
        +updateUserTokens(userId: number, tokens: number) Promise
    }

    class UserRepo {
        +findByEmail(email: string) static
        +findById(id: number) static
        +createUser(data: UserCreateInput) static
        +updateUser(id: number, data: UserUpdateInput) static
        +findAll() static
        +updateStatus(id: number, isActive: boolean) static
        +checkTokenBalance(userId: number) static
        +deductTokens(userId: number, amount: number) static
        +setTokens(id: number, tokens: number) static
        +refundChatToken(userId: number) static
    }

    class ChatRepository {
        +create(data: CreateChat) static
        +getAll(userId: number) static
        +getById(id: number) static
        +getByToken(token: string) static
        +update(id: number, data: Partial) static
        +deleteById(id: number) static
        +deleteByToken(token: string) static
    }

    class MessageRepository {
        +create(data: CreateMessage) static
        +getAll(chatId: number) static
        +getById(id: number) static
        +update(id: number, data: Partial) static
        +deleteById(id: number) static
    }

    class PromptRepo {
        +findByUserId(userId: number) static
        +upsertPrompt(userId: number, prompt: string) static
    }

    class SystemRepo {
        +getDefaultPrompt() static
        +updateDefaultPrompt(prompt: string) static
    }

    %% Relationships
    AuthService ..> UserRepo : "authenticates via"
    AIService ..> MessageService : "reads/saves messages via"
    AIService ..> UserRepo : "checks/deducts tokens via"
    AIService ..> MCPClientService : "lists/calls tools via"
    ChatService ..> ChatRepository : "delegates DB ops"
    MessageService ..> MessageRepository : "delegates DB ops"
    AdminActions ..> UserRepo : "manages users/roles via"
    AdminActions ..> SystemRepo : "configures global default prompt via"

    %% Styling
    style AuthService fill:#e0f7fa,stroke:#00acc1,stroke-width:1.5px
    style AIService fill:#e0f7fa,stroke:#00acc1,stroke-width:1.5px
    style MCPClientService fill:#e0f7fa,stroke:#00acc1,stroke-width:1.5px
    style ChatService fill:#e0f7fa,stroke:#00acc1,stroke-width:1.5px
    style MessageService fill:#e0f7fa,stroke:#00acc1,stroke-width:1.5px
    style AdminActions fill:#efebe9,stroke:#8d6e63,stroke-width:1.5px

    style UserRepo fill:#e8f5e9,stroke:#81c784,stroke-width:1.5px
    style ChatRepository fill:#e8f5e9,stroke:#81c784,stroke-width:1.5px
    style MessageRepository fill:#e8f5e9,stroke:#81c784,stroke-width:1.5px
    style PromptRepo fill:#e8f5e9,stroke:#81c784,stroke-width:1.5px
    style SystemRepo fill:#e8f5e9,stroke:#81c784,stroke-width:1.5px
```

---

## 7. System Integration & Prediction Methodology

The CardioAI methodology utilizes a high-performance orchestration system that integrates local Large Language Models (LLMs) with standard clinical APIs. Below is the workflow detailing how raw chat conversations are dynamically enriched with structured medical inference.

### Technical Principles & Pipelines

1. **Information Ingestion & Sanitization**: Patient messages are streamed via Next.js routes. System filters custom settings & prompts to format context.
2. **Dynamic Tool Schema Injections**: The Model Context Protocol (MCP) server dynamically presents capabilities (like `predict_heart_disease`) to the LLM agent container using Server-Sent Events (SSE).
3. **Agentic Inference**: The local LLM processes conversation history. When structured clinical variables are detected in natural language, it executes the predictive tool model.
4. **PostgreSQL Ledger Auditing**: For each completed LLM iteration, prompt and completion tokens are measured and deducted from the patient's quota in real-time, providing strict rate limiting and monetization guardrails.

```mermaid
flowchart TD
    subgraph Input ["1. Patient Input Layer"]
        A["Unstructured User Chat Input<br/>(User Message)"] --> B["Health Metrics Extraction<br/>(NLP Processing via LLM)"]
    end

    subgraph Orchestration ["2. AI & Orchestration Layer"]
        B --> C["Prompt Assembly<br/>(Global System + User Custom Override)"]
        C --> D["Context Initialization<br/>(Load Chat History + Register MCP Schemas)"]
        D --> E{"LLM Intent Analysis<br/>(Ollama Inference)"}
    end

    subgraph ToolExecution ["3. Clinical Execution Layer (MCP)"]
        E -- "Clinical Data Found" --> F["Tool Request<br/>(predict_heart_disease)"]
        F --> G["SSE Transport handshake"]
        G --> H["CardioAI ML Inference<br/>(Risk & Prediction Calculation)"]
        H --> I["Structured Prediction Output<br/>(JSON Data)"]
    end

    subgraph OutputGeneration ["4. Response Synthesis & Ledger"]
        I --> J["Synthesize Assistant Explanation<br/>(Assistant Response)"]
        E -- "Casual Chat/No Metrics" --> J
        J --> K["Token Deductions & Audit Log<br/>(Database Ledger Sync)"]
        K --> L["Final SSE Stream Render<br/>(Assistant Response to client)"]
    end

    %% Styles
    classDef input fill:#eef2f6,stroke:#cbd5e1,stroke-width:2px;
    classDef orch fill:#fffbeb,stroke:#fef08a,stroke-width:2px;
    classDef tool fill:#f0fdf4,stroke:#bbf7d0,stroke-width:2px;
    classDef output fill:#fef2f2,stroke:#fecaca,stroke-width:2px;

    class A,B input;
    class C,D,E orch;
    class F,G,H,I tool;
    class J,K,L output;
```

---

## 8. UML Activity Diagram — Dynamic Token Auditing & num_predict (Generation Limits)

This diagram displays the dynamic operational sequence of activities within the CardioAI application, representing actions, decisions, and system forks from user login to final stream response generation.

```mermaid
flowchart TD
    %% Define nodes and flow
    Start([● Start]) --> AuthCheck{Is User<br/>Authenticated?}

    AuthCheck -- No --> SignUp[Register / Log In] --> AuthCheck
    AuthCheck -- Yes --> Session[Initialize/Select Chat Session]

    Session --> InputMsg[User enters message / clinical details]
    InputMsg --> CheckTokens{Check Token Balance}

    CheckTokens -- Insufficient (<= 0) --> Reject[Display Token Quota Error]
    Reject --> End([● End])

    CheckTokens -- Sufficient (> 0) --> PromptComp[Assemble Global & Custom Prompts]
    PromptComp --> EvalTokens[Estimate Prompt Tokens & Set num_predict Limit]
    EvalTokens --> ModelCall[Query Ollama LLM via AIService]

    ModelCall --> ToolDecision{Does LLM request<br/>Tool Execution?}

    ToolDecision -- Yes --> CallTool[Invoke predict_heart_disease tool]
    CallTool --> MCPEval[Execute prediction logic on MCP Server]
    MCPEval --> ReturnResult[Append JSON prediction to context history]
    ReturnResult --> ModelCall

    ToolDecision -- No --> GenerateResp[Synthesize Final Assistant Response]

    GenerateResp --> LedgerSync[Deduct Evaluated Tokens from User Balance]
    LedgerSync --> SaveMsg[Store Assistant Message in Postgres DB]
    SaveMsg --> StreamOutput[Stream SSE Assistant Response to Client]
    StreamOutput --> Display[Display Assistant Response & Metrics to User]
    Display --> End

    %% Styling & Aesthetics
    classDef startEnd fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,color:#334155;
    classDef action fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px,color:#0369a1;
    classDef decision fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#9a3412;
    classDef error fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#991b1b;
    classDef mcp fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#166534;

    class Start,End startEnd;
    class SignUp,Session,InputMsg,PromptComp,EvalTokens,ModelCall,GenerateResp,LedgerSync,SaveMsg,StreamOutput,Display action;
    class AuthCheck,CheckTokens,ToolDecision decision;
    class Reject error;
    class CallTool,MCPEval,ReturnResult mcp;
```
