# Enterprise CLI

🚀 **Comprehensive Enterprise CLI tool for automating full-stack application generation with Spring Boot backend and React frontend.**

Enterprise CLI is designed for organizations where junior developers need to focus only on business logic while all framework code is auto-generated. It enables rapid development of production-ready, secure, tested full-stack applications that follow enterprise best practices.

## ✨ Features

### 🎯 **Backend Generation (Spring Boot)**
- **Complete Spring Boot 3.x microservices** with enterprise patterns
- **Spring Security + OAuth2** authentication and authorization
- **Apache Camel integration routes** for legacy systems
- **JPA entities and repositories** with database migrations
- **REST controllers** with OpenAPI documentation
- **Comprehensive test suite** (Unit + Integration + Architecture tests using ArchUnit)
- **Docker & Kubernetes** deployment manifests
- **Database migrations** with Flyway
- **Monitoring setup** with Micrometer + Prometheus

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

## 📖 Usage

### Initialize Workspace
```bash
enterprise init --full-stack
```

### Generate Spring Boot Microservice
```bash
enterprise generate user-service --domain user --entities User,Profile
```

Interactive mode:
```bash
enterprise generate
# Follow the prompts to configure your microservice
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

**Example:**
```bash
enterprise generate order-service \
  --domain order \
  --package com.company.order \
  --entities Order,OrderItem \
  --database postgresql
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

## 🏗️ Generated Project Structure

### Spring Boot Backend
```
generated-backend/
├── src/main/java/com/company/{domain}/
│   ├── {Domain}ServiceApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── CamelConfig.java
│   ├── controller/                    # REST endpoints
│   ├── service/                       # Business logic
│   ├── domain/                        # Pure domain objects
│   ├── repository/                    # JPA repositories
│   ├── entity/                        # JPA entities
│   ├── integration/
│   │   ├── routes/                    # Camel routes
│   │   └── processor/                 # Message processors
│   └── dto/                           # API DTOs
├── src/test/java/
│   ├── integration/                   # Integration tests
│   ├── unit/                          # Unit tests
│   └── architecture/                  # Architecture tests
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                  # Database migrations
├── k8s/                               # Kubernetes manifests
├── Dockerfile
├── docker-compose.yml
└── README.md
```

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

## 🔧 Development Workflow

### 1. Generate Full-Stack Application
```bash
# Create backend service
enterprise generate user-service --domain user

# Create frontend application
enterprise frontend create user-dashboard

# Setup development environment
enterprise dev setup
```

### 2. Start Development
```bash
# Start both backend and frontend
enterprise dev start --full-stack
```

### 3. Run Tests
```bash
# Run comprehensive test suite
enterprise test --coverage
```

### 4. Deploy
```bash
# Deploy to staging
enterprise deploy --environment staging
```

## 🏢 Enterprise Features

### Security
- **OAuth2 + JWT** authentication
- **Method-level security** with Spring Security
- **CORS configuration** for frontend integration
- **Input validation** and sanitization
- **Security headers** and HTTPS enforcement

### Monitoring
- **Health checks** with Spring Boot Actuator
- **Metrics collection** with Micrometer
- **Prometheus integration** for monitoring
- **Structured logging** with correlation IDs

### Integration
- **Apache Camel routes** for legacy system integration
- **Circuit breakers** for resilience
- **Message transformation** and routing
- **Error handling** and retry policies

### Quality Assurance
- **Comprehensive testing** at all levels
- **Code coverage** reporting
- **Static code analysis** with SonarQube integration
- **Architecture validation** with ArchUnit

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

## 🗺️ Roadmap

### Current Version (1.0.0)
- ✅ Spring Boot microservice generation
- ✅ React application generation
- ✅ Full-stack development environment
- ✅ Comprehensive testing
- ✅ Docker and Kubernetes deployment

### Upcoming Features (1.1.0)
- 🔄 GraphQL API generation
- 🔄 Microservices communication patterns
- 🔄 Event-driven architecture templates
- 🔄 Cloud-native deployment (AWS, GCP, Azure)

### Future Enhancements (1.2.0+)
- 🔄 AI-powered code generation
- 🔄 Performance optimization suggestions
- 🔄 Advanced monitoring and observability
- 🔄 Multi-tenant architecture support

---

**Enterprise CLI** - Empowering developers to build enterprise-grade applications rapidly and reliably.

> 💡 **Success Criteria**: A junior developer should be able to generate a complete, production-ready full-stack application and deploy it in under 30 minutes, writing only business logic code.