# Getting Started with Enterprise CLI

> 🎓 **A step-by-step tutorial for junior developers**

Welcome! This tutorial will teach you how to use Enterprise CLI to build modern enterprise applications. No prior experience with the CLI is required.

> ⚡ **Updated for Enterprise Framework v2.0** - This tutorial uses the latest framework with advanced validation, typed events, and structured error handling.

## What You'll Learn

By the end of this tutorial, you'll be able to:
- ✅ Install and configure Enterprise CLI
- ✅ Generate a Spring Boot microservice
- ✅ Generate a React application
- ✅ Setup your development environment
- ✅ Run and test your applications

**Time Required:** 30-45 minutes

---

## Prerequisites

Before starting, make sure you have these installed:

### Required Tools

| Tool | Minimum Version | Check Installation |
|------|----------------|-------------------|
| **Java JDK** | 17+ | `java -version` |
| **Apache Maven** | 3.8+ | `mvn -version` |
| **Node.js** | 18+ | `node -v` |
| **NPM** | 9+ | `npm -v` |

### Optional Tools

| Tool | Purpose |
|------|---------|
| **Docker Desktop** | For running databases locally |
| **Git** | Version control |
| **VS Code** or **IntelliJ IDEA** | Code editor/IDE |

### Installation Guides

**Don't have these installed?** Here's where to get them:

