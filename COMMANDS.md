# Enterprise CLI Commands Reference

📚 **Complete reference guide for all Enterprise CLI commands, options, and usage patterns.**

## Table of Contents

- [Command Syntax](#command-syntax)
- [Core Commands](#core-commands)
- [Development Commands](#development-commands)
- [Testing Commands](#testing-commands)
- [Deployment Commands](#deployment-commands)
- [Utility Commands](#utility-commands)
- [Configuration](#configuration)
- [Exit Codes](#exit-codes)

## Command Syntax

```bash
ent <command> [subcommand] [options] [arguments]
```

### Global Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--help` | `-h` | Show help information | - |
| `--version` | `-v` | Show CLI version | - |
| `--verbose` | `-V` | Enable verbose logging | `false` |
| `--quiet` | `-q` | Suppress non-error output | `false` |
| `--config` | `-c` | Specify config file path | `.enterprise/config.json` |
| `--dry-run` | `-n` | Show what would be done without executing | `false` |
| `--force` | `-f` | Force operation, skip confirmations | `false` |

---

## Core Commands

### `ent generate`

Generate a complete Spring Boot microservice with enterprise patterns.

#### Syntax
```bash
ent generate [service-name] [options]
```

#### Interactive Mode
```bash
ent generate
# Prompts you through service configuration
```

#### Options

| Option | Type | Description | Default | Required |
|--------|------|-------------|---------|----------|
| `--service-name` | `string` | Name of the microservice | - | Yes (if not provided as argument) |
| `--domain` | `string` | Business domain for the service | Derived from service name | No |
| `--package` | `string` | Java package name | `com.company.{domain}` | No |
| `--entities` | `string[]` | Comma-separated list of entities to generate | `[]` | No |
| `--database` | `enum` | Database type: `postgresql`, `mysql`, `h2`, `mongodb` | `postgresql` | No |
| `--port` | `number` | Service port number | Auto-assigned | No |
| `--java-version` | `enum` | Java version: `17`, `21` | `17` | No |
| `--spring-version` | `string` | Spring Boot version | `3.2.0` | No |

#### Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--auth` | Include OAuth2/JWT authentication | `true` |
| `--camel` | Include Apache Camel integration | `true` |
| `--docker` | Generate Docker configuration | `true` |
| `--k8s` | Generate Kubernetes manifests | `true` |
| `--monitoring` | Include monitoring setup (Actuator, Micrometer) | `true` |
| `--testing` | Include comprehensive test suite | `true` |
| `--api-docs` | Generate OpenAPI documentation | `true` |
| `--security-headers` | Include security headers configuration | `true` |
| `--cors` | Enable CORS configuration | `true` |
| `--rate-limiting` | Include rate limiting configuration | `true` |
| `--caching` | Include caching configuration (Redis) | `false` |
| `--messaging` | Include messaging configuration (RabbitMQ/Kafka) | `false` |

#### Examples

##### Basic Microservice
```bash
ent generate user-service \
  --domain user \
  --package com.bookstore.user \
  --entities User,Profile,Address
```

##### Full Enterprise Service
```bash
ent generate order-service \
  --domain order \
  --package com.bookstore.order \
  --entities Order,OrderItem,Payment \
  --database postgresql \
  --port 8081 \
  --auth \
  --camel \
  --docker \
  --k8s \
  --monitoring \
  --caching \
  --messaging
```

##### Minimal Service (No Auth, No Integration)
```bash
ent generate catalog-service \
  --domain catalog \
  --entities Product,Category \
  --no-auth \
  --no-camel \
  --no-docker
```

#### Generated Structure
```
{service-name}/
├── src/main/java/com/{package}/
│   ├── {ServiceName}Application.java
│   ├── config/
│   ├── controller/
│   ├── service/
│   ├── domain/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── integration/
│   └── exception/
├── src/test/java/
├── src/main/resources/
├── k8s/
├── docker-compose.yml
├── Dockerfile
├── pom.xml
└── README.md
```

---

### `ent frontend`

Generate a React application with enterprise UI frameworks and patterns.

#### Syntax
```bash
ent frontend create <app-name> [options]
ent frontend generate-crud <entity> [options]
ent frontend generate-form <form-name> [options]
```

#### Subcommands

##### `create` - Create New React Application

```bash
ent frontend create bookstore-web \
  --template material-ui \
  --typescript \
  --redux \
  --router \
  --testing
```

**Options:**

| Option | Type | Description | Default | Choices |
|--------|------|-------------|---------|---------|
| `--template` | `enum` | UI framework template | `material-ui` | `material-ui`, `ant-design`, `chakra-ui`, `bootstrap` |
| `--build-tool` | `enum` | Build tool | `vite` | `vite`, `webpack`, `create-react-app` |
| `--typescript` | `boolean` | Use TypeScript | `true` | - |
| `--redux` | `boolean` | Include Redux Toolkit | `true` | - |
| `--router` | `boolean` | Include React Router | `true` | - |
| `--testing` | `boolean` | Include testing setup | `true` | - |
| `--pwa` | `boolean` | Progressive Web App features | `false` | - |
| `--i18n` | `boolean` | Internationalization support | `false` | - |
| `--theme` | `enum` | Theme variant | `light` | `light`, `dark`, `auto` |

**Authentication Options:**

| Option | Type | Description | Default | Choices |
|--------|------|-------------|---------|---------|
| `--auth-method` | `enum` | Authentication method | `jwt` | `jwt`, `oauth2`, `session` |
| `--auth-providers` | `string[]` | OAuth providers | `[]` | `google`, `github`, `microsoft`, `facebook` |

**Features:**

| Flag | Description | Default |
|------|-------------|---------|
| `--forms` | Include form handling (React Hook Form + Yup) | `true` |
| `--charts` | Include charting library | `false` |
| `--tables` | Include data table components | `true` |
| `--calendar` | Include calendar components | `false` |
| `--maps` | Include map components | `false` |
| `--editor` | Include rich text editor | `false` |
| `--file-upload` | Include file upload components | `true` |

##### `generate-crud` - Generate CRUD Components

```bash
ent frontend generate-crud Product \
  --service product-service \
  --fields title,price,description,category \
  --validations \
  --pagination \
  --filtering
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--service` | `string` | Backend service name | Required |
| `--fields` | `string[]` | Entity fields to include | All fields |
| `--validations` | `boolean` | Include form validation | `true` |
| `--pagination` | `boolean` | Include pagination | `true` |
| `--filtering` | `boolean` | Include filtering | `true` |
| `--sorting` | `boolean` | Include sorting | `true` |
| `--search` | `boolean` | Include search functionality | `true` |

##### `generate-form` - Generate Complex Forms

```bash
ent frontend generate-form ProductForm \
  --fields title,isbn,price,description,images \
  --validation \
  --multi-step \
  --file-upload
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--fields` | `string[]` | Form fields | Required |
| `--validation` | `boolean` | Include validation schema | `true` |
| `--multi-step` | `boolean` | Multi-step form wizard | `false` |
| `--file-upload` | `boolean` | Include file upload | `false` |
| `--conditional` | `boolean` | Conditional field display | `false` |
| `--auto-save` | `boolean` | Auto-save draft functionality | `false` |

#### Generated Frontend Structure
```
{app-name}/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── forms/
│   ├── pages/
│   ├── store/
│   │   ├── api/
│   │   └── slices/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── styles/
├── cypress/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Development Commands

### `ent dev`

Manage development environment and processes.

#### Subcommands

##### `setup` - Initialize Development Environment

```bash
ent dev setup [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--backend` | `boolean` | Setup backend only | `false` |
| `--frontend` | `boolean` | Setup frontend only | `false` |
| `--full-stack` | `boolean` | Setup both backend and frontend | `true` |
| `--docker` | `boolean` | Start Docker services | `true` |
| `--clean` | `boolean` | Clean previous setup | `false` |

**What it does:**
- Installs dependencies
- Sets up databases
- Configures environment variables
- Starts required Docker services
- Runs initial database migrations

##### `start` - Start Development Servers

```bash
ent dev start [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--backend` | `boolean` | Start backend only | `false` |
| `--frontend` | `boolean` | Start frontend only | `false` |
| `--full-stack` | `boolean` | Start both | `true` |
| `--debug` | `boolean` | Enable debug mode | `false` |
| `--profile` | `string` | Spring profile | `dev` |
| `--port` | `number` | Override default ports | - |
| `--hot-reload` | `boolean` | Enable hot reload | `true` |

**Examples:**
```bash
# Start everything
ent dev start --full-stack

# Start backend only with debug
ent dev start --backend --debug --profile dev

# Start frontend on custom port
ent dev start --frontend --port 3001
```

##### `stop` - Stop Development Servers

```bash
ent dev stop [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--all` | `boolean` | Stop all processes | `true` |
| `--docker` | `boolean` | Stop Docker services | `false` |
| `--clean` | `boolean` | Clean up temp files | `false` |

##### `logs` - View Development Logs

```bash
ent dev logs [service] [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--follow` | `-f` | Follow log output | `false` |
| `--tail` | `number` | Number of lines to show | `100` |
| `--level` | `enum` | Log level filter | `info` |
| `--service` | `string` | Specific service logs | All services |

**Examples:**
```bash
# Follow all logs
ent dev logs --follow

# Show last 50 lines of backend logs
ent dev logs backend --tail 50

# Follow error logs only
ent dev logs --follow --level error
```

##### `status` - Show Development Status

```bash
ent dev status
```

Shows:
- Running processes
- Service health
- Port usage
- Database connections
- Docker container status

---

## Testing Commands

### `ent test`

Run comprehensive test suites with coverage reporting.

#### Syntax
```bash
ent test [options]
```

#### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--backend` | `boolean` | Run backend tests only | `false` |
| `--frontend` | `boolean` | Run frontend tests only | `false` |
| `--unit` | `boolean` | Run unit tests only | `false` |
| `--integration` | `boolean` | Run integration tests only | `false` |
| `--e2e` | `boolean` | Run E2E tests only | `false` |
| `--coverage` | `boolean` | Generate coverage reports | `false` |
| `--watch` | `boolean` | Watch for changes | `false` |
| `--parallel` | `boolean` | Run tests in parallel | `true` |
| `--fail-fast` | `boolean` | Stop on first failure | `false` |

#### Test Categories

##### Backend Testing
```bash
# All backend tests with coverage
ent test --backend --coverage

# Unit tests only
ent test --backend --unit

# Integration tests with TestContainers
ent test --backend --integration

# Architecture tests
ent test --backend --architecture
```

##### Frontend Testing
```bash
# All frontend tests
ent test --frontend

# Component tests with coverage
ent test --frontend --unit --coverage

# E2E tests with Cypress
ent test --frontend --e2e

# Watch mode for development
ent test --frontend --watch
```

#### Coverage Thresholds

The CLI enforces minimum coverage thresholds:

| Test Type | Minimum Coverage |
|-----------|------------------|
| Backend Unit | 80% |
| Backend Integration | 70% |
| Frontend Unit | 80% |
| Frontend E2E | 60% |

#### Examples

```bash
# Run all tests with coverage
ent test --coverage

# Fast feedback loop during development
ent test --unit --watch --fail-fast

# CI/CD pipeline testing
ent test --parallel --coverage --fail-fast

# Performance testing
ent test --performance --load 100
```

---

## Deployment Commands

### `ent deploy`

Deploy applications to target environments.

#### Syntax
```bash
ent deploy [options]
```

#### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--environment` | `enum` | Target environment | `dev` |
| `--backend` | `boolean` | Deploy backend only | `false` |
| `--frontend` | `boolean` | Deploy frontend only | `false` |
| `--strategy` | `enum` | Deployment strategy | `rolling` |
| `--dry-run` | `boolean` | Show deployment plan | `false` |
| `--force` | `boolean` | Force deployment | `false` |
| `--rollback` | `boolean` | Rollback to previous version | `false` |

#### Environment Options

| Environment | Description | Infrastructure |
|-------------|-------------|----------------|
| `dev` | Development environment | Local Docker/Kubernetes |
| `staging` | Staging environment | Cloud staging cluster |
| `production` | Production environment | Production cluster |
| `local` | Local testing | Docker Compose |

#### Deployment Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `rolling` | Rolling update | Production deployments |
| `blue-green` | Blue-green deployment | Zero-downtime deployments |
| `canary` | Canary deployment | Gradual rollouts |
| `recreate` | Stop and recreate | Development environments |

#### Examples

```bash
# Deploy to staging
ent deploy --environment staging --dry-run
ent deploy --environment staging

# Production deployment with blue-green
ent deploy --environment production --strategy blue-green

# Deploy only backend
ent deploy --backend --environment production

# Rollback production deployment
ent deploy --environment production --rollback

# Local testing deployment
ent deploy --environment local --force
```

#### Pre-deployment Checks

The CLI runs these checks before deployment:

✅ **Tests passing** (all test suites)
✅ **Code quality** (linting, formatting)
✅ **Security scan** (dependency vulnerabilities)
✅ **Build success** (backend JAR, frontend bundle)
✅ **Infrastructure ready** (cluster connectivity)
✅ **Database migrations** (pending migrations)

---

## Utility Commands

### `ent init`

Initialize Enterprise CLI workspace.

```bash
ent init [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--full-stack` | `boolean` | Initialize for full-stack development | `true` |
| `--template` | `enum` | Workspace template | `enterprise` |
| `--git` | `boolean` | Initialize git repository | `true` |
| `--docker` | `boolean` | Setup Docker environment | `true` |

**What it creates:**
```
.enterprise/
├── config.json              # CLI configuration
├── templates/               # Custom templates
└── scripts/                 # Custom scripts

docker/
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── databases/               # Database initialization

.gitignore                   # Comprehensive gitignore
README.md                    # Project documentation
```

### `ent status`

Show workspace and project status.

```bash
ent status [options]
```

**Shows:**
- CLI version and configuration
- Project structure
- Running services
- Database connections
- Git status
- Recent deployments

### `ent config`

Manage CLI configuration.

```bash
ent config get <key>
ent config set <key> <value>
ent config list
ent config reset
```

**Examples:**
```bash
# View current configuration
ent config list

# Set default UI framework
ent config set frontend.default_template material-ui

# Set default database
ent config set backend.default_database postgresql

# Reset to defaults
ent config reset
```

### `ent validate`

Validate project structure and configuration.

```bash
ent validate [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--structure` | `boolean` | Validate project structure | `true` |
| `--config` | `boolean` | Validate configuration files | `true` |
| `--dependencies` | `boolean` | Check dependency versions | `true` |
| `--security` | `boolean` | Security vulnerability scan | `true` |

### `ent upgrade`

Upgrade CLI and project dependencies.

```bash
ent upgrade [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `--cli` | `boolean` | Upgrade CLI version | `true` |
| `--dependencies` | `boolean` | Upgrade project dependencies | `false` |
| `--templates` | `boolean` | Update code templates | `false` |
| `--interactive` | `boolean` | Interactive upgrade | `true` |

---

## Configuration

### Configuration File

The CLI uses `.enterprise/config.json` for workspace configuration:

```json
{
  "version": "1.0.0",
  "workspace": {
    "name": "bookstore-enterprise",
    "type": "full-stack",
    "created": "2024-01-15T10:30:00Z"
  },
  "backend": {
    "default_package": "com.bookstore",
    "default_database": "postgresql",
    "default_port": 8080,
    "java_version": "17",
    "spring_version": "3.2.0",
    "features": {
      "auth": true,
      "camel": true,
      "docker": true,
      "k8s": true,
      "monitoring": true
    }
  },
  "frontend": {
    "default_template": "material-ui",
    "default_build_tool": "vite",
    "typescript": true,
    "features": {
      "redux": true,
      "router": true,
      "testing": true,
      "pwa": false
    }
  },
  "development": {
    "auto_start": true,
    "hot_reload": true,
    "debug_mode": false,
    "port_range": [3000, 3100]
  },
  "deployment": {
    "default_environment": "dev",
    "default_strategy": "rolling",
    "pre_deploy_checks": true,
    "auto_rollback": true
  },
  "testing": {
    "coverage_threshold": 80,
    "parallel_execution": true,
    "fail_fast": false
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENT_CONFIG_PATH` | Configuration file path | `.enterprise/config.json` |
| `ENT_LOG_LEVEL` | Logging level | `info` |
| `ENT_TEMPLATE_PATH` | Custom templates path | `.enterprise/templates` |
| `ENT_DOCKER_REGISTRY` | Docker registry URL | `docker.io` |
| `ENT_K8S_NAMESPACE` | Kubernetes namespace | `default` |

---

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | Command completed successfully |
| `1` | General Error | Unknown or unexpected error |
| `2` | Invalid Arguments | Invalid command arguments or options |
| `3` | Configuration Error | Configuration file issues |
| `4` | Dependency Error | Missing or incompatible dependencies |
| `5` | Build Error | Build or compilation failure |
| `6` | Test Failure | Test execution failure |
| `7` | Deployment Error | Deployment failure |
| `8` | Network Error | Network connectivity issues |
| `9` | Permission Error | Insufficient permissions |
| `10` | Validation Error | Project validation failure |

---

## Command Aliases

For convenience, the CLI provides these aliases:

| Alias | Full Command |
|-------|--------------|
| `ent g` | `ent generate` |
| `ent f` | `ent frontend` |
| `ent d` | `ent dev` |
| `ent t` | `ent test` |
| `ent deploy` | `ent deploy` |
| `ent s` | `ent status` |

---

## Tips and Tricks

### 1. Tab Completion
Enable tab completion for better DX:
```bash
# Add to ~/.bashrc or ~/.zshrc
eval "$(ent completion bash)"  # or zsh
```

### 2. Command Chaining
Chain commands for complex workflows:
```bash
ent generate user-service --quick && \
ent frontend create user-app --template material-ui && \
ent dev setup --full-stack && \
ent dev start
```

### 3. Configuration Templates
Use configuration templates for consistent setups:
```bash
# Save current config as template
ent config export --template enterprise-web

# Use template for new projects
ent init --template enterprise-web
```

### 4. Custom Scripts
Add custom scripts to `.enterprise/scripts/`:
```bash
# .enterprise/scripts/deploy-staging.sh
#!/bin/bash
ent test --coverage --fail-fast && \
ent validate --security && \
ent deploy --environment staging
```

---

**Next**: [Enterprise Patterns](ENTERPRISE-PATTERNS.md) - Understanding what the CLI generates vs developer responsibilities