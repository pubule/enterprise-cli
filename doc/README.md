# Enterprise CLI Documentation

> 🚀 **Enterprise-grade CLI for generating full-stack applications with Spring Boot and React**

## Welcome

Enterprise CLI is a powerful command-line tool designed to accelerate enterprise application development by generating production-ready microservices and React applications with best practices baked in.

## What is Enterprise CLI?

Enterprise CLI automates the creation of:

- **Spring Boot Microservices** with a custom Enterprise Framework
- **React Applications** with modern tooling (TypeScript, Redux, Router)
- **Development Environments** with one-command setup
- **Docker & Kubernetes** configurations for deployment

## Key Features

✅ **Enterprise Framework v2.0** 🆕
- Advanced validation with field-level errors and warnings
- Typed domain events with metadata and async support
- Structured error handling with ErrorDetails
- DTO pattern with automatic entity mapping
- Business rules with priority system
- Base classes for entities, services, controllers, repositories
- Built-in audit logging, soft delete, multi-tenancy
- Reduces boilerplate by 70%

✅ **Modern Tech Stack**
- Spring Boot 3.x + Security + JPA + Camel
- React 18 + TypeScript + Redux Toolkit
- PostgreSQL / MySQL / H2 databases
- Docker & Kubernetes ready

✅ **Interactive Prompts**
- Guided project generation
- Smart defaults
- Validation at every step

✅ **Development Tools**
- One-command environment setup
- Auto-start backend and frontend
- Process management (start/stop/logs)
- Cross-platform support (Windows, Linux, macOS)

✅ **Extensive Customization**
- Choose UI frameworks (Material-UI, Ant Design, Chakra UI)
- Select build tools (Vite, CRA, Webpack)
- Enable/disable features (OAuth2, Camel, PWA, etc.)
- Configure databases and authentication

## Quick Start

### Installation

```bash
# Install globally via NPM
npm install -g enterprise-cli

# Or use directly with npx
npx enterprise-cli [command]

# Verify installation
ent --version
```

**Aliases available:**
- `enterprise-cli`
- `enterprise`
- `ent` (recommended, shortest)

### 30-Second Example

Generate a complete microservice in seconds:

```bash
# Generate a user management microservice
ent generate user-service

# Follow the interactive prompts, or use CLI options:
ent generate user-service \
  --domain user \
  --database postgresql

# Setup and start development
cd user-service
ent dev setup
ent dev start --backend

# Backend is now running at http://localhost:8080
# API docs at http://localhost:8080/swagger-ui.html
```

### Quick Frontend Example

Create a React admin application:

```bash
# Generate React app
ent frontend create user-admin-ui

# Follow prompts, or specify options:
ent fe create user-admin-ui \
  --template material-ui \
  --typescript \
  --redux

# Setup and start
cd user-admin-ui
npm install
ent dev start --frontend

# Frontend is now running at http://localhost:3000
```

## Available Commands

| Command | Description |
|---------|-------------|
| `ent generate` | Generate Spring Boot microservice with Enterprise Framework |
| `ent frontend create` | Create React application with modern tooling |
| `ent frontend build` | Build React app for production |
| `ent frontend test` | Run tests for React app |
| `ent dev setup` | Setup development environment (Java, Maven, Node, Docker) |
| `ent dev start` | Start development servers (backend/frontend/full-stack) |
| `ent dev stop` | Stop all running development servers |
| `ent dev logs` | Show development server logs |

## Documentation Index

### Getting Started
- **[Getting Started Tutorial](./TUTORIAL_GETTING_STARTED.md)** - Step-by-step guide for beginners
- **[Full-Stack Tutorial](./TUTORIAL_FULL_STACK.md)** - Build a complete application from scratch

### Reference Guides
- **[Commands Reference](./COMMANDS_REFERENCE.md)** - Complete command documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - CLI architecture and design
- **[Enterprise Framework](./ENTERPRISE_FRAMEWORK.md)** - Understanding the Enterprise Framework
- **[Technology Stack](./TECH_STACK.md)** - Complete tech stack reference

### Advanced Topics
- **[Best Practices](./BEST_PRACTICES.md)** - Recommended patterns and practices
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](./CONTRIBUTING.md)** - Contribute to the project

## Prerequisites

