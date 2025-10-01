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

✅ **Enterprise Framework Integration**
- Base classes for entities, services, controllers, repositories
- Built-in audit logging, soft delete, validation
- Event publishing system
- Reduces boilerplate by 60-70%

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
  --entities User,Role,Permission \
  --database postgresql

# Setup and start development
cd user-service
ent dev setup
ent dev start --backend

# Backend is now running at http://localhost:8080
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
│   ├── enterprise/framework/          # Enterprise Framework
│   │   ├── entity/
│   │   │   └── AbstractEnterpriseEntity.java
│   │   ├── repository/
│   │   │   └── AbstractEnterpriseRepository.java
│   │   ├── service/
│   │   │   └── AbstractEnterpriseService.java
│   │   ├── controller/
│   │   │   └── AbstractEnterpriseController.java
│   │   └── validation/
│   │       └── BusinessValidator.java
│   ├── entity/                        # Your entities
│   │   └── User.java
│   ├── repository/                    # Your repositories
│   │   └── UserRepository.java
│   ├── service/                       # Your services
│   │   └── UserService.java
│   ├── controller/                    # Your REST controllers
│   │   └── UserController.java
│   └── UserServiceApplication.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                  # Flyway migrations
├── src/test/java/                     # Tests
├── docker-compose.yml                 # Docker setup
├── Dockerfile                         # Container image
├── k8s/                               # Kubernetes manifests
└── pom.xml                            # Maven configuration
```

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
