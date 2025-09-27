# {{serviceNameTitleCase}} 🚀

[![CI/CD Pipeline](https://github.com/company/{{serviceName}}/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/company/{{serviceName}}/actions/workflows/ci-cd.yml)
[![Coverage](https://codecov.io/gh/company/{{serviceName}}/branch/main/graph/badge.svg)](https://codecov.io/gh/company/{{serviceName}})
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project={{serviceName}}&metric=alert_status)](https://sonarcloud.io/dashboard?id={{serviceName}})
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project={{serviceName}}&metric=security_rating)](https://sonarcloud.io/dashboard?id={{serviceName}})

Enterprise-grade {{domainTitleCase}} microservice built with Spring Boot, designed for scalability, maintainability, and performance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Monitoring](#monitoring)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

The {{serviceNameTitleCase}} is a production-ready microservice that provides comprehensive {{domainTitleCase}} management capabilities. Built using modern enterprise patterns and best practices, it offers:

- **RESTful API** for {{domainTitleCase}} operations
- **Robust data persistence** with JPA and database support
- **Enterprise security** with OAuth2/JWT authentication
- **Comprehensive monitoring** and observability
- **Cloud-native deployment** with Docker and Kubernetes
- **Automated CI/CD** with quality gates and security scanning

## ✨ Features

### Core Functionality
- 🔧 **Full CRUD Operations** - Create, read, update, and delete {{domain}}s
- 🔍 **Advanced Search** - Flexible search and filtering capabilities
- 📄 **Pagination Support** - Efficient handling of large datasets
- 🔄 **Data Validation** - Comprehensive input validation and sanitization

### Enterprise Features
- 🛡️ **Security First** - OAuth2, JWT, CORS, and security headers
- 📊 **Monitoring Ready** - Health checks, metrics, and distributed tracing
- 🚀 **Performance Optimized** - Caching, connection pooling, and query optimization
- 🔌 **Integration Ready** - Apache Camel routes for enterprise integration
- 📚 **API Documentation** - Interactive OpenAPI/Swagger documentation

### Technical Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: {{#postgresql}}PostgreSQL{{/postgresql}}{{#mysql}}MySQL{{/mysql}}{{#h2}}H2 (Development){{/h2}}
- **Cache**: Caffeine
- **Documentation**: OpenAPI 3.0
- **Testing**: JUnit 5, TestContainers, MockMvc
- **Build**: Maven
- **Containerization**: Docker
- **Orchestration**: Kubernetes

## 🏗️ Architecture

```mermaid
graph TB
    Client[Client Applications] --> LB[Load Balancer]
    LB --> API[{{serviceNameTitleCase}}]

    API --> Cache[Caffeine Cache]
    API --> DB[{{#postgresql}}PostgreSQL{{/postgresql}}{{#mysql}}MySQL{{/mysql}}{{#h2}}H2 Database{{/h2}}]
    API --> MQ[Message Queue]

    API --> Metrics[Prometheus Metrics]
    API --> Logs[Application Logs]

    subgraph "Application Layers"
        Controller[REST Controllers]
        Service[Business Services]
        Repository[Data Repositories]
        Entity[JPA Entities]
    end

    Controller --> Service
    Service --> Repository
    Repository --> Entity
```

### Layer Responsibilities

- **Controller Layer**: HTTP request handling, validation, error responses
- **Service Layer**: Business logic, transaction management, caching
- **Repository Layer**: Data access, query optimization, database interactions
- **Entity Layer**: Domain models, data validation, audit trails

## 🚀 Quick Start

### Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Docker** (optional, for containerized setup)
{{#postgresql}}
- **PostgreSQL 12+** (for production)
{{/postgresql}}
{{#mysql}}
- **MySQL 8.0+** (for production)
{{/mysql}}

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/company/{{serviceName}}.git
   cd {{serviceName}}
   ```

2. **Run with Maven** (uses H2 in-memory database)
   ```bash
   mvn spring-boot:run
   ```

3. **Access the application**
   - API: http://localhost:8080/api/v1
   - Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html
   - Health Check: http://localhost:8080/api/v1/actuator/health

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access services**
   - Application: http://localhost:8080
   {{#postgresql}}
   - PostgreSQL: localhost:5432
   {{/postgresql}}
   {{#mysql}}
   - MySQL: localhost:3306
   {{/mysql}}
   - Redis: localhost:6379
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin)

## 💻 Development

### Project Structure

```
{{serviceName}}/
├── src/
│   ├── main/
│   │   ├── java/{{packagePath}}/
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── service/             # Business services
│   │   │   ├── repository/          # Data repositories
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── dto/                 # Data transfer objects
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── exception/           # Exception handling
│   │   │   └── camel/               # Integration routes
│   │   └── resources/
│   │       ├── application.yml      # Configuration
│   │       └── db/migration/        # Database migrations
│   └── test/
│       ├── java/                    # Test classes
│       └── resources/               # Test resources
├── k8s/                             # Kubernetes manifests
├── docker-compose.yml               # Development environment
├── Dockerfile                       # Container image
└── README.md                        # This file
```

### Development Guidelines

1. **Code Style**: Follow Google Java Style Guide
2. **Testing**: Maintain 80%+ test coverage
3. **Documentation**: Update OpenAPI specifications
4. **Security**: Never commit secrets or credentials
5. **Performance**: Consider caching and query optimization

### Available Profiles

- `dev` - Development (H2 database, debug logging)
- `test` - Testing (H2 in-memory, fast startup)
- `prod` - Production (external database, optimized settings)

## 🧪 Testing

### Running Tests

```bash
# Unit tests
mvn test

# Integration tests
mvn verify -P integration

# All tests with coverage
mvn clean verify
```

### Test Categories

- **Unit Tests**: Fast, isolated tests for business logic
- **Integration Tests**: Database and external service integration
- **Contract Tests**: API contract validation
- **Performance Tests**: Load and stress testing with JMeter

### Test Coverage

The project maintains high test coverage across all layers:
- Controllers: REST endpoint testing with MockMvc
- Services: Business logic testing with Mockito
- Repositories: Data access testing with @DataJpaTest
- Integration: End-to-end testing with TestContainers

## 🚢 Deployment

### Container Deployment

```bash
# Build image
docker build -t {{serviceName}}:latest .

# Run container
docker run -p 8080:8080 {{serviceName}}:latest
```

### Kubernetes Deployment

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl rollout status deployment/{{serviceName}}

# View logs
kubectl logs -f deployment/{{serviceName}}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `SPRING_DATASOURCE_URL` | Database connection URL | - |
| `SPRING_DATASOURCE_USERNAME` | Database username | - |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - |
| `JAVA_OPTS` | JVM options | `-XX:+UseContainerSupport` |

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `/api/v1/swagger-ui/index.html`
- **OpenAPI Spec**: `/api/v1/api-docs`

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/{{domain}}s` | List all {{domain}}s |
| `GET` | `/{{domain}}s/{id}` | Get {{domain}} by ID |
| `POST` | `/{{domain}}s` | Create new {{domain}} |
| `PUT` | `/{{domain}}s/{id}` | Update {{domain}} |
| `DELETE` | `/{{domain}}s/{id}` | Delete {{domain}} |
| `GET` | `/{{domain}}s/search` | Search {{domain}}s |

### Authentication

The API supports multiple authentication methods:

1. **Bearer Token (JWT)**
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8080/api/v1/{{domain}}s
   ```

2. **Basic Authentication**
   ```bash
   curl -u user:password \
        http://localhost:8080/api/v1/{{domain}}s
   ```

## 📊 Monitoring

### Health Checks

- **Liveness**: `/actuator/health/liveness`
- **Readiness**: `/actuator/health/readiness`
- **Overall Health**: `/actuator/health`

### Metrics

- **Application Metrics**: `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`
- **JVM Metrics**: Memory, GC, threads

### Logging

- **Structured Logging**: JSON format for production
- **Log Levels**: Configurable per package
- **Correlation IDs**: Request tracing support

## 🔒 Security

### Security Features

- **Authentication**: OAuth2/JWT and Basic Auth
- **Authorization**: Role-based access control
- **CORS**: Configurable cross-origin policies
- **Security Headers**: HSTS, CSP, XSS protection
- **Input Validation**: Comprehensive data validation

### Security Scanning

- **Dependency Check**: OWASP dependency scanning
- **Container Scanning**: Trivy vulnerability assessment
- **Code Analysis**: SonarQube security rules
- **Secret Detection**: Git hooks for credential scanning

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`mvn verify`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Review Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Breaking changes documented

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [API Documentation](https://{{serviceName}}.company.com/swagger-ui/)
- [Monitoring Dashboard](https://grafana.company.com/d/{{serviceName}})
- [Issue Tracker](https://github.com/company/{{serviceName}}/issues)
- [Wiki](https://github.com/company/{{serviceName}}/wiki)

## 👥 Support

- **Email**: api-support@company.com
- **Slack**: #{{serviceName}}-support
- **Documentation**: https://docs.company.com/{{serviceName}}

---

**Generated by Enterprise CLI** - [Learn more](https://github.com/company/enterprise-cli)