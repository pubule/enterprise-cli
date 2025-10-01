# Enterprise CLI Architecture

> Understanding the design and implementation of Enterprise CLI

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Command Architecture](#command-architecture)
- [Utility Modules](#utility-modules)
- [Template System](#template-system)
- [State Management](#state-management)
- [Cross-Platform Support](#cross-platform-support)
- [Design Principles](#design-principles)

---

## Overview

Enterprise CLI is built with a modular architecture that separates concerns into commands, utilities, and templates. The CLI uses industry-standard libraries and follows Node.js best practices for command-line tool development.

```
┌─────────────────────────────────────────────────────────────┐
│                    Enterprise CLI                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Commands   │  │  Utilities   │  │  Templates   │    │
│  │              │  │              │  │              │    │
│  │  generate    │  │  validation  │  │  microservice│    │
│  │  frontend    │  │  file-gen    │  │  react       │    │
│  │  dev         │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                            │                                │
│                    ┌───────▼────────┐                      │
│                    │  Commander.js  │                      │
│                    │   Framework    │                      │
│                    └────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
enterprise-cli/
├── bin/
│   └── enterprise-cli.js              # CLI entry point
│
├── src/
│   ├── commands/                      # Command implementations
│   │   ├── generate.js                # Backend generation
│   │   ├── frontend.js                # Frontend management
│   │   └── dev.js                     # Dev environment
│   │
│   └── utils/                         # Shared utilities
│       ├── validation.js              # Input validation & transformation
│       └── file-generator.js          # Template processing
│
├── templates/                         # Project templates
│   ├── microservice-skeleton/         # Spring Boot template
│   └── react-skeleton/                # React template
│
├── doc/                               # Documentation
│   └── *.md                           # Documentation files
│
├── package.json                       # NPM package configuration
└── .enterprise-cli/                   # Runtime state (user projects)
    └── pids.json                      # Process tracking
```

### Key Directories

**`bin/`** - Executable entry point
- Contains the main CLI script with shebang
- Registers all commands and subcommands
- Displays ASCII banner
- Routes commands to implementations

**`src/commands/`** - Command modules
- Each file exports one or more command functions
- Commands are self-contained and modular
- Use utilities for common functionality

**`src/utils/`** - Utility modules
- Shared code used across commands
- Validation, transformation, file operations
- Pure functions without side effects

**`templates/`** - Project templates
- Mustache-based templates
- Support variable interpolation in content and filenames
- Organized by project type

**`.enterprise-cli/`** - Runtime state directory
- Created in user project directories
- Stores process IDs for dev servers
- Managed by `dev` command

---

## Command Architecture

Enterprise CLI uses [Commander.js](https://github.com/tj/commander.js) for command parsing and routing.

### Command Hierarchy

```
enterprise-cli
│
├── init                    (not yet implemented)
│
├── generate [service]      Main microservice generator
│   ├── Options:
│   ├── --domain <domain>
│   ├── --entities <entities>
│   └── --database <db>
│
├── frontend                Frontend management group
│   ├── create [app]        Create React app
│   ├── build               Build for production
│   └── test                Run tests
│
└── dev                     Development environment group
    ├── setup               Setup dependencies
    ├── start               Start dev servers
    ├── stop                Stop dev servers
    └── logs                Show logs
```

### Command Implementation Pattern

Each command follows this structure:

```javascript
// src/commands/example.js

// 1. Imports
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const validation = require('../utils/validation');
const { generateFromTemplate } = require('../utils/file-generator');

// 2. Helper functions
function validateInputs(answers) {
  // Validation logic
}

function buildTemplateVars(answers) {
  // Build variables for templates
}

// 3. Interactive prompts
async function getInteractiveAnswers(cliArgs, cliOptions) {
  // Inquirer prompts for missing parameters
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input) => validation.isValidServiceName(input)
    }
  ];

  return await inquirer.prompt(questions);
}

// 4. Main command function
async function mainCommand(args, options) {
  try {
    // Get complete answers (CLI + interactive)
    const answers = await getInteractiveAnswers(args, options);

    // Validate
    const spinner = ora('Validating...').start();
    const validation = validateInputs(answers);
    if (!validation.valid) {
      spinner.fail('Validation failed');
      // Show errors
      process.exit(1);
    }
    spinner.succeed('Validation passed');

    // Build template variables
    const templateVars = buildTemplateVars(answers);

    // Generate from template
    await generateFromTemplate('template-name', outputPath, templateVars);

    // Show success message
    console.log(chalk.green('✅ Success!'));

  } catch (error) {
    console.log(chalk.red(`❌ Failed: ${error.message}`));
    process.exit(1);
  }
}

// 5. Export
module.exports = {
  mainCommand
};
```

### Registration in `bin/enterprise-cli.js`

```javascript
const { mainCommand } = require('../src/commands/example');

program
  .command('example')
  .description('Example command')
  .argument('[name]', 'Optional name argument')
  .option('-o, --option <value>', 'Example option')
  .action(mainCommand);
```

---

## Utility Modules

### validation.js

Provides input validation and string transformation functions.

**Validation Functions:**
- `isValidServiceName(name)` - Kebab-case, 2-50 chars
- `isValidJavaPackage(pkg)` - Java package format
- `isValidJavaIdentifier(id)` - Java identifier rules
- `isValidJavaClassName(name)` - PascalCase validation

**Transformation Functions:**
- `toPascalCase(str)` - Convert to PascalCase
- `toCamelCase(str)` - Convert to camelCase
- `toKebabCase(str)` - Convert to kebab-case
- `toSnakeCase(str)` - Convert to snake_case
- `toConstantCase(str)` - Convert to CONSTANT_CASE
- `capitalizeFirst(str)` - Capitalize first letter

**Usage Example:**
```javascript
const validation = require('../utils/validation');

// Validation
if (!validation.isValidServiceName('user-service')) {
  console.log('Invalid service name');
}

// Transformation
const className = validation.toPascalCase('user-service'); // "UserService"
const packagePath = 'com.company.user'.replace(/\./g, '/'); // "com/company/user"
```

### file-generator.js

Handles template processing and file generation using Mustache.

**Main Functions:**
- `generateFromTemplate(templateName, outputPath, variables)` - Generate files from template
- `generateFromTemplateWithProgress(...)` - With progress callback
- `processPath(pathStr, variables)` - Process {{variables}} in paths
- `ensureDirectory(dirPath)` - Create directory structure
- `templateExists(templateName, templatesDir)` - Check template existence

**Template Processing Flow:**
```
┌──────────────┐
│   Template   │
│   Directory  │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│   globby     │─────▶│ Find all     │
│   scan       │      │ files        │
└──────────────┘      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  For each    │
                      │  file:       │
                      └──────┬───────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Process    │      │   Mustache   │     │   Process    │
│   filename   │      │   render     │     │   output     │
│   variables  │      │   content    │     │   path       │
└──────┬───────┘      └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Write file  │
                      │  to output   │
                      └──────────────┘
```

**Usage Example:**
```javascript
const { generateFromTemplate } = require('../utils/file-generator');

const templateVars = {
  serviceName: 'user-service',
  packageName: 'com.company.user',
  entities: [
    { name: 'User', tableName: 'users' },
    { name: 'Role', tableName: 'roles' }
  ],
  hasAuth: true,
  hasDocker: true
};

await generateFromTemplate(
  'microservice-skeleton',
  './user-service',
  templateVars
);
```

---

## Template System

Templates use [Mustache](https://mustache.github.io/) for variable interpolation.

### Template Structure

```
templates/microservice-skeleton/
├── src/main/java/{{packagePath}}/
│   ├── {{domainTitleCase}}ServiceApplication.java
│   ├── entity/
│   │   └── {{#entities}}
│   │       {{name}}.java
│   │       {{/entities}}
│   ├── repository/
│   │   └── {{#entities}}
│   │       {{name}}Repository.java
│   │       {{/entities}}
│   └── ...
├── pom.xml
└── docker-compose.yml
```

### Mustache Syntax

**Variables:**
```mustache
{{serviceName}}          → Simple variable
{{packagePath}}          → Nested path
{{{rawHtml}}}           → Unescaped (rarely used)
```

**Conditionals:**
```mustache
{{#hasAuth}}
// OAuth2 configuration
{{/hasAuth}}

{{^hasAuth}}
// No authentication
{{/hasAuth}}
```

**Lists:**
```mustache
{{#entities}}
public class {{name}} {
    // Entity for {{tableName}}
}
{{/entities}}
```

**Filename Variables:**
```
{{domainTitleCase}}ServiceApplication.java
→ UserServiceApplication.java (if domainTitleCase = "User")
```

### Template Variables Contract

When calling `generateFromTemplate`, provide these variables:

**Backend Template (microservice-skeleton):**
```javascript
{
  serviceName: 'user-service',
  domain: 'user',
  domainTitleCase: 'User',
  packageName: 'com.company.user',
  packagePath: 'com/company/user',
  frameworkPackage: 'com.company.user.enterprise.framework',
  frameworkPackagePath: 'com/company/user/enterprise/framework',

  entities: [
    {
      name: 'User',              // PascalCase
      nameCamelCase: 'user',
      tableName: 'users'
    }
  ],

  database: 'postgresql',
  databaseDriverClass: 'org.postgresql.Driver',
  databaseUrl: 'jdbc:postgresql://localhost:5432/user_service',
  databaseDialect: 'org.hibernate.dialect.PostgreSQLDialect',

  // Feature flags
  hasCoreFramework: true,
  hasAuth: true,
  hasCamel: true,
  hasDocker: true,
  hasKubernetes: true,
  // ... more flags

  frameworkVersion: '1.0.0',
  year: 2025
}
```

**Frontend Template (react-skeleton):**
```javascript
{
  appName: 'user-admin-ui',
  appNamePascalCase: 'UserAdminUi',
  appNameCamelCase: 'userAdminUi',

  uiFramework: 'material-ui',
  buildTool: 'vite',
  apiBaseUrl: 'http://localhost:8080/api/v1',
  authType: 'jwt-local',

  // Feature flags
  hasTypeScript: true,
  hasRedux: true,
  hasRouter: true,
  hasReactHookForm: true,
  hasCypress: true,
  // ... more flags

  // UI Framework flags
  isMaterialUI: true,
  isAntDesign: false,
  isChakraUI: false,

  // Build tool flags
  isVite: true,
  isCRA: false,

  // Auth flags
  isJWTLocal: true,
  isOAuth2: false,
  hasAuth: true,

  fileExt: 'tsx',
  scriptExt: 'ts',
  year: 2025
}
```

---

## State Management

The `.enterprise-cli/` directory stores runtime state for development commands.

### PID Management

When `ent dev start` runs, process IDs are saved for later management.

**`.enterprise-cli/pids.json` structure:**
```json
{
  "backend": {
    "pid": 12345,
    "startedAt": "2025-10-01T23:30:00.000Z"
  },
  "frontend": {
    "pid": 12346,
    "startedAt": "2025-10-01T23:30:05.000Z"
  }
}
```

**Operations:**
- `savePid(serviceName, pid)` - Save process PID
- `loadPids()` - Load all PIDs
- `clearPids()` - Clear all PIDs
- `isProcessRunning(pid)` - Check if running
- `killProcess(pid, signal)` - Terminate process

---

## Cross-Platform Support

Enterprise CLI works on Windows, Linux, and macOS.

### Platform Detection

```javascript
const isWindows = process.platform === 'win32';
const mvnCmd = isWindows ? 'mvn.cmd' : 'mvn';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
```

### Process Management

**Windows:**
- `tasklist /FI "PID eq 12345"` - Check if running
- `taskkill /PID 12345 /T` - Terminate
- `taskkill /PID 12345 /F /T` - Force terminate

**Unix (Linux/macOS):**
- `process.kill(pid, 0)` - Check if running
- `process.kill(pid, 'SIGTERM')` - Graceful shutdown
- `process.kill(pid, 'SIGKILL')` - Force kill

### Path Handling

Always use `path.join()` for cross-platform paths:
```javascript
const filePath = path.join(process.cwd(), 'src', 'main', 'java');
// Works on all platforms
```

---

## Design Principles

### 1. **Separation of Concerns**
- Commands handle user interaction
- Utilities provide pure functions
- Templates contain no logic

### 2. **Fail Fast**
- Validate inputs early
- Check dependencies before processing
- Exit with clear error messages

### 3. **Progressive Enhancement**
- Smart defaults for common cases
- Interactive prompts for missing parameters
- CLI options for automation

### 4. **User Experience**
- Spinner feedback for long operations
- Color-coded output
- Clear success/error messages
- Helpful next steps

### 5. **Idempotency**
- Safe to run multiple times
- Check state before operations
- No destructive actions without confirmation

### 6. **Modularity**
- Commands are self-contained
- Easy to add new commands
- Template-based generation

---

## Extension Points

### Adding a New Command

1. Create `src/commands/my-command.js`
2. Implement command logic
3. Export command function
4. Register in `bin/enterprise-cli.js`

### Adding a New Template

1. Create `templates/my-template/`
2. Add Mustache files
3. Use `{{variables}}` for interpolation
4. Call `generateFromTemplate('my-template', ...)`

### Adding New Utilities

1. Create `src/utils/my-util.js`
2. Export pure functions
3. Document with JSDoc
4. Use in commands as needed

---

## Performance Considerations

- **Template Scanning:** Uses `globby` for efficient file discovery
- **Parallel Operations:** Independent tasks run concurrently
- **Lazy Loading:** Commands loaded only when needed
- **Caching:** Template metadata cached during generation

---

## Security Considerations

- **Input Validation:** All user inputs validated before use
- **Path Traversal:** Prevented by validating paths
- **Command Injection:** Use `spawn` with array args, never shell strings
- **Sensitive Data:** Never log passwords or tokens

---

## Next Steps

- [Commands Reference](./COMMANDS_REFERENCE.md) - Learn all available commands
- [Contributing Guide](./CONTRIBUTING.md) - Add your own commands