### Backend Development
- **Java JDK 17+** (for Spring Boot)
- **Apache Maven 3.8+** (for dependency management)
- **Docker** (optional, for containerized services)

### Frontend Development
- **Node.js 18+** (for React development)
- **NPM 9+** or **Yarn** (package manager)

### Recommended Tools
- **Git** (version control)
- **Docker Desktop** (for local testing)
- **PostgreSQL** or **MySQL** (or use H2 for development)
- **VS Code** or **IntelliJ IDEA** (IDEs)

## System Requirements

- **OS:** Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **RAM:** Minimum 8GB (16GB recommended for full-stack development)
- **Disk:** 2GB free space (plus project dependencies)
- **Network:** Internet connection for downloading dependencies

## What Gets Generated?

### Backend (Spring Boot Microservice)

```
user-service/
├── src/main/java/com/company/user/
│   ├── enterprise/framework/          # Enterprise Framework v2.0 (36 files)
│   │   ├── annotation/                # Meta-annotations (NEW v2.0)
│   │   │   ├── EnterpriseEntity.java
│   │   │   ├── EnterpriseService.java
│   │   │   ├── EnterpriseController.java
│   │   │   ├── BusinessRule.java
│   │   │   └── BusinessValidation.java
│   │   ├── config/                    # Auto-configuration (NEW v2.0)
│   │   │   ├── EnterpriseFrameworkAutoConfiguration.java
│   │   │   └── FrameworkProperties.java
│   │   ├── core/
│   │   │   ├── entity/
│   │   │   │   ├── AbstractAuditableEntity.java
│   │   │   │   ├── SoftDeletable.java
│   │   │   │   └── TenantAware.java
│   │   │   ├── repository/
│   │   │   │   ├── AbstractEnterpriseRepository.java
│   │   │   │   └── SpecificationBuilder.java
│   │   │   ├── service/
│   │   │   │   ├── AbstractEnterpriseService.java
│   │   │   │   └── CrudService.java
│   │   │   └── controller/
│   │   │       └── AbstractEnterpriseController.java
│   │   ├── dto/                       # Response wrappers (v2.0)
│   │   │   ├── ApiResponse.java
│   │   │   ├── PagedResponse.java
│   │   │   ├── ErrorDetails.java
│   │   │   └── EntityMapper.java
│   │   ├── validation/                # Validation framework (v2.0)
│   │   │   ├── ValidationResult.java
│   │   │   ├── ValidationContext.java
│   │   │   ├── RuleContext.java
│   │   │   ├── RuleResult.java
│   │   │   ├── BusinessRule.java
│   │   │   ├── BusinessValidator.java
│   │   │   └── DefaultValidator.java
│   │   ├── event/                     # Event system (v2.0)
│   │   │   ├── DomainEvent.java
│   │   │   ├── AbstractDomainEvent.java
│   │   │   ├── EventPublisher.java
│   │   │   ├── SpringEventPublisher.java
│   │   │   ├── EntityCreatedEvent.java
│   │   │   ├── EntityUpdatedEvent.java
│   │   │   ├── EntityDeletedEvent.java
│   │   │   └── EntitySoftDeletedEvent.java
│   │   ├── exception/                 # Exception handling (v2.0)
│   │   │   ├── BusinessException.java
│   │   │   ├── ValidationException.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── ErrorDetails.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── EnterpriseFramework.java   # Utility facade (NEW v2.0)
│   │   └── FRAMEWORK_README.md        # Inline docs (NEW v2.0)
│   │
│   ├── entity/                        # Your business entities
│   │   └── User.java                  # Extends AbstractAuditableEntity + SoftDeletable
│   ├── dto/                           # Your DTOs
│   │   ├── UserRequest.java           # Request DTO with validation
│   │   └── UserResponse.java          # Response DTO with all fields
│   ├── mapper/                        # Entity/DTO mapping
│   │   └── UserMapper.java            # Implements EntityMapper
│   ├── repository/                    # Your repositories
│   │   └── UserRepository.java        # Extends AbstractEnterpriseRepository
│   ├── service/                       # Your business logic
│   │   └── UserService.java           # @EnterpriseService + custom methods
│   ├── controller/                    # Your REST endpoints
│   │   └── UserController.java        # @EnterpriseController + custom endpoints
│   ├── validation/                    # Business validation
│   │   └── UserValidator.java         # Implements BusinessValidator
│   ├── business/                      # Business rules
│   │   └── UserBusinessRules.java     # @BusinessRule with priority
│   └── UserServiceApplication.java    # Main Spring Boot app
│
├── src/main/resources/
│   ├── application.yml                # Base configuration
│   ├── application-dev.yml            # Development profile
│   ├── application-prod.yml           # Production profile
│   ├── banner.txt                     # Startup ASCII banner
│   └── db/migration/                  # Flyway database migrations
│       └── V1__Create_user_table.sql
│
├── src/test/java/                     # Comprehensive tests
│   └── com/company/user/
│       ├── service/
│       │   └── UserServiceTest.java   # 15 test methods (Mockito)
│       └── controller/
│           └── UserControllerTest.java # 12 test methods (MockMvc)
│
├── Dockerfile                         # Multi-stage container build
├── docker-compose.yml                 # App + database setup
├── .dockerignore                      # Docker ignore patterns
│
├── k8s/                               # Kubernetes manifests
│   ├── deployment.yml                 # 3 replicas + probes + resources
│   ├── service.yml                    # ClusterIP service
│   ├── configmap.yml                  # Configuration data
│   └── secret.yml.example             # Secret template
│
├── pom.xml                            # Maven configuration
├── .gitignore                         # Git ignore patterns
└── README.md                          # Project documentation
```

