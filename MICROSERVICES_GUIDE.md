# eShop Microservices Architecture - Complete Guide

## Overview
This is a **reference .NET 9 e-commerce application** built using a **distributed microservices architecture** with **event-driven communication**. It demonstrates modern cloud-native patterns using **container orchestration, async messaging, and polyglot persistence**.

---

## Table of Contents
1. Microservices Overview
2. Infrastructure Components
3. Architectural Patterns
4. Communication Patterns
5. Deployment & Orchestration
6. End-to-End Example
7. Key Technologies
8. Learning Outcomes

---

## Microservices Overview

### 1. Identity.API
- **Purpose**: Authentication, authorization, and OAuth2/OpenID Connect provider
- **Technology**: ASP.NET Core
- **Database**: PostgreSQL (separate database)
- **Key Features**: 
  - User registration and login
  - Token generation and validation
  - Callback URLs configuration for all services
  - External HTTP endpoints for client access

### 2. Catalog.API
- **Purpose**: Product catalog management and search
- **Technology**: ASP.NET Core REST API with gRPC support
- **Database**: PostgreSQL with pgvector support (for AI-powered search)
- **Key Features**:
  - Browse products, filter by category
  - API versioning for backward compatibility
  - OpenAPI/Swagger documentation
  - Publishes integration events when catalog changes
  - AI-powered search capability (via pgvector)

### 3. Basket.API
- **Purpose**: Shopping cart management
- **Technology**: gRPC microservice
- **Cache**: Redis (in-memory caching for high performance)
- **Key Features**:
  - Add/remove items from basket
  - Temporary session storage
  - Fast retrieval via Redis
  - Communicates with Identity for user context
  - Publishes `OrderStartedIntegrationEvent` when checkout begins

### 4. Ordering.API
- **Purpose**: Order management and order history
- **Technology**: ASP.NET Core REST API
- **Database**: PostgreSQL (separate database)
- **Architecture Pattern**: **DDD (Domain-Driven Design)**
- **Key Features**:
  - Create and track orders
  - Order status management (Pending ? Paid ? Shipped)
  - Implements **Outbox pattern** for reliable event publishing
  - Request idempotency to prevent duplicate processing
  - Integration events for inter-service communication

### 5. OrderProcessor (Background Service)
- **Purpose**: Asynchronous order processing and workflow
- **Technology**: .NET Worker Service (long-running background process)
- **Key Features**:
  - Listens to order-related integration events
  - Coordinates payment processing
  - Updates order status
  - Ensures exactly-once processing semantics

### 6. PaymentProcessor (Background Service)
- **Purpose**: Payment processing and settlement
- **Technology**: .NET Worker Service
- **Message Queue**: RabbitMQ
- **Key Features**:
  - Processes payment integration events
  - Handles payment provider communication
  - Updates order payment status
  - Publishes payment completion events

### 7. Webhooks.API
- **Purpose**: External webhook management and delivery
- **Technology**: ASP.NET Core
- **Database**: PostgreSQL (separate database)
- **Key Features**:
  - Registers external webhooks
  - Delivers integration events to registered endpoints
  - Retry logic for failed deliveries
  - Used for third-party integrations (e.g., ERP systems, analytics)

### 8. WebApp (Frontend)
- **Purpose**: Customer-facing e-shop portal
- **Technology**: ASP.NET Core Razor Components (Blazor Server-side)
- **Key Features**:
  - Browse catalog
  - Manage shopping basket
  - Place orders
  - Track order history
  - User authentication integration

### 9. WebhookClient (Demo Application)
- **Purpose**: Example webhook consumer
- **Technology**: ASP.NET Core
- **Purpose**: Demonstrates how to consume webhooks from the eShop platform

### 10. Mobile BFF (Backend for Frontend)
- **Purpose**: API gateway for mobile clients
- **Technology**: YARP (Yet Another Reverse Proxy) - Microsoft's reverse proxy
- **Key Features**:
  - Routes mobile requests to appropriate microservices
  - BFF pattern - customized API contracts for different clients
  - Reduces chatty client requests

