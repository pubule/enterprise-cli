# {{domainTitleCase}} Microservice

> Enterprise-grade microservice built with Enterprise Framework v{{frameworkVersion}}

## Overview

This microservice provides a complete RESTful API for {{domain}} management with enterprise features including CRUD operations, validation, pagination, soft delete, audit logging, and event-driven architecture.

## Features

- ✅ **Full CRUD Operations** with validation
- ✅ **Pagination & Search** with dynamic criteria
- ✅ **Audit Logging** (createdBy, createdAt, updatedBy, updatedAt)
- ✅ **Soft Delete** support
- ✅ **Event-Driven** architecture
- ✅ **Business Rules** validation with priorities
- ✅ **Standardized Error Handling** with field-level errors
- ✅ **API Documentation** with OpenAPI/Swagger
- ✅ **Health Checks** with Spring Actuator
- ✅ **Metrics** with Prometheus
- ✅ **Docker** ready
- ✅ **Kubernetes** ready

## Prerequisites

- **Java 17+** (JDK)
- **Apache Maven 3.8+**
- **Docker** (optional, for containerization)
{{#postgresql}}
- **PostgreSQL 14+** (or use Docker Compose)
{{/postgresql}}
{{#mysql}}
- **MySQL 8.0+** (or use Docker Compose)
{{/mysql}}

## Quick Start

### 1. Build the Project

```bash
mvn clean package
```

### 2. Run Locally

```bash
# Using Maven
mvn spring-boot:run

# Or using the JAR
java -jar target/{{serviceName}}.jar
```

The application will start at `http://localhost:8080`

### 3. Verify It's Running

```bash
# Health check
curl http://localhost:8080/actuator/health

# API Documentation
open http://localhost:8080/swagger-ui.html
```

## API Endpoints

### {{domainTitleCase}} Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/{{domain}}s` | Create a new {{domain}} |
| `GET` | `/api/v1/{{domain}}s/{id}` | Get {{domain}} by ID |
| `GET` | `/api/v1/{{domain}}s` | List all {{domain}}s (paginated) |
| `PUT` | `/api/v1/{{domain}}s/{id}` | Update {{domain}} |
| `PATCH` | `/api/v1/{{domain}}s/{id}` | Partially update {{domain}} |
| `DELETE` | `/api/v1/{{domain}}s/{id}` | Delete {{domain}} (soft delete) |
| `GET` | `/api/v1/{{domain}}s/search` | Search {{domain}}s with criteria |
| `GET` | `/api/v1/{{domain}}s/count` | Count all {{domain}}s |
| `GET` | `/api/v1/{{domain}}s/{id}/exists` | Check if {{domain}} exists |
| `POST` | `/api/v1/{{domain}}s/{id}/activate` | Activate {{domain}} |
| `POST` | `/api/v1/{{domain}}s/{id}/deactivate` | Deactivate {{domain}} |

### Example: Create {{domainTitleCase}}

```bash
curl -X POST http://localhost:8080/api/v1/{{domain}}s \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample {{domainTitleCase}}",
    "description": "This is a sample {{domain}}",
    "status": "ACTIVE"
  }'
```

### Example: List {{domainTitleCase}}s (Paginated)

```bash
curl "http://localhost:8080/api/v1/{{domain}}s?page=0&size=20&sortBy=name&sortDir=asc"
```

### Example: Search {{domainTitleCase}}s

```bash
curl "http://localhost:8080/api/v1/{{domain}}s/search?name=Sample&status=ACTIVE&page=0&size=20"
```

## Configuration

### Application Properties

Edit `src/main/resources/application.yml`:

```yaml
server:
  port: 8080

spring:
  application:
    name: {{serviceName}}

  datasource:
    {{#postgresql}}
    url: jdbc:postgresql://localhost:5432/{{domain}}_db
    username: postgres
    password: postgres
    {{/postgresql}}
    {{#mysql}}
    url: jdbc:mysql://localhost:3306/{{domain}}_db
    username: root
    password: root
    {{/mysql}}
    {{#h2}}
    url: jdbc:h2:mem:{{domain}}_db
    username: sa
    password:
    {{/h2}}

enterprise:
  framework:
    enabled: true
    jpa:
      auditing-enabled: true
    events:
      async-enabled: true
    pagination:
      default-page-size: 20
      max-page-size: 100
```

### Profiles

- **dev**: Development profile (H2 in-memory, debug logging)
- **prod**: Production profile (PostgreSQL/MySQL, info logging)

```bash
# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with prod profile
java -jar target/{{serviceName}}.jar --spring.profiles.active=prod
```

## Docker

### Build Image

```bash
docker build -t {{serviceName}}:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

This starts:
- The microservice on port 8080
{{#postgresql}}
- PostgreSQL database on port 5432
{{/postgresql}}
{{#mysql}}
- MySQL database on port 3306
{{/mysql}}

### Stop Services

```bash
docker-compose down
```

## Kubernetes

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace {{serviceName}}

# Apply configurations
kubectl apply -f k8s/ -n {{serviceName}}

# Check status
kubectl get pods -n {{serviceName}}
kubectl get services -n {{serviceName}}
```

### Access the Service

```bash
# Port forward
kubectl port-forward -n {{serviceName}} svc/{{serviceName}} 8080:8080

# Or use ingress (if configured)
curl http://{{serviceName}}.example.com/api/v1/{{domain}}s
```

## Testing

### Run All Tests

```bash
mvn test
```

### Run with Coverage

```bash
mvn test jacoco:report
```

Coverage report: `target/site/jacoco/index.html`

### Integration Tests

```bash
mvn verify
```

## Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Metrics

```bash
# All metrics
curl http://localhost:8080/actuator/metrics

# Specific metric
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

### Prometheus Endpoint

```bash
curl http://localhost:8080/actuator/prometheus
```

## Development

### Project Structure

```
{{serviceName}}/
├── src/main/java/{{packagePath}}/
│   ├── {{domainTitleCase}}Application.java       # Main application
│   ├── entity/
│   │   └── {{domainTitleCase}}.java             # Entity (extends AbstractAuditableEntity)
│   ├── repository/
│   │   └── {{domainTitleCase}}Repository.java   # Repository (extends AbstractEnterpriseRepository)
│   ├── service/
│   │   └── {{domainTitleCase}}Service.java      # Service (extends AbstractEnterpriseService)
│   ├── controller/
│   │   └── {{domainTitleCase}}Controller.java   # REST Controller (extends AbstractEnterpriseController)
│   ├── dto/
│   │   ├── {{domainTitleCase}}Request.java      # Request DTO
│   │   └── {{domainTitleCase}}Response.java     # Response DTO
│   ├── mapper/
│   │   └── {{domainTitleCase}}Mapper.java       # Entity/DTO mapper
│   ├── validation/
│   │   └── {{domainTitleCase}}Validator.java    # Business validator
│   ├── business/
│   │   └── {{domainTitleCase}}BusinessRules.java # Business rules
│   └── enterprise/framework/                     # Enterprise Framework (v{{frameworkVersion}})
├── src/main/resources/
│   ├── application.yml                           # Main configuration
│   ├── application-dev.yml                       # Dev profile
│   ├── application-prod.yml                      # Prod profile
│   {{#hasFlyway}}
│   └── db/migration/
│       └── V1__Create_{{domain}}_table.sql      # Database migration
│   {{/hasFlyway}}
└── src/test/java/                                # Tests
```

### Adding Custom Business Logic

The Enterprise Framework handles all boilerplate. Add your business logic in:

1. **Service** (`{{domainTitleCase}}Service.java`):
   ```java
   public {{domainTitleCase}} customBusinessMethod(Long id) {
       {{domainTitleCase}} entity = findById(id);
       // Your business logic here
       return repository.save(entity);
   }
   ```

2. **Controller** (`{{domainTitleCase}}Controller.java`):
   ```java
   @PostMapping("/{id}/custom-action")
   public ResponseEntity<ApiResponse<{{domainTitleCase}}Response>> customAction(@PathVariable Long id) {
       {{domainTitleCase}} result = service.customBusinessMethod(id);
       return ResponseEntity.ok(ApiResponse.success(mapper.toResponse(result)));
   }
   ```

3. **Validator** (`{{domainTitleCase}}Validator.java`):
   ```java
   // Add custom validation rules
   if (entity.getName().contains("forbidden")) {
       result.addError("name", "Name contains forbidden word", "FORBIDDEN_WORD");
   }
   ```

4. **Business Rules** (`{{domainTitleCase}}BusinessRules.java`):
   ```java
   // Add business rules with priorities
   if (entity.getStatus().equals("INACTIVE") && hasActiveReferences(entity)) {
       return RuleResult.fail(getRuleName(),
           "Cannot deactivate with active references",
           RuleResult.RuleSeverity.ERROR);
   }
   ```

## Enterprise Framework

This microservice is built with Enterprise Framework v{{frameworkVersion}}, which provides:

- **Base Classes**: AbstractAuditableEntity, AbstractEnterpriseService, AbstractEnterpriseController
- **Validation Framework**: Field-level errors, warnings, business rules with priorities
- **Event System**: Typed domain events with metadata and async support
- **DTO Pattern**: ApiResponse, PagedResponse, EntityMapper
- **Exception Handling**: Structured errors with GlobalExceptionHandler
- **Auto-configuration**: Zero-config setup with Spring Boot

For complete framework documentation, see: `src/main/java/{{packagePath}}/enterprise/framework/FRAMEWORK_README.md`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

{{#postgresql}}
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs <container-id>
```
{{/postgresql}}

{{#mysql}}
```bash
# Check MySQL is running
docker ps | grep mysql

# View logs
docker logs <container-id>
```
{{/mysql}}

### Build Issues

```bash
# Clean and rebuild
mvn clean install -U

# Skip tests
mvn clean package -DskipTests
```

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: See `FRAMEWORK_README.md` in framework package
- **Issues**: Report issues on project repository
- **Generated with**: Enterprise CLI v{{cliVersion}}

---

**Happy Coding! 🚀**