**Generated Files Summary:**
- **Framework**: 36 files (pre-built, production-ready)
- **Business Layer**: 9 files (Entity, Repository, Service, Controller, DTOs, Mapper, Validator, BusinessRules)
- **Configuration**: 5 files (application.yml profiles, Flyway migration, banner)
- **Tests**: 2 files (27 test methods total)
- **Docker**: 3 files (Dockerfile, docker-compose, .dockerignore)
- **Kubernetes**: 4 files (deployment, service, configmap, secret)
- **Total**: **62 files** (~3,800 LOC business code + ~850 LOC config)

### Frontend (React Application)

```
user-admin-ui/
├── src/
│   ├── components/                    # React components
│   ├── pages/                         # Page components
│   ├── store/                         # Redux store
│   │   ├── slices/
│   │   └── api/                       # RTK Query APIs
│   ├── services/                      # API services
│   ├── hooks/                         # Custom hooks
│   ├── types/                         # TypeScript types
│   ├── utils/                         # Utilities
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── public/                            # Static assets
├── cypress/                           # E2E tests (if enabled)
├── .storybook/                        # Storybook config (if enabled)
├── Dockerfile                         # Container image
├── package.json                       # NPM configuration
├── tsconfig.json                      # TypeScript config
└── vite.config.ts                     # Vite config
```

## Workflow Overview

```
┌─────────────────────────────────────────────────────────┐
│  1. Generate Project                                    │
│     ent generate user-service                           │
│     ent frontend create user-admin-ui                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  2. Setup Environment                                   │
│     ent dev setup --backend --frontend --docker         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  3. Customize Business Logic                            │
│     - Add domain logic to services                      │
│     - Implement validators                              │
│     - Create custom endpoints                           │
│     - Build UI components                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  4. Run Development Servers                             │
│     ent dev start --full-stack                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  5. Test & Build                                        │
│     ent frontend test --coverage                        │
│     ent frontend build                                  │
│     mvn clean package                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  6. Deploy                                              │
│     docker-compose up -d                                │
│     kubectl apply -f k8s/                               │
└─────────────────────────────────────────────────────────┘
```

## Support & Community

- **Documentation:** Full docs in `/doc` directory
- **Issues:** Report bugs and request features on GitHub
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - See LICENSE file for details

## Next Steps

👉 **New to Enterprise CLI?**
   Start with the [Getting Started Tutorial](./TUTORIAL_GETTING_STARTED.md)

👉 **Want to build a full application?**
   Follow the [Full-Stack Tutorial](./TUTORIAL_FULL_STACK.md)

👉 **Need command help?**
   Check the [Commands Reference](./COMMANDS_REFERENCE.md)

👉 **Want to understand the Enterprise Framework?**
   Read the [Enterprise Framework Guide](./ENTERPRISE_FRAMEWORK.md)

---

**Happy Coding! 🚀**