---

## Infrastructure Components

### Message Queue: RabbitMQ
- **Purpose**: **Event-driven asynchronous communication** between microservices
- **Pattern**: **Pub/Sub with event bus abstraction**
- **Use Cases**:
  - Catalog events ? triggers webhooks
  - Order placed ? triggers payment processor
  - Payment completed ? updates order status
  - Each service independently subscribes to relevant events
- **Key Benefit**: **Decoupled communication** - Services don't need to know about each other directly

### Cache: Redis
- **Purpose**: Session and data caching
- **Used By**: Basket.API for fast shopping cart retrieval
- **Benefits**: 
  - Reduced database load
  - Improved latency
  - High-performance session storage

### Database: PostgreSQL
- **Architecture**: **Polyglot persistence** - each microservice has its own database
- **Databases**:
  - `catalogdb` - Product catalog
  - `identitydb` - User accounts and authentication
  - `orderingdb` - Orders and order items
  - `webhooksdb` - Webhook registrations and delivery logs
- **Benefits**: 
  - Independent scaling
  - Technology flexibility per service
  - Reduced coupling
  - Easier maintenance
- **Special Feature**: pgvector extension for AI-powered vector search

---

## Architectural Patterns

### 1. Event-Driven Architecture
```text
Event Bus (RabbitMQ)
    ?
PublishAsync(IntegrationEvent)
    ?
Multiple Subscribers Listen & React
      ```
**Why**: Loose coupling, eventual consistency, scalable communication

**Key Components**:
- `IEventBus`: Interface for publishing events
- `IntegrationEvent`: Base class for cross-service events
- `IIntegrationEventHandler<T>`: Handler interface for subscribers
- `RabbitMQEventBus`: Concrete implementation

### 2. Integration Event Pattern
- **IntegrationEvent**: Base class for events that cross service boundaries
- **Examples**:
  - `OrderStartedIntegrationEvent`: Published when order is created
  - `CatalogItemsAvailabilityChangedIntegrationEvent`: Published when product availability changes
  - `PaymentCompletedIntegrationEvent`: Published when payment succeeds
- **Benefits**: 
  - Standardized event format
  - Type-safe event handling
  - Easy to version and evolve

### 3. Outbox Pattern (Transactional Outbox)
- **Purpose**: Ensure reliable event publishing even if the service crashes
- **How it works**: 
  1. When a service modifies state (e.g., creates order), it also writes an outbox entry in the same transaction
  2. A background process reads outbox entries and publishes them to RabbitMQ
  3. Prevents lost events due to crashes
- **Implementation**: Tables: `IntegrationEventLog`, processed via background job
- **Benefits**: 
  - Guaranteed event delivery
  - No lost events on crashes
  - Exactly-once semantics

### 4. Idempotency Pattern
- **Purpose**: Prevent duplicate processing if messages are delivered multiple times
- **Implementation**: `IRequestManager` tracks processed requests by GUID
- **Why**: RabbitMQ guarantees at-least-once delivery, not exactly-once
- **Use Case**: If payment processor crashes after processing but before acknowledging, the message gets redelivered

### 5. Database per Service Pattern
- Each microservice owns its data
- No direct database access between services
- Forces communication through APIs/Events
- **Benefits**:
  - Independent scalability
  - Technology choice per service
  - Reduced coupling
  - Easier to replace services

### 6. API Versioning
- **Implemented in Catalog.API**
- Allows backward compatibility while evolving APIs
- Headers include `api-supported-versions`
- **Pattern**: URL versioning or header-based versioning

### 7. BFF (Backend for Frontend) Pattern
- Separate API layer for different client types
- Mobile BFF provides customized endpoints for mobile clients
- YARP used for reverse proxy routing
- **Benefits**:
  - Optimized API contracts per client
  - Reduced network requests
  - Better performance for specific clients