- **Java JDK:** [https://adoptium.net/](https://adoptium.net/) (Download Temurin 17 or 21)
- **Maven:** [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
- **Node.js:** [https://nodejs.org/](https://nodejs.org/) (Download LTS version)
- **Docker:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

---

## Step 1: Install Enterprise CLI

Open your terminal and install the CLI globally:

```bash
npm install -g enterprise-cli
```

**Verify installation:**

```bash
ent --version
```

You should see: `1.0.0` (or current version)

**Test the CLI:**

```bash
ent --help
```

You should see the Enterprise CLI banner and available commands.

---

## Step 2: Initialize Your Workspace

Before generating projects, initialize the Enterprise CLI workspace:

```bash
ent init
```

**What this does:**

- ✅ Creates `.enterprise/` directory for CLI workspace files
- ✅ Creates `templates/custom/` directory for your custom templates
- ✅ Creates `.enterpriserc` configuration file with Framework version 2.0.0
- ✅ Sets up workspace defaults (database, Docker, Kubernetes preferences)

**Expected output:**

```
✅ Enterprise CLI workspace initialized!
Ready to generate microservices with Enterprise Framework foundation.

Created:
  • .enterprise/
  • templates/custom/
  • .enterpriserc

Next steps:
  ent generate <service-name>  - Generate a microservice
  ent frontend create <app-name> - Create a React app
  ent status                    - Check workspace status
```

**Verify workspace status:**

```bash
ent status
```

This shows:
- CLI Version (1.0.0)
- Framework Version (2.0.0)
- Workspace status (initialized)
- Environment check (Java, Maven, Node, Docker)

> 💡 **Tip:** Run `ent status` anytime to check your environment setup and verify all required tools are installed.

---

## Step 3: Generate Your First Microservice

Let's create a simple Task Management microservice.

### 3.1 Run the Generate Command

```bash
ent generate task-service
```

### 3.2 Follow the Interactive Prompts

The CLI will ask you several questions. Here's what to answer for this tutorial:

```
? Business domain (lowercase): task
? Java package name: com.company.task
? Entities (comma-separated PascalCase): Task
? Database type: h2
? Enterprise Framework version: 2.0.0
```

**For features, select these (use spacebar to toggle):**
- [x] Enterprise Framework Core (required, can't unselect)
- [x] OAuth2 Authentication
- [ ] Apache Camel Integration (deselect for now)
- [ ] Multi-tenancy Support
- [x] Soft Delete Support
- [x] Audit Logging
- [x] Event Publishing
- [x] Docker Configuration
- [ ] Kubernetes Manifests (deselect for now)
- [x] Monitoring (Prometheus)
- [x] OpenAPI/Swagger
- [x] Flyway Migrations

**Press Enter** to generate the project.

### 3.3 What Just Happened?

Enterprise CLI created a complete Spring Boot project:

```
task-service/
├── src/main/java/com/company/task/
│   ├── enterprise/framework/          ← Enterprise Framework
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── service/
│   │   └── controller/
│   ├── entity/
│   │   └── Task.java                  ← Your Task entity
│   ├── repository/
│   │   └── TaskRepository.java        ← Repository interface
│   ├── service/
│   │   └── TaskService.java           ← Business logic layer
│   ├── controller/
│   │   └── TaskController.java        ← REST API endpoints
│   └── TaskServiceApplication.java    ← Main application
├── src/main/resources/
│   ├── application.yml                ← Configuration
│   └── db/migration/                  ← Database migrations
├── src/test/java/                     ← Test files
├── docker-compose.yml                 ← Docker setup
├── Dockerfile                         ← Container image
└── pom.xml                            ← Maven dependencies
```

---

## Step 4: Explore the Generated Code

Let's look at the key files:

### 4.1 The Task Entity

Navigate to the project:

```bash
cd task-service
```

Open `src/main/java/com/company/task/entity/Task.java`:

```java
@Entity
@Table(name = "tasks")
public class Task extends AbstractEnterpriseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    // Getters and setters
}
```

**Notice:**
- The `Task` entity extends `AbstractEnterpriseEntity`
- This gives you automatic fields: `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deleted`
- You get soft-delete support automatically!

### 4.2 The Task Repository

Open `src/main/java/com/company/task/repository/TaskRepository.java`:

```java
@Repository
public interface TaskRepository extends AbstractEnterpriseRepository<Task, Long> {
    // Custom query methods go here

    List<Task> findByStatus(TaskStatus status);
}
```

**Notice:**
- Extends `AbstractEnterpriseRepository`
- Common methods like `findAll()`, `findById()`, `save()`, `delete()` are inherited
- You only add custom query methods

### 4.3 The Task Service

Open `src/main/java/com/company/task/service/TaskService.java`:

```java
@Service
public class TaskService extends AbstractEnterpriseService<Task, Long> {

    private final TaskRepository taskRepository;

    public TaskService(
        TaskRepository taskRepository,
        BusinessValidator<Task> validator,
        ApplicationEventPublisher eventPublisher
    ) {
        super(taskRepository, validator, eventPublisher);
        this.taskRepository = taskRepository;
    }

    @Override
    protected void mergeForUpdate(Task existing, Task updates) {
        existing.setTitle(updates.getTitle());
        existing.setDescription(updates.getDescription());
        existing.setStatus(updates.getStatus());
    }

    // Your business logic methods go here

    public List<Task> findByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }
}
```

**Notice (v2.0):**
- Extends `AbstractEnterpriseService` with generic type `<Task, Long>`
- Constructor requires: **repository**, **validator**, and **eventPublisher**
- Must implement `mergeForUpdate()` for update logic
- Transaction management handled automatically
- Validation with `ValidationResult` (errors + warnings)
- Event publishing with typed events built-in

### 4.4 The Task Controller

Open `src/main/java/com/company/task/controller/TaskController.java`:

```java
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController extends AbstractEnterpriseController<
        Task, Long, TaskRequest, TaskResponse> {

    private final TaskService taskService;

    public TaskController(
        TaskService taskService,
        TaskMapper mapper
    ) {
        super(taskService, mapper);
        this.taskService = taskService;
    }

    @Override
    protected Specification<Task> buildSpecification(Map<String, String> criteria) {
        SpecificationBuilder<Task> builder = new SpecificationBuilder<>();

        if (criteria.containsKey("status")) {
            builder.withEqual("status", criteria.get("status"));
        }

        return builder.build();
    }

    // Custom endpoint
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> findByStatus(
        @PathVariable TaskStatus status
    ) {
        List<Task> tasks = taskService.findByStatus(status);
        List<TaskResponse> responses = tasks.stream()
            .map(mapper::toResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
```

**Notice (v2.0):**
- Extends `AbstractEnterpriseController` with **4 generic parameters**: Entity, ID, Request DTO, Response DTO
- Constructor requires: **service** and **mapper** (for Entity ↔ DTO conversion)
- Must implement `buildSpecification()` for search functionality
- All responses wrapped in `ApiResponse<T>` with success/error structure
- Standard CRUD endpoints inherited:
  - `POST /api/v1/tasks` - Create (returns HTTP 201)
  - `GET /api/v1/tasks/{id}` - Get by ID
  - `GET /api/v1/tasks` - List all with pagination
  - `PUT /api/v1/tasks/{id}` - Update
  - `PATCH /api/v1/tasks/{id}` - Partial update
  - `DELETE /api/v1/tasks/{id}` - Delete (soft or hard)
  - `GET /api/v1/tasks/search` - Search with criteria

### 4.5 DTOs and Mapper (New in v2.0)

The v2.0 framework uses **DTOs** (Data Transfer Objects) to separate API layer from domain layer.

**TaskRequest.java** - For incoming data:
```java
public record TaskRequest(
    String title,
    String description,
    TaskStatus status,
    LocalDate dueDate,
    Priority priority
) {}
```

**TaskResponse.java** - For outgoing data:
```java
public record TaskResponse(
    Long id,
    String title,
    String description,
    TaskStatus status,
    LocalDate dueDate,
    Priority priority,
    LocalDateTime createdAt,
    String createdBy
) {}
```

**TaskMapper.java** - Converts between Entity and DTOs:
```java
@Component
public class TaskMapper implements EntityMapper<Task, TaskRequest, TaskResponse> {

    @Override
    public Task toEntity(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setDueDate(request.dueDate());
        task.setPriority(request.priority());
        return task;
    }

    @Override
    public TaskResponse toResponse(Task entity) {
        return new TaskResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getStatus(),
            entity.getDueDate(),
            entity.getPriority(),
            entity.getCreatedAt(),
            entity.getCreatedBy()
        );
    }

    @Override
    public void updateEntity(Task entity, TaskRequest request) {
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setStatus(request.status());
        entity.setDueDate(request.dueDate());
        entity.setPriority(request.priority());
    }
}
```

**Why DTOs?**
- ✅ **Security** - Don't expose internal entity structure
- ✅ **Flexibility** - API can evolve independently from database
- ✅ **Validation** - Validate input separately from business logic
- ✅ **Documentation** - Clear API contracts

---

## Step 5: Setup the Development Environment

Now let's setup everything needed to run the application.

### 5.1 Setup Backend Dependencies

```bash
ent dev setup --backend
```

**What this does:**
- ✅ Checks that Java and Maven are installed
- ✅ Runs `mvn clean install` to download all dependencies
- ✅ Compiles the project

**Expected output:**
```
🔧 Development Environment Setup

📦 Backend Setup

✔ Java 17.0.8 found
✔ Maven 3.9.4 found
✔ Backend dependencies installed

✅ Development Environment Setup Complete!

   ✅ Backend ready
```

### 5.2 Start the Backend Server

```bash
ent dev start --backend
```

**What this does:**
- ✅ Starts Spring Boot with `mvn spring-boot:run`
- ✅ Runs in the background
- ✅ Saves process ID for later management

**Expected output:**
```
🚀 Starting Development Servers

✔ Backend server started
   ✅ Backend: http://localhost:8080
   PID: 12345
   Profile: dev

✅ Development servers started!

   To stop servers:  enterprise dev stop
   To view logs:     enterprise dev logs
```

### 5.3 Test the Backend API

Open your browser or use `curl`:

**Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

**Try the API:**

```bash
# List all tasks
curl http://localhost:8080/api/v1/tasks

# Create a task
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Enterprise CLI",
    "description": "Complete the getting started tutorial",
    "status": "IN_PROGRESS"
  }'

# List tasks again
curl http://localhost:8080/api/v1/tasks
```

**Success!** 🎉 Your backend is running!

---

## Step 6: Generate a React Frontend

Now let's create a frontend to interact with our backend.

### 6.1 Go to Parent Directory

```bash
cd ..
```

### 6.2 Generate React App

```bash
ent frontend create task-ui
```

### 6.3 Follow the Interactive Prompts

```
? UI Framework: Material-UI
? Build tool: Vite (Recommended)
? API base URL: http://localhost:8080/api/v1
? Authentication type: JWT (LocalStorage)
```

**For features, select:**
- [x] TypeScript
- [x] Redux Toolkit + RTK Query
- [x] React Router v6
- [x] React Hook Form
- [x] React Query (TanStack)
- [ ] Cypress E2E (deselect for now)
- [x] ESLint + Prettier
- [ ] Storybook (deselect for now)
- [ ] PWA Support

**Press Enter** to generate.

### 6.4 What Was Generated?

```
task-ui/
├── src/
│   ├── components/            ← React components
│   ├── pages/                 ← Page components
│   ├── store/                 ← Redux store
│   │   ├── slices/
│   │   └── api/taskApi.ts     ← API for tasks
│   ├── types/                 ← TypeScript types
│   ├── App.tsx                ← Main app
│   └── main.tsx               ← Entry point
├── package.json               ← NPM dependencies
├── tsconfig.json              ← TypeScript config
└── vite.config.ts             ← Vite config
```

---

## Step 7: Run the Frontend

### 7.1 Navigate to Frontend

```bash
cd task-ui
```

### 7.2 Install Dependencies

```bash
npm install
```

### 7.3 Start the Dev Server

```bash
ent dev start --frontend
```

**Expected output:**
```
🚀 Starting Development Servers

✔ Frontend server started
   ✅ Frontend: http://localhost:3000
   PID: 12346

✅ Development servers started!
```

### 7.4 Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see your React application!

---

## Step 8: Make Your First Change

Let's customize the Task entity.

### 8.1 Add a New Field

Go back to the backend project:

```bash
cd ../task-service
```

Open `src/main/java/com/company/task/entity/Task.java` and add:

```java
@Column
private LocalDate dueDate;

@Column
private Priority priority;

// Add getter and setter
public LocalDate getDueDate() {
    return dueDate;
}

public void setDueDate(LocalDate dueDate) {
    this.dueDate = dueDate;
}

public Priority getPriority() {
    return priority;
}

public void setPriority(Priority priority) {
    this.priority = priority;
}
```

Create the Priority enum:

```java
package com.company.task.entity;

public enum Priority {
    LOW, MEDIUM, HIGH, URGENT
}
```

### 8.2 Restart the Backend

```bash
ent dev stop
ent dev start --backend
```

### 8.3 Test the New Field

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Task",
    "description": "This has a priority",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-10-15"
  }'
```

**Success!** You've customized your first entity! 🎊

---

## Step 9: View Logs and Stop Servers

### 9.1 View Backend Logs

```bash
ent dev logs --backend
```

This shows the last 50 lines of the backend log.

### 9.2 View Frontend Logs

```bash
ent dev logs --frontend
```

### 9.3 Stop All Servers

```bash
ent dev stop
```

**Expected output:**
```
🛑 Stopping Development Servers

✔ backend stopped
✔ frontend stopped

✅ All development servers stopped
```

---

## Step 10: Build for Production

When you're ready to deploy:

### 10.1 Build Backend

```bash
cd task-service
mvn clean package
```

The JAR file will be in `target/task-service-1.0.0.jar`

### 10.2 Build Frontend

```bash
cd ../task-ui
ent frontend build
```

The production files will be in `dist/` directory.

---

## What You've Learned

Congratulations! 🎉 You've successfully:

✅ Installed Enterprise CLI
✅ Generated a Spring Boot microservice with Enterprise Framework
✅ Understood the generated code structure
✅ Generated a React application
✅ Set up your development environment
✅ Started backend and frontend servers
✅ Made customizations to the backend
✅ Tested APIs
✅ Managed development processes
✅ Built for production

---

## Common Commands Cheat Sheet

```bash
# Generate microservice
ent generate <service-name>

# Generate React app
ent frontend create <app-name>

# Setup environment
ent dev setup --backend --frontend

# Start servers
ent dev start --backend
ent dev start --frontend
ent dev start --full-stack

# Stop servers
ent dev stop

# View logs
ent dev logs

# Build frontend
ent frontend build

# Run frontend tests
ent frontend test
```

---

## Next Steps

Now that you've mastered the basics, try these next:

👉 **Build a Complete Application**
   Follow the [Full-Stack Tutorial](./TUTORIAL_FULL_STACK.md) to build a User Management System

👉 **Learn the Enterprise Framework**
   Read the [Enterprise Framework Guide](./ENTERPRISE_FRAMEWORK.md) to understand the base classes

👉 **Explore All Commands**
   Check the [Commands Reference](./COMMANDS_REFERENCE.md) for detailed options

👉 **Best Practices**
   Review [Best Practices](./BEST_PRACTICES.md) for production-ready code

---

## Need Help?

- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Command Reference:** [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)
- **GitHub Issues:** Report bugs and request features

---

**Happy Coding! 🚀**
