/**
 * Enterprise CLI Constants
 * Centralized constants to avoid magic numbers and strings
 */

module.exports = {
  // ═══════════════════════════════════════════════════════
  // PORTS
  // ═══════════════════════════════════════════════════════
  PORTS: {
    BACKEND: 8080,
    FRONTEND: 3000,
    POSTGRES: 5432,
    MYSQL: 3306,
    MONGO: 27017
  },

  // ═══════════════════════════════════════════════════════
  // TIMEOUTS (milliseconds)
  // ═══════════════════════════════════════════════════════
  TIMEOUTS: {
    SHORT: 5000,           // 5 seconds
    DEFAULT: 30000,        // 30 seconds
    LONG: 60000,           // 1 minute
    VERY_LONG: 120000      // 2 minutes
  },

  // ═══════════════════════════════════════════════════════
  // STRING LIMITS
  // ═══════════════════════════════════════════════════════
  LIMITS: {
    SERVICE_NAME_MIN: 2,
    SERVICE_NAME_MAX: 50,
    PACKAGE_NAME_MAX: 100,
    DESCRIPTION_MAX: 500,
    TEXT_MAX: 1000
  },

  // ═══════════════════════════════════════════════════════
  // EXIT CODES
  // ═══════════════════════════════════════════════════════
  EXIT_CODES: {
    SUCCESS: 0,
    ERROR: 1
  },

  // ═══════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════
  COMMANDS: {
    INIT: 'init',
    STATUS: 'status',
    GENERATE: 'generate',
    FRONTEND: 'frontend',
    DEV: 'dev'
  },

  // ═══════════════════════════════════════════════════════
  // FILE EXTENSIONS
  // ═══════════════════════════════════════════════════════
  EXTENSIONS: {
    JS: '.js',
    JAVA: '.java',
    YML: '.yml',
    YAML: '.yaml',
    MD: '.md',
    JSON: '.json',
    XML: '.xml',
    SQL: '.sql',
    SH: '.sh',
    BAT: '.bat'
  },

  // ═══════════════════════════════════════════════════════
  // DIRECTORY NAMES
  // ═══════════════════════════════════════════════════════
  DIRS: {
    SRC: 'src',
    BIN: 'bin',
    TEMPLATES: 'templates',
    DOC: 'doc',
    NODE_MODULES: 'node_modules',
    WORKSPACE: '.enterprise',
    CUSTOM_TEMPLATES: 'templates/custom'
  },

  // ═══════════════════════════════════════════════════════
  // FILE NAMES
  // ═══════════════════════════════════════════════════════
  FILES: {
    PACKAGE_JSON: 'package.json',
    POM_XML: 'pom.xml',
    DOCKER_COMPOSE: 'docker-compose.yml',
    DOCKERFILE: 'Dockerfile',
    GITIGNORE: '.gitignore',
    README: 'README.md',
    ENTERPRISERC: '.enterpriserc'
  },

  // ═══════════════════════════════════════════════════════
  // UI SYMBOLS (Emoji)
  // ═══════════════════════════════════════════════════════
  SYMBOLS: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    ROCKET: '🚀',
    PACKAGE: '📦',
    BUILDING: '🏗️',
    TOOLS: '🔧',
    INFO: 'ℹ️',
    CHECKMARK: '✓',
    CROSS: '✗'
  },

  // ═══════════════════════════════════════════════════════
  // BOX DRAWING CHARACTERS
  // ═══════════════════════════════════════════════════════
  BOX: {
    // Single line
    HORIZONTAL: '─',
    VERTICAL: '│',
    TOP_LEFT: '┌',
    TOP_RIGHT: '┐',
    BOTTOM_LEFT: '└',
    BOTTOM_RIGHT: '┘',

    // Double line
    DOUBLE_HORIZONTAL: '═',
    DOUBLE_VERTICAL: '║',
    DOUBLE_TOP_LEFT: '╔',
    DOUBLE_TOP_RIGHT: '╗',
    DOUBLE_BOTTOM_LEFT: '╚',
    DOUBLE_BOTTOM_RIGHT: '╝'
  },

  // ═══════════════════════════════════════════════════════
  // SEPARATOR LENGTHS
  // ═══════════════════════════════════════════════════════
  SEPARATOR_LENGTHS: {
    SHORT: 40,
    MEDIUM: 65,
    LONG: 80,
    VERY_LONG: 100
  },

  // ═══════════════════════════════════════════════════════
  // DATABASE OPTIONS
  // ═══════════════════════════════════════════════════════
  DATABASES: {
    POSTGRESQL: 'postgresql',
    MYSQL: 'mysql',
    H2: 'h2'
  },

  // ═══════════════════════════════════════════════════════
  // UI FRAMEWORKS
  // ═══════════════════════════════════════════════════════
  UI_FRAMEWORKS: {
    MATERIAL_UI: 'material-ui',
    ANT_DESIGN: 'ant-design',
    CHAKRA_UI: 'chakra-ui',
    NONE: 'none'
  },

  // ═══════════════════════════════════════════════════════
  // BUILD TOOLS
  // ═══════════════════════════════════════════════════════
  BUILD_TOOLS: {
    VITE: 'vite',
    WEBPACK: 'webpack',
    CRA: 'cra'
  },

  // ═══════════════════════════════════════════════════════
  // SPRING PROFILES
  // ═══════════════════════════════════════════════════════
  PROFILES: {
    DEV: 'dev',
    PROD: 'prod',
    TEST: 'test'
  },

  // ═══════════════════════════════════════════════════════
  // NPM SCRIPT NAMES
  // ═══════════════════════════════════════════════════════
  NPM_SCRIPTS: {
    START: 'start',
    DEV: 'dev',
    BUILD: 'build',
    TEST: 'test'
  },

  // ═══════════════════════════════════════════════════════
  // SHELL COMMANDS
  // ═══════════════════════════════════════════════════════
  SHELL_COMMANDS: {
    JAVA: 'java',
    MVN: 'mvn',
    NODE: 'node',
    NPM: 'npm',
    DOCKER: 'docker',
    DOCKER_COMPOSE: 'docker-compose',
    KUBECTL: 'kubectl'
  },

  // ═══════════════════════════════════════════════════════
  // COMMAND LINE FLAGS
  // ═══════════════════════════════════════════════════════
  FLAGS: {
    VERSION: '--version',
    HELP: '--help',
    VERBOSE: '--verbose',
    QUIET: '--quiet'
  },

  // ═══════════════════════════════════════════════════════
  // URLs
  // ═══════════════════════════════════════════════════════
  URLS: {
    LOCALHOST_BACKEND: 'http://localhost:8080',
    LOCALHOST_FRONTEND: 'http://localhost:3000',
    LOCALHOST_API_V1: 'http://localhost:8080/api/v1'
  },

  // ═══════════════════════════════════════════════════════
  // MESSAGES - Success
  // ═══════════════════════════════════════════════════════
  MESSAGES: {
    SUCCESS: {
      WORKSPACE_INITIALIZED: 'Enterprise CLI workspace initialized!',
      READY_TO_GENERATE: 'Ready to generate microservices with Enterprise Framework foundation.',
      MICROSERVICE_GENERATED: 'Microservice generated with Enterprise Framework!',
      REACT_APP_CREATED: 'React application created successfully!',
      SETUP_COMPLETE: 'Development Environment Setup Complete!',
      SERVERS_STARTED: 'Development servers started!',
      SERVERS_STOPPED: 'All development servers stopped',
      BUILD_READY: 'Production build ready!',
      TESTS_COMPLETED: 'Tests completed successfully!',
      BACKEND_READY: 'Backend ready',
      FRONTEND_READY: 'Frontend ready',
      DOCKER_READY: 'Docker services running'
    },

    ERROR: {
      WORKSPACE_INIT_FAILED: 'Failed to initialize workspace',
      GENERATION_FAILED: 'Generation failed',
      BUILD_FAILED: 'Build failed',
      TESTS_FAILED: 'Tests failed',
      SETUP_FAILED: 'Setup failed',
      START_FAILED: 'Failed to start servers',
      STOP_FAILED: 'Failed to stop servers',
      LOGS_FAILED: 'Failed to show logs',
      JAVA_REQUIRED: 'Java is required for backend development',
      MAVEN_REQUIRED: 'Maven is required for backend development',
      NODE_REQUIRED: 'Node.js is required for frontend development',
      NPM_REQUIRED: 'NPM is required for frontend development',
      DOCKER_REQUIRED: 'Docker is required for containerized services',
      DOCKER_COMPOSE_REQUIRED: 'Docker Compose is required',
      PACKAGE_JSON_NOT_FOUND: 'package.json not found in current directory',
      POM_XML_NOT_FOUND: 'No pom.xml found in current directory',
      DOCKER_COMPOSE_NOT_FOUND: 'No docker-compose.yml found in current directory',
      NOT_REACT_PROJECT: 'This does not appear to be a React project',
      NO_TEST_SCRIPT: 'No test script found in package.json',
      NO_DEV_SCRIPT: 'No dev or start script found in package.json',
      COMMAND_NOT_IMPLEMENTED: 'Command not yet implemented'
    },

    WARNING: {
      NO_SERVERS_RUNNING: 'No development servers are running',
      NO_SERVERS_STARTED: 'No servers were started',
      NO_LOG_FILES: 'No log files found',
      BACKEND_LOG_NOT_FOUND: 'Backend log file not found',
      FRONTEND_LOG_NOT_FOUND: 'Frontend log file not found',
      NO_POM_XML: 'No pom.xml found - skipping backend',
      NO_PACKAGE_JSON: 'No package.json found - skipping frontend',
      FOLLOW_NOT_IMPLEMENTED: 'Live log following not yet implemented',
      INVALID_API_URL: 'API base URL must be a valid HTTP/HTTPS URL',
      COULD_NOT_READ_PIDS: 'Could not read PIDs file'
    },

    INFO: {
      FRAMEWORK_LOCATION: 'Framework Location:',
      CONFIGURATION: 'Configuration:',
      CREATED: 'Created:',
      NEXT_STEPS: 'Next steps:'
    },

    HEADERS: {
      ENTERPRISE_MICROSERVICE_GENERATOR: 'Enterprise Microservice Generator',
      DEV_ENV_SETUP: 'Development Environment Setup',
      STARTING_DEV_SERVERS: 'Starting Development Servers',
      BACKEND_SETUP: 'Backend Setup',
      FRONTEND_SETUP: 'Frontend Setup',
      DOCKER_SETUP: 'Docker Setup',
      CLI_INFORMATION: 'CLI Information',
      WORKSPACE_STATUS: 'Workspace Status',
      ENVIRONMENT: 'Environment',
      AVAILABLE_COMMANDS: 'Available Commands'
    }
  }
};