### 8. Domain-Driven Design (DDD)
- **Implemented in Ordering.API**
- Clear separation: Domain Layer ? Application Layer ? Infrastructure Layer
- Aggregate roots model order entities
- Rich domain models with business logic
- **Bounded Context**: Order management is isolated from other domains
- **Value Objects**: OrderItem, Money, etc.

---

## Communication Patterns

### Synchronous Communication
- **REST APIs**: HTTP/REST for direct client requests
  - WebApp calls Catalog.API, Ordering.API, Basket.API
  - External clients call APIs directly
- **gRPC**: Used for Basket.API (high-performance, typed contracts)
  - Why gRPC for Basket: Shopping cart is latency-sensitive
  - Binary protocol, smaller payloads, faster serialization

### Asynchronous Communication
- **RabbitMQ Event Bus**: For loose coupling between services
- **Integration Events**: Standardized format for inter-service events
- **Examples**:
  - Catalog publishes "CatalogItemsAvailabilityChangedIntegrationEvent"
  - Ordering publishes "OrderStartedIntegrationEvent"
  - Payment processor consumes order events
- **Benefits**:
  - Services don't wait for each other
  - Better scalability
  - Resilience to temporary outages

### Service-to-Service HTTP Calls (for state sync)
- When synchronous data is needed
- REST calls between services
- Example: WebApp calls Catalog.API for product details

---

## Deployment & Orchestration

### Docker Containers
- Each service runs in a container
- Dockerfile for each service
- Ensures consistent environments

### .NET Aspire (Application Orchestration)
- Modern way to orchestrate multi-service applications
- **AppHost Project** (`eShop.AppHost`): 
  - Defines all services and their dependencies
  - Configures relationships: which service needs which database, cache, or message queue
  - Automatically starts services in correct order
  - Provides Aspire Dashboard for monitoring

### Container Startup Order (defined in Program.cs)
```text
1. Redis (started first - lightweight)
2. RabbitMQ (started - needed by services)
3. PostgreSQL (started - needed by services)
4. Create databases (catalogdb, identitydb, orderingdb, webhooksdb)
5. Start Identity.API (other services depend on auth tokens)
6. Start Catalog.API, Basket.API, Ordering.API in parallel
7. Start OrderProcessor, PaymentProcessor (depend on queues)
8. Start WebApp (frontend)
9. Start Mobile BFF (reverse proxy)
      ```

### Health Checks
- `/health` endpoints on each service
- Aspire Dashboard monitors all services
- Alerts if services become unhealthy

---

## End-to-End Example: Order Placement Scenario

### Step-by-Step Flow

```text
1. User opens WebApp
   ?? User authenticates via Identity.API

2. User browses products
   ?? WebApp ? REST call ? Catalog.API
   ?? Returns product list with details

3. User adds items to basket
   ?? WebApp ? gRPC call ? Basket.API
   ?? Basket.API stores in Redis for fast access

4. User proceeds to checkout
   ?? WebApp validates basket via Basket.API
   ?? WebApp calls Ordering.API to create order

5. Ordering.API creates order (TRANSACTION)
   ?? Save Order to PostgreSQL (orderingdb)
   ?? Save Order Items to PostgreSQL
   ?? Write OutboxEntry to IntegrationEventLog table (same transaction)
   ?? Returns Order confirmation

6. Background Outbox Processor (polling)
   ?? Reads IntegrationEventLog entries
   ?? Publishes to RabbitMQ: OrderStartedIntegrationEvent
   ?? Marks entry as published

7. OrderProcessor (RabbitMQ Subscriber) receives OrderStartedIntegrationEvent
   ?? Validates order
   ?? Publishes PaymentRequiredIntegrationEvent to RabbitMQ

8. PaymentProcessor (RabbitMQ Subscriber) receives PaymentRequiredIntegrationEvent
   ?? Calls external payment provider
   ?? Handles payment response
   ?? On success: publishes PaymentCompletedIntegrationEvent
   ?? On failure: publishes PaymentFailedIntegrationEvent

9. OrderProcessor receives PaymentCompletedIntegrationEvent
   ?? Updates order status to "Paid" in Ordering.API
   ?? Ordering.API writes to OutboxEntry
   ?? Publishes OrderConfirmedIntegrationEvent

10. Multiple subscribers react:
    ?? Webhooks.API receives event
    ?  ?? Delivers to registered external webhook URLs (ERP, CRM, etc.)
    ?? Catalog.API (if inventory tracking)
    ?  ?? Decrements stock
    ?? Notifications system (if exists)
       ?? Sends confirmation email

11. WebApp polls for order updates (via SignalR or REST)
    ?? Displays order confirmation
    ?? Stores in session

12. User sees confirmation on screen ?
```

### Failure Scenario Example:
```text
If PaymentProcessor crashes during payment:
1. Payment request sent to provider
2. Payment succeeds but processor crashes before acknowledging message
3. RabbitMQ redelivers PaymentRequiredIntegrationEvent
4. PaymentProcessor starts and processes again
5. Idempotency check prevents duplicate charges
6. RequestManager identifies this is a retry of same request
7. Returns previous result without reprocessing
```

---

## Key Technologies

| Layer | Technology | Purpose |
| ------- | ------------ | --------- |
| **Frontend** | ASP.NET Core, Blazor, Razor Components | User interface |
| **APIs** | ASP.NET Core, REST, gRPC | Service communication |
| **Message Queue** | RabbitMQ | Asynchronous events |
| **Database** | PostgreSQL, pgvector | Data persistence & AI search |
| **Cache** | Redis | Session & data caching |
| **Reverse Proxy** | YARP | API gateway, routing |
| **Orchestration** | .NET Aspire | Container orchestration |
| **Monitoring** | OpenTelemetry, Health Checks | Observability |
| **Auth** | OAuth2, OpenID Connect | Security |

---

## Learning Outcomes for Job Interviews

When you understand this architecture, you can confidently discuss:

### Microservices Concepts
? **Service Decomposition**: How to split a monolith into services
? **Bounded Contexts**: DDD approach to service boundaries
? **Single Responsibility**: Each service has one reason to change
? **Independent Deployment**: Services can be deployed separately

### Event-Driven Architecture
? **Pub/Sub Pattern**: Publishers and subscribers
? **Eventual Consistency**: Accepting data inconsistency temporarily
? **Event Sourcing Foundations**: Understanding event-based state changes
? **Message Queues**: RabbitMQ, Kafka alternatives

### Asynchronous Communication
? **Message Brokers**: RabbitMQ architecture and guarantees
? **At-Least-Once Delivery**: Handling retries and idempotency
? **Dead Letter Queues**: Handling failed messages
? **Message Versioning**: Evolving event schemas

### Database Design
? **Polyglot Persistence**: Different databases for different needs
? **Data Consistency Patterns**: Eventual vs. strong consistency
? **Saga Pattern**: Distributed transactions across services
? **Event Sourcing**: Storing state changes as events

### Cloud-Native Patterns
? **Containerization**: Docker and container orchestration
? **Service Discovery**: How services find each other
? **Circuit Breakers**: Handling cascading failures
? **Retry Policies**: Handling transient failures

### API Design
? **REST vs. gRPC**: Trade-offs and when to use each
? **API Versioning**: Backward compatibility strategies
? **BFF Pattern**: Different APIs for different clients
? **API Security**: Authentication and authorization

### Resilience Patterns
? **Outbox Pattern**: Reliable event publishing
? **Idempotency**: Preventing duplicate processing
? **Retries with Backoff**: Exponential backoff
? **Timeouts**: Preventing cascading failures

### Monitoring & Observability
? **Distributed Tracing**: Tracking requests across services
? **Health Checks**: Service health monitoring
? **Logging Correlation**: Tracking request ID across logs
? **Metrics**: Performance and business metrics

---

## Interview Talking Points

### "Tell me about a microservices architecture you know"
Use eShop example:
- "eShop is a .NET 9 e-commerce reference application with 10+ microservices"
- "Uses RabbitMQ for event-driven communication"
- "Each service has its own PostgreSQL database"
- "Demonstrates modern patterns like Outbox, Idempotency, and DDD"

### "How do you handle cross-service communication?"
- "Synchronous: REST for Catalog.API, gRPC for Basket.API"
- "Asynchronous: RabbitMQ event bus for loose coupling"
- "Example: When order is created, OutboxEntry is written in same transaction as order, then published to RabbitMQ"

### "How do you ensure reliability?"
- "Outbox Pattern: Events stored in database before publishing"
- "Idempotency: Request IDs prevent duplicate processing"
- "Health Checks: Monitor service status continuously"
- "At-Least-Once Delivery: Retry logic with exponential backoff"

### "How do you handle database transactions across services?"
- "Saga Pattern: Distributed transactions using events"
- "Compensating Transactions: Rollback on failure"
- "Eventual Consistency: Accept temporary inconsistency"
- "Example: OrderProcessor coordinates payment through events"

### "How do you scale this system?"
- "Stateless services: Can run multiple instances"
- "Redis caching: Reduces database load for Basket"
- "Message queues: Buffer traffic spikes"
- "Database replication: Read replicas for scaling reads"
- "Container orchestration: Deploy more instances on demand"

---

## Quick Reference: Service Matrix

| Service | Type | Tech | DB | Cache | Queue | Auth | Purpose |
| --------- | ------ | ------ | ---- | ---- | ------- | ------ | --------- |
| Identity.API | REST | ASP.NET | PG | - | - | ? | Authentication |
| Catalog.API | REST | ASP.NET | PG | - | RMQ | - | Product catalog |
| Basket.API | gRPC | ASP.NET | - | Redis | RMQ | ? | Shopping cart |
| Ordering.API | REST | ASP.NET | PG | - | RMQ | ? | Orders |
| OrderProcessor | Worker | ASP.NET | PG | - | RMQ | - | Order workflow |
| PaymentProcessor | Worker | ASP.NET | - | - | RMQ | - | Payment |
| Webhooks.API | REST | ASP.NET | PG | - | RMQ | ? | Webhooks |
| WebApp | Razor | ASP.NET | - | - | - | ? | Frontend |
| Mobile BFF | Proxy | YARP | - | - | - | - | API Gateway |

Legend: PG=PostgreSQL, RMQ=RabbitMQ, REST=HTTP REST, gRPC=Binary RPC

---

## Running the Application Locally

### Prerequisites
1. Docker Desktop (for containers)
2. .NET 9 SDK
3. Visual Studio 2022 or VS Code with C# extension

### Steps
1. Clone repository:
   ```bash
   git clone https://github.com/dotnet/eShop
   cd eShop
   ```

2. Run with .NET Aspire:
   ```bash
   dotnet run --project src/eShop.AppHost/eShop.AppHost.csproj
   ```

3. Open Aspire Dashboard URL from console output

4. Access WebApp at the provided URL

---

## Further Learning Resources

### Official Documentation
- [.NET Aspire Documentation](https://learn.microsoft.com/dotnet/aspire/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Related Patterns
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)

### eShop Repository
- [GitHub: dotnet/eShop](https://github.com/dotnet/eShop)
- See `/src` directory for all microservices code
- See `/tests` directory for testing examples

---

## Summary

The eShop reference application demonstrates **enterprise-grade microservices architecture**:

- **10+ independent microservices** solving specific business problems
- **Event-driven communication** enabling loose coupling
- **Polyglot persistence** with PostgreSQL databases
- **Async messaging** using RabbitMQ
- **Modern patterns** like Outbox, Idempotency, DDD
- **Cloud-native design** with Docker and .NET Aspire
- **Production-ready** patterns for resilience and reliability

This is an excellent foundation for understanding and building distributed systems for enterprise roles requiring microservices knowledge.

---

**Last Updated**: 2024
**Repository**: https://github.com/dotnet/eShop
**Framework**: .NET 9
