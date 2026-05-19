# 📊 CardioAI — System Diagrams & Architecture

This document contains high-fidelity Mermaid diagrams detailing the architectural, database, transactional, operational, and data flow layers of the **CardioAI** platform.

---

## 📋 Table of Contents
1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Database ER Diagram](#2-database-er-diagram)
3. [Sequence Diagram](#3-sequence-diagram)
4. [Use Case Diagram](#4-use-case-diagram)
5. [DFD Level 0 — Context Diagram](#5-dfd-level-0-context-diagram)

---

## 1. System Architecture Diagram

This diagram represents the multi-tiered architecture of CardioAI, highlighting the presentation (client), server-side application logic, data access, database, and third-party integration layers.

```mermaid
flowchart TB
    subgraph Client ["Presentation Layer (Next.js Client)"]
        UI["Next.js Pages & App Router Layouts<br/>(Tailwind CSS v4 + next-themes)"]
        ChatUI["Chat Interface Component<br/>(Framer Motion + Lucide React)"]
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
    
    class UI,ChatUI,Store client;
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
    User -->|Auth credentials & health queries| System
    System -->|AI responses & risk reports| User

    %% Data flows - Admin & System
    Admin -->|Prompt configurations & state controls| System
    System -->|System logs & user accounts| Admin

    %% Data flows - System & Ollama LLM
    System -->|Chat history & tool schemas| Ollama
    Ollama -->|Conversational responses & tool calls| System

    %% Data flows - System & MCP Server
    System -->|Clinical health arguments| MCP
    MCP -->|Heart disease predictions & recommendations| System

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
