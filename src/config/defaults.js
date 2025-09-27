/**
 * Default configuration values for Enterprise CLI
 */

const defaults = {
  // Spring Boot defaults
  springBoot: {
    version: '3.2.0',
    javaVersion: '17',
    groupId: 'com.company',
    packaging: 'jar',
    dependencies: [
      'spring-boot-starter-web',
      'spring-boot-starter-data-jpa',
      'spring-boot-starter-security',
      'spring-boot-starter-validation',
      'spring-boot-starter-actuator',
      'spring-boot-starter-test'
    ],
    plugins: [
      'spring-boot-maven-plugin',
      'jacoco-maven-plugin'
    ]
  },

  // React defaults
  react: {
    version: '18.2.0',
    nodeVersion: '18',
    typescript: true,
    buildTool: 'vite', // vite, cra, webpack
    uiFramework: 'material-ui', // material-ui, ant-design, chakra-ui, none
    stateManagement: 'redux', // redux, zustand, context, none
    routing: 'react-router',
    testing: 'jest-rtl', // jest-rtl, vitest, none
    linting: 'eslint-prettier'
  },

  // Database defaults
  database: {
    type: 'postgresql',
    version: '15',
    port: 5432,
    connectionPool: {
      initial: 5,
      min: 5,
      max: 20
    }
  },

  // Security defaults
  security: {
    authType: 'jwt', // jwt, oauth2, session
    passwordEncoding: 'bcrypt',
    jwtExpiration: '24h',
    corsEnabled: true,
    csrfEnabled: false // Disabled for API-first applications
  },

  // Docker defaults
  docker: {
    baseImages: {
      java: 'eclipse-temurin:17-jre-alpine',
      node: 'node:18-alpine',
      nginx: 'nginx:alpine'
    },
    ports: {
      backend: 8080,
      frontend: 3000,
      database: 5432,
      redis: 6379
    }
  },

  // Testing defaults
  testing: {
    backend: {
      unitTests: true,
      integrationTests: true,
      architectureTests: true,
      coverage: {
        minimum: 80,
        excludes: ['**/config/**', '**/dto/**']
      }
    },
    frontend: {
      unitTests: true,
      e2eTests: true,
      coverage: {
        minimum: 80,
        excludes: ['**/*.stories.*', '**/index.*']
      }
    }
  },

  // Development environment defaults
  development: {
    hotReload: true,
    debugPort: 5005,
    profiles: ['dev'],
    logLevel: 'DEBUG',
    devtools: true
  },

  // Production defaults
  production: {
    profiles: ['prod'],
    logLevel: 'INFO',
    security: {
      httpsOnly: true,
      secureHeaders: true
    },
    monitoring: {
      healthChecks: true,
      metrics: true,
      logging: true
    }
  },

  // Apache Camel defaults
  camel: {
    version: '4.0.0',
    components: [
      'camel-http',
      'camel-jackson',
      'camel-jpa',
      'camel-timer'
    ],
    errorHandling: true,
    monitoring: true
  },

  // Monitoring defaults
  monitoring: {
    metrics: {
      enabled: true,
      endpoint: '/actuator/metrics',
      prometheus: true
    },
    health: {
      enabled: true,
      endpoint: '/actuator/health',
      details: 'when-authorized'
    },
    logging: {
      level: 'INFO',
      pattern: '%d{yyyy-MM-dd HH:mm:ss} - %msg%n',
      file: {
        enabled: true,
        path: './logs/application.log',
        maxSize: '10MB',
        maxFiles: 10
      }
    }
  },

  // File structure defaults
  structure: {
    backend: {
      basePackage: '{packageName}',
      packages: [
        'controller',
        'service',
        'repository',
        'entity',
        'dto',
        'config',
        'exception',
        'security'
      ],
      resources: [
        'application.yml',
        'application-dev.yml',
        'application-prod.yml',
        'db/migration'
      ]
    },
    frontend: {
      directories: [
        'src/components',
        'src/pages',
        'src/hooks',
        'src/services',
        'src/utils',
        'src/styles',
        'src/types',
        'public'
      ],
      configFiles: [
        'package.json',
        'tsconfig.json',
        '.eslintrc.js',
        '.prettierrc',
        'vite.config.ts'
      ]
    }
  },

  // Code generation templates
  templates: {
    backend: {
      entity: {
        auditing: true,
        validation: true,
        serialization: true
      },
      controller: {
        restApi: true,
        validation: true,
        errorHandling: true,
        documentation: true
      },
      service: {
        transactional: true,
        caching: false,
        async: false
      },
      repository: {
        jpa: true,
        customQueries: true,
        pagination: true
      }
    },
    frontend: {
      component: {
        typescript: true,
        props: true,
        styling: true,
        testing: true
      },
      page: {
        routing: true,
        stateManagement: true,
        apiIntegration: true,
        errorBoundary: true
      },
      hook: {
        typescript: true,
        memoization: true,
        cleanup: true
      }
    }
  },

  // API defaults
  api: {
    version: 'v1',
    baseUrl: '/api/v1',
    documentation: {
      enabled: true,
      title: 'Enterprise API',
      description: 'Generated Enterprise API Documentation',
      contact: {
        name: 'API Support',
        email: 'api-support@company.com'
      }
    },
    cors: {
      allowedOrigins: ['http://localhost:3000'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },

  // Deployment defaults
  deployment: {
    environments: ['dev', 'staging', 'production'],
    strategies: ['docker', 'kubernetes', 'traditional'],
    healthChecks: {
      enabled: true,
      interval: '30s',
      timeout: '10s',
      retries: 3
    },
    resources: {
      backend: {
        cpu: '500m',
        memory: '512Mi',
        replicas: 2
      },
      frontend: {
        cpu: '100m',
        memory: '128Mi',
        replicas: 2
      }
    }
  },

  // Quality gates
  quality: {
    backend: {
      codeStyle: 'google-java-format',
      staticAnalysis: 'spotbugs',
      dependencyCheck: true,
      licenseCheck: true
    },
    frontend: {
      codeStyle: 'prettier',
      staticAnalysis: 'eslint',
      bundleSize: {
        maxSize: '2MB',
        analyze: true
      }
    }
  }
};

/**
 * Get default configuration for a specific category
 * @param {string} category - Configuration category
 * @returns {object} Default configuration
 */
function getDefaults(category) {
  return defaults[category] || {};
}

/**
 * Get all default configurations
 * @returns {object} All default configurations
 */
function getAllDefaults() {
  return defaults;
}

/**
 * Merge user configuration with defaults
 * @param {object} userConfig - User provided configuration
 * @param {string} category - Configuration category
 * @returns {object} Merged configuration
 */
function mergeWithDefaults(userConfig, category) {
  const defaultConfig = getDefaults(category);
  return {
    ...defaultConfig,
    ...userConfig
  };
}

/**
 * Get environment-specific defaults
 * @param {string} environment - Environment name (dev, staging, production)
 * @returns {object} Environment-specific configuration
 */
function getEnvironmentDefaults(environment) {
  const envDefaults = {
    dev: {
      ...defaults.development,
      database: {
        ...defaults.database,
        host: 'localhost',
        ssl: false
      },
      security: {
        ...defaults.security,
        httpsOnly: false
      }
    },
    staging: {
      ...defaults.production,
      logLevel: 'DEBUG',
      security: {
        ...defaults.security,
        httpsOnly: true
      }
    },
    production: {
      ...defaults.production,
      security: {
        ...defaults.security,
        httpsOnly: true,
        secureHeaders: true
      }
    }
  };

  return envDefaults[environment] || envDefaults.dev;
}

/**
 * Get technology stack specific defaults
 * @param {string} stack - Technology stack (spring-boot, react, full-stack)
 * @returns {object} Stack-specific configuration
 */
function getStackDefaults(stack) {
  const stackDefaults = {
    'spring-boot': {
      ...defaults.springBoot,
      ...defaults.database,
      ...defaults.security,
      ...defaults.monitoring
    },
    'react': {
      ...defaults.react,
      ...defaults.testing.frontend
    },
    'full-stack': {
      backend: {
        ...defaults.springBoot,
        ...defaults.database,
        ...defaults.security
      },
      frontend: {
        ...defaults.react
      },
      ...defaults.api,
      ...defaults.docker
    }
  };

  return stackDefaults[stack] || {};
}

/**
 * Validate configuration against defaults
 * @param {object} config - Configuration to validate
 * @param {string} category - Configuration category
 * @returns {object} Validation result
 */
function validateConfig(config, category) {
  const defaultConfig = getDefaults(category);
  const errors = [];
  const warnings = [];

  // Check for unknown properties
  for (const key in config) {
    if (!(key in defaultConfig)) {
      warnings.push(`Unknown configuration property: ${key}`);
    }
  }

  // Check for required properties (example validation)
  if (category === 'springBoot') {
    if (!config.groupId && !defaultConfig.groupId) {
      errors.push('groupId is required for Spring Boot projects');
    }
    if (!config.version && !defaultConfig.version) {
      errors.push('version is required for Spring Boot projects');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  getDefaults,
  getAllDefaults,
  mergeWithDefaults,
  getEnvironmentDefaults,
  getStackDefaults,
  validateConfig,
  defaults
};