# Enterprise CLI - Enterprise Framework Generator

🚀 **Revolutionary Enterprise Framework Generator - Creates internal enterprise frameworks, not just code templates.**

Enterprise CLI transforms your development experience by generating a complete **internal enterprise framework** where developers can **ONLY** write business logic. All infrastructure code is "blinded" and cannot be modified, forcing best practices and preventing junior developers from breaking enterprise patterns.

## 🎯 **Core Philosophy: Business Logic Only**

Unlike traditional code generators that create configurable templates, Enterprise CLI creates an **internal framework** with these characteristics:

- 🤖 **Infrastructure Code is "Blinded"**: Impossible to modify transactions, caching, metrics, audit, events
- 👨‍💻 **Business Logic is Enforced**: Abstract methods force implementation of validation and business rules
- 🏗️ **Enterprise Patterns Automatic**: All non-functional requirements handled by framework
- 📚 **Library-Ready Architecture**: Generated framework can be extracted as reusable library

**Success Metric**: Junior developers can build enterprise-grade applications while writing only business logic - no infrastructure concerns whatsoever.

## ✨ **Enterprise Framework Features**

### 🤖 **Infrastructure Layer (Automatically Generated - Cannot be Modified)**

#### **Enterprise Service Framework**
- **AbstractEnterpriseService** - Template Method pattern for all CRUD operations
- **Automatic transactions, caching, metrics, events, audit** for every operation
- **Business validation and rules orchestration** with automatic error handling
- **Performance monitoring** with Micrometer + Prometheus integration
- **Domain event publishing** for microservice communication
- **Comprehensive audit logging** for regulatory compliance

#### **Enterprise Controller Framework**
- **AbstractEnterpriseController** - Standardized REST endpoints (GET, POST, PUT, DELETE)
- **Automatic input validation, error handling, security headers**
- **OpenAPI documentation generation** with business context
- **Rate limiting, CORS, compression** configured automatically
- **Request/response audit trail** with correlation IDs

#### **Enterprise Repository Framework**
- **AbstractEnterpriseRepository** - JPA Specification patterns for dynamic queries
- **Enterprise search capabilities** with global text search
- **Soft delete, batch operations, performance optimization**
- **Automatic caching layer** with configurable cache regions
- **Business query patterns** (findByBusinessId, findActive, etc.)

#### **Enterprise Infrastructure**
- **EnterpriseAuditLogger** - Structured JSON audit events for compliance
- **EnterpriseMetricsCollector** - Business and technical metrics collection
- **EnterpriseEventPublisher** - Domain event publishing with tracing
- **Complete Spring Boot 3.2.0 setup** with all enterprise dependencies

### 👨‍💻 **Business Layer (Developer Implements - Only Business Logic)**

#### **Business Validation Framework**
- **BusinessValidator interface** - Domain-specific validation rules
- **Fluent validation builders** for complex business constraints
- **Validation result aggregation** with warnings and errors
- **State transition validation** for entity lifecycle management

#### **Business Rules Framework**
- **BusinessRules interface** - Domain business logic and policies
- **Rule execution orchestration** with audit trails
- **Business metrics calculation** and KPI computation
- **Business event triggering** based on operations

#### **Configuration Framework**
- **@EnterpriseEntity** - Entity configuration (caching, audit, metrics)
- **@EnterpriseService** - Service configuration (transactions, monitoring)
- **@EnterpriseController** - Controller configuration (security, validation)
- **@EnableEnterpriseFramework** - One-annotation framework activation

### ⚛️ **Frontend Generation (React)**
- **React 18 + TypeScript** applications
- **Redux Toolkit** for state management with RTK Query
- **React Router v6** for navigation
- **Material-UI or Ant Design** for components
- **React Query** for API communication
- **Jest + React Testing Library** for testing
- **Cypress** for E2E testing
- **ESLint + Prettier** configuration
- **Webpack/Vite** build configuration

### 🔧 **Development Tools**
- **Full-stack development environment** setup
- **Hot reload** for both backend and frontend
- **Comprehensive testing** with coverage reports
- **Docker Compose** for local development
- **Deployment automation** for multiple environments

## 📋 Prerequisites

### Required
- **Node.js** 18 or later
- **Java** 17 or later
- **Maven** 3.6 or later

### Optional (for full functionality)
- **Docker** and Docker Compose
- **kubectl** (for Kubernetes deployment)

## 🚀 Installation

### Global Installation
```bash
npm install -g enterprise-cli
```

### Local Development
```bash
git clone https://github.com/enterprise/enterprise-cli.git
cd enterprise-cli
npm install
npm link
```

## 📖 **Usage - Enterprise Framework Generation**

### Initialize Enterprise Workspace
```bash
enterprise init --enterprise-framework
```

### Generate Enterprise Microservice (Complete Framework)
```bash
enterprise generate user-service --domain user --entities User,Profile
```

**What gets generated:**
- 🤖 **Complete Enterprise Infrastructure** (cannot be modified)
  - AbstractEnterpriseService with Template Method pattern
  - AbstractEnterpriseController with standardized REST endpoints
  - AbstractEnterpriseRepository with JPA Specification patterns
  - Enterprise audit, metrics, events infrastructure

- 👨‍💻 **Business Implementation Templates** (implement these)
  - UserBusinessValidator extends BusinessValidator
  - UserBusinessRules extends BusinessRules
  - UserServiceImpl extends AbstractEnterpriseService
  - UserController extends AbstractEnterpriseController

Interactive mode:
```bash
enterprise generate
# Configure enterprise framework features and business domain
```

### Generate React Application
```bash
enterprise frontend create user-dashboard --template material-ui
```

### Start Development Environment
```bash
# Setup development environment
enterprise dev setup

# Start both backend and frontend
enterprise dev start --full-stack

# Start only backend
enterprise dev start --backend

# Start only frontend
enterprise dev start --frontend
```

### Run Tests
```bash
# Run all tests
enterprise test

# Run only backend tests
enterprise test --backend

# Run only frontend tests
enterprise test --frontend

# Run with coverage
enterprise test --coverage
```

### Deploy Applications
```bash
# Deploy to staging
enterprise deploy --environment staging

# Deploy only backend
enterprise deploy --backend --environment production

# Dry run (see what would be deployed)
enterprise deploy --dry-run
```

## 🎮 Commands Reference

### Core Commands

#### `enterprise generate <service-name>`
Generate a complete Spring Boot microservice with enterprise patterns.

**Options:**
- `-d, --domain <domain>` - Business domain for the service
- `-p, --package <package>` - Java package name
- `-e, --entities <entities>` - Comma-separated list of entities
- `--database <db>` - Database type (postgresql, mysql, h2)
- `--auth` - Include OAuth2 authentication (default: true)
- `--camel` - Include Apache Camel integration (default: true)
- `--docker` - Generate Docker configuration (default: true)
- `--k8s` - Generate Kubernetes manifests (default: true)

**Example - Enterprise Framework Generation:**
```bash
enterprise generate order-service \
  --domain order \
  --package com.company.order \
  --entities Order,OrderItem \
  --database postgresql \
  --enterprise-framework
```

**Generated Enterprise Framework Structure:**
```java
// 🤖 INFRASTRUCTURE - Cannot be modified (final methods)
@Service
public class OrderServiceImpl extends AbstractEnterpriseService<Order, String, OrderRequest, OrderRequest, OrderResponse> {

    // 👨‍💻 BUSINESS LOGIC ONLY - Developer implements these abstract methods
    @Override
    protected OrderRepository getRepository() { return orderRepository; }

    @Override
    protected Order createEntityFromRequest(OrderRequest createDTO) {
        return orderMapper.toEntity(createDTO); // Pure business mapping
    }

    // 🤖 Infrastructure handled automatically:
    // - Transactions ✓  - Caching ✓  - Metrics ✓  - Audit ✓  - Events ✓
}

// 👨‍💻 BUSINESS VALIDATION - Developer implements business rules
@Component
public class OrderBusinessValidator extends BusinessValidator.AbstractBusinessValidator<Order, OrderRequest, OrderRequest> {

    @Override
    public ValidationResult validateCreate(OrderRequest request) {
        return validationBuilder()
            .checkNotEmpty(request.getCustomerId(), "Customer ID")
            .check(request.getTotalAmount() > 0, "Total amount must be positive")
            .check(!isDuplicateOrder(request), "Order already exists")
            .build(); // Pure business validation logic
    }
}
```

#### `enterprise frontend create <app-name>`
Create a new React application with enterprise features.

**Options:**
- `-t, --template <template>` - UI template (material-ui, ant-design)
- `--typescript` - Use TypeScript (default: true)
- `--redux` - Include Redux Toolkit (default: true)
- `--router` - Include React Router (default: true)
- `--testing` - Include testing setup (default: true)

**Example:**
```bash
enterprise frontend create order-dashboard \
  --template material-ui \
  --typescript \
  --redux
```

### Development Commands

#### `enterprise dev setup`
Setup development environment with all dependencies.

**Options:**
- `--backend` - Setup backend only
- `--frontend` - Setup frontend only
- `--docker` - Start required Docker services

#### `enterprise dev start`
Start development servers.

**Options:**
- `--backend` - Start backend only
- `--frontend` - Start frontend only
- `--full-stack` - Start both backend and frontend
- `--debug` - Enable debug mode
- `--profile <profile>` - Spring profile to use

#### `enterprise dev stop`
Stop all development servers.

#### `enterprise dev logs`
View development server logs.

### Testing Commands

#### `enterprise test`
Run comprehensive test suites.

**Options:**
- `--unit` - Run unit tests only
- `--integration` - Run integration tests only
- `--e2e` - Run E2E tests only
- `--coverage` - Generate coverage reports
- `--backend` - Test backend only
- `--frontend` - Test frontend only

### Deployment Commands

#### `enterprise deploy`
Deploy applications to target environment.

**Options:**
- `-e, --environment <env>` - Target environment (dev, staging, production)
- `--backend` - Deploy backend only
- `--frontend` - Deploy frontend only
- `--dry-run` - Show deployment plan without executing

### Utility Commands

#### `enterprise init`
Initialize Enterprise CLI workspace.

**Options:**
- `--full-stack` - Initialize both backend and frontend

#### `enterprise status`
Show status of current workspace.

## 🏗️ **Generated Enterprise Framework Structure**

### Enterprise Backend Framework
```
generated-enterprise-backend/
├── src/main/java/com/company/{domain}/
│   ├── {Domain}ServiceApplication.java    # @EnableEnterpriseFramework
│   │
│   ├── 🤖 enterprise/                     # INFRASTRUCTURE (Cannot be modified)
│   │   ├── base/
│   │   │   ├── AbstractEnterpriseService.java      # Template Method pattern
│   │   │   ├── AbstractEnterpriseController.java   # Standardized REST endpoints
│   │   │   └── AbstractEnterpriseRepository.java   # JPA Specification patterns
│   │   ├── patterns/
│   │   │   ├── EnterpriseAuditLogger.java          # Structured audit logging
│   │   │   ├── EnterpriseMetricsCollector.java     # Performance monitoring
│   │   │   └── EnterpriseEventPublisher.java       # Domain event publishing
│   │   ├── validation/
│   │   │   └── BusinessValidator.java              # Validation framework interface
│   │   ├── rules/
│   │   │   └── BusinessRules.java                  # Business rules framework interface
│   │   └── annotations/
│   │       ├── @EnterpriseEntity.java              # Entity configuration
│   │       ├── @EnterpriseService.java             # Service configuration
│   │       ├── @EnterpriseController.java          # Controller configuration
│   │       └── @EnableEnterpriseFramework.java     # Framework activation
│   │
│   ├── 👨‍💻 business/                     # BUSINESS LOGIC (Developer implements)
│   │   ├── {Domain}BusinessValidator.java          # Domain validation rules
│   │   └── {Domain}BusinessRules.java              # Domain business logic
│   │
│   ├── entity/                             # @EnterpriseEntity annotated
│   ├── repository/                         # Extends AbstractEnterpriseRepository
│   ├── service/
│   │   ├── {Domain}Service.java            # Business interface
│   │   └── impl/
│   │       └── {Domain}ServiceImpl.java    # Extends AbstractEnterpriseService
│   ├── controller/
│   │   └── {Domain}Controller.java         # Extends AbstractEnterpriseController
│   ├── config/
│   │   └── {Domain}BusinessConfig.java     # Business component wiring
│   ├── dto/                                # Request/Response DTOs
│   └── mapper/                             # Entity-DTO mapping
│
├── src/test/java/
│   ├── integration/                        # Enterprise integration tests
│   ├── unit/                              # Business logic unit tests
│   └── architecture/                      # Enterprise architecture validation
├── src/main/resources/
│   ├── application.yml                     # Enterprise configuration
│   └── db/migration/                       # Database migrations
├── k8s/                                   # Kubernetes manifests
├── Dockerfile
├── docker-compose.yml
└── README.md                              # Enterprise framework documentation
```

**Key Architecture Principles:**
- 🤖 **Infrastructure Package**: Final methods, cannot be overridden or modified
- 👨‍💻 **Business Package**: Abstract methods, must be implemented by developers
- 📚 **Clear Separation**: Infrastructure concerns vs Business logic completely separated
- 🏗️ **Framework Pattern**: Template Method enforces correct implementation patterns

### React Frontend
```
generated-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/                    # Reusable components
│   ├── pages/                         # Page components
│   ├── store/                         # Redux store
│   │   ├── index.ts
│   │   ├── api/                       # RTK Query API slices
│   │   └── slices/                    # Redux slices
│   ├── hooks/                         # Custom React hooks
│   ├── utils/                         # Utility functions
│   ├── types/                         # TypeScript types
│   ├── styles/                        # Global styles
│   └── services/                      # API services
├── cypress/                           # E2E tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎛️ Configuration

### Environment Configuration
Enterprise CLI uses environment-specific configurations:

- **Development** (`dev`): Hot reload, debug logging, local database
- **Staging** (`staging`): Production-like environment for testing
- **Production** (`prod`): Optimized for performance and security

### Workspace Configuration
Initialize a workspace to store preferences:

```bash
enterprise init --full-stack
```

This creates `.enterprise/config.json` with your project settings.

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Service and utility class testing with Mockito
- **Integration Tests**: Full application context with TestContainers
- **Architecture Tests**: Code structure validation with ArchUnit
- **Coverage**: Minimum 80% code coverage with JaCoCo

### Frontend Testing
- **Unit Tests**: Component testing with Jest and React Testing Library
- **Integration Tests**: User workflow testing
- **E2E Tests**: Full application testing with Cypress
- **Coverage**: Minimum 80% code coverage

## 🚀 Deployment Options

### Docker Deployment
```bash
# Build and run with Docker
enterprise deploy --docker --environment staging
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes cluster
enterprise deploy --kubernetes --environment production
```

### Traditional Deployment
```bash
# Generate JAR and static files
enterprise deploy --traditional --environment production
```

## 🔧 **Enterprise Framework Development Workflow**

### 1. Generate Enterprise Framework
```bash
# Generate complete enterprise framework
enterprise generate user-service --domain user --enterprise-framework

# Creates infrastructure (🤖) + business templates (👨‍💻)
# Developer can ONLY modify business logic files
```

### 2. Implement Business Logic ONLY
```java
// 👨‍💻 STEP 1: Implement Business Validation
@Component
public class UserBusinessValidator extends BusinessValidator.AbstractBusinessValidator<User, UserRequest, UserRequest> {
    @Override
    public ValidationResult validateCreate(UserRequest request) {
        return validationBuilder()
            .checkNotEmpty(request.getEmail(), "Email")
            .check(isValidEmail(request.getEmail()), "Email format invalid")
            .check(!userExists(request.getEmail()), "User already exists")
            .build(); // Pure business validation - no infrastructure concerns
    }
}

// 👨‍💻 STEP 2: Implement Business Rules
@Component
public class UserBusinessRules extends BusinessRules.AbstractBusinessRules<User, UserRequest, UserRequest> {
    @Override
    public void applyCreateRules(User entity, UserRequest createDTO) {
        // Pure business logic - infrastructure handled automatically
        entity.setBusinessId(generateBusinessId("USER", entity));
        entity.setStatus("ACTIVE");
        entity.setMembershipLevel(calculateMembershipLevel(createDTO));
    }
}

// 🤖 INFRASTRUCTURE: Transactions, caching, metrics, audit, events - ALL AUTOMATIC
```

### 3. Start Development (Framework Handles Everything)
```bash
# Enterprise framework provides everything automatically:
# - Transactions ✓  - Caching ✓  - Metrics ✓  - Audit ✓  - Events ✓  - Security ✓
enterprise dev start --enterprise-framework
```

### 4. Test Business Logic (Infrastructure Already Tested)
```bash
# Test ONLY business logic - infrastructure is framework-tested
enterprise test --business-logic-only
```

### 5. Deploy Enterprise Application
```bash
# Deploy complete enterprise application with all features
enterprise deploy --environment staging --enterprise-framework
```

## 🏢 **Enterprise Framework - Automatic Features**

### 🤖 **Infrastructure Features (Automatic - No Developer Action Required)**

#### **Enterprise Security**
- **Automatic security headers** and HTTPS enforcement configured
- **Input validation framework** with business rule integration
- **CORS configuration** optimized for enterprise environments
- **Method-level security** integrated with business authorization
- **OAuth2 + JWT** authentication with enterprise user management

#### **Enterprise Monitoring & Observability**
- **Automatic metrics collection** for all business operations (create, update, delete)
- **Business KPI tracking** with custom metrics per domain
- **Prometheus integration** with enterprise dashboards
- **Structured audit logging** with JSON format for SIEM integration
- **Request correlation IDs** for distributed tracing
- **Performance monitoring** with automatic slow operation detection

#### **Enterprise Data Management**
- **Automatic caching layer** with configurable cache regions per entity
- **Soft delete patterns** with audit trail preservation
- **Optimistic locking** for concurrent operation safety
- **Business query patterns** (findByBusinessId, findActive, getStatistics)
- **JPA Specification patterns** for dynamic enterprise queries

#### **Enterprise Integration & Events**
- **Domain event publishing** for microservice communication
- **Enterprise event correlation** with business context
- **Asynchronous processing** with automatic retry and dead letter queues
- **Circuit breaker patterns** for resilience
- **Message transformation** with audit trails

### 👨‍💻 **Business Features (Developer Implements - Framework Guides)**

#### **Business Validation Framework**
- **Fluent validation builders** for complex business constraints
- **Cross-field validation** with business rule integration
- **State transition validation** for entity lifecycle management
- **Validation result aggregation** with detailed error reporting

#### **Business Rules Engine**
- **Rule execution orchestration** with automatic audit trails
- **Business metrics calculation** and KPI computation
- **Business event triggering** based on operations and state changes
- **Rule dependency management** with execution order optimization

#### **Enterprise Quality Assurance (Built-in)**
- **Architecture validation** with ArchUnit preventing infrastructure modification
- **Business logic testing frameworks** with enterprise test patterns
- **Automatic integration testing** for enterprise patterns
- **Code coverage enforcement** minimum 80% for business logic

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/enterprise/enterprise-cli.git
cd enterprise-cli
npm install
npm run dev
```

### Running Tests
```bash
npm test
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 [Documentation](https://docs.enterprise-cli.com)
- 💬 [Community Forum](https://community.enterprise-cli.com)
- 🐛 [Issue Tracker](https://github.com/enterprise/enterprise-cli/issues)

### Professional Support
For enterprise support, training, and consulting:
- 📧 Email: support@enterprise-cli.com
- 🌐 Website: https://enterprise-cli.com

## 🗺️ **Enterprise Framework Roadmap**

### Current Version (2.0.0) - Enterprise Framework
- ✅ **AbstractEnterpriseService** with Template Method pattern
- ✅ **AbstractEnterpriseController** with standardized REST endpoints
- ✅ **AbstractEnterpriseRepository** with JPA Specification patterns
- ✅ **Business validation and rules framework** with Strategy pattern
- ✅ **Enterprise annotations** for configuration (@EnterpriseEntity, @EnterpriseService)
- ✅ **Complete audit, metrics, events infrastructure** automatic
- ✅ **Infrastructure code "blinding"** - cannot be modified by developers

### Upcoming Features (2.1.0) - Advanced Enterprise Patterns
- 🔄 **GraphQL Enterprise Framework** with same architecture principles
- 🔄 **Microservices communication patterns** with enterprise event bus
- 🔄 **CQRS and Event Sourcing templates** with business logic separation
- 🔄 **Enterprise security framework** with automatic RBAC and audit

### Future Enhancements (2.2.0+) - Enterprise Intelligence
- 🔄 **AI-powered business rule suggestions** based on domain analysis
- 🔄 **Enterprise performance optimization** with automatic tuning
- 🔄 **Business intelligence dashboards** with automatic KPI generation
- 🔄 **Enterprise framework library extraction** for reusable deployment

### Enterprise Framework Library (3.0.0)
- 🔄 **Standalone enterprise framework library** extracted from CLI
- 🔄 **Spring Boot starter integration** for existing projects
- 🔄 **Multi-organization framework deployment** with shared infrastructure
- 🔄 **Enterprise framework marketplace** for custom business patterns

---

## 🎯 **Enterprise CLI Mission**

**Enterprise CLI** - **Forces developers to write only business logic by making infrastructure code impossible to modify.**

### 🏆 **Success Metrics**
- ✅ **Junior Developer Experience**: Generate complete enterprise application in 15 minutes
- ✅ **Business Logic Focus**: 100% of developer time spent on business value
- ✅ **Infrastructure Safety**: 0% possibility of breaking enterprise patterns
- ✅ **Enterprise Compliance**: 100% audit, security, performance standards automatic

> 💡 **Revolutionary Approach**: Instead of teaching developers enterprise patterns, the Enterprise Framework **forces** them through Template Method pattern and "blinded" infrastructure code. Junior developers literally cannot write bad enterprise code.