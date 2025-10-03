/**
 * Generate Command
 * Creates Spring Boot microservices with Enterprise Framework
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');

const validation = require('../utils/validation');
const { generateFromTemplate } = require('../utils/file-generator');
const {
  DATABASES,
  PORTS,
  EXIT_CODES,
  SYMBOLS,
  MESSAGES,
  REGEX_PATTERNS
} = require('../constants');

// ========================================
// DATABASE CONFIGURATION HELPERS
// ========================================

/**
 * Get JDBC driver class for database type
 * @param {string} database - Database type (postgresql, mysql, h2)
 * @returns {string} - JDBC driver class name
 */
function getDatabaseDriverClass(database) {
  const drivers = {
    [DATABASES.POSTGRESQL]: 'org.postgresql.Driver',
    [DATABASES.MYSQL]: 'com.mysql.cj.jdbc.Driver',
    [DATABASES.H2]: 'org.h2.Driver'
  };
  return drivers[database] || drivers[DATABASES.POSTGRESQL];
}

/**
 * Get JDBC connection URL for database type
 * @param {string} database - Database type
 * @param {string} serviceName - Service name for database name
 * @returns {string} - JDBC connection URL
 */
function getDatabaseUrl(database, serviceName) {
  const dbName = serviceName.replace(/-/g, '_');
  const urls = {
    [DATABASES.POSTGRESQL]: `jdbc:postgresql://localhost:${PORTS.POSTGRES}/${dbName}`,
    [DATABASES.MYSQL]: `jdbc:mysql://localhost:${PORTS.MYSQL}/${dbName}?useSSL=false&serverTimezone=UTC`,
    [DATABASES.H2]: `jdbc:h2:mem:${dbName};DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
  };
  return urls[database] || urls[DATABASES.POSTGRESQL];
}

/**
 * Get Hibernate dialect for database type
 * @param {string} database - Database type
 * @returns {string} - Hibernate dialect class name
 */
function getDatabaseDialect(database) {
  const dialects = {
    [DATABASES.POSTGRESQL]: 'org.hibernate.dialect.PostgreSQLDialect',
    [DATABASES.MYSQL]: 'org.hibernate.dialect.MySQL8Dialect',
    [DATABASES.H2]: 'org.hibernate.dialect.H2Dialect'
  };
  return dialects[database] || dialects[DATABASES.POSTGRESQL];
}

// ========================================
// TEMPLATE VARIABLES BUILDER
// ========================================

/**
 * Build template variables from user answers
 * @param {object} answers - User answers from prompts
 * @returns {object} - Template variables for mustache
 */
function buildTemplateVars(answers) {
  const {
    serviceName,
    domain,
    packageName,
    entities,
    database,
    frameworkVersion,
    features
  } = answers;

  // Parse entities (comma-separated string to array)
  const entityList = entities
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);

  // Build entity objects with various case formats
  const entityObjects = entityList.map(entityName => ({
    name: entityName, // PascalCase (e.g., "User")
    nameLowerCase: entityName.toLowerCase(), // lowercase (e.g., "user")
    nameCamelCase: validation.toCamelCase(entityName), // camelCase (e.g., "user")
    nameKebabCase: validation.toKebabCase(entityName), // kebab-case (e.g., "user")
    nameSnakeCase: validation.toSnakeCase(entityName), // snake_case (e.g., "user")
    tableName: validation.toSnakeCase(entityName) // table name (e.g., "user")
  }));

  // Calculate package paths (replace dots with slashes)
  const packagePath = packageName.replace(/\./g, '/');
  const frameworkPackage = `${packageName}.enterprise.framework`;
  const frameworkPackagePath = frameworkPackage.replace(/\./g, '/');

  // Domain transformations
  const domainTitleCase = validation.capitalizeFirst(domain);

  // Database configuration
  const databaseDriverClass = getDatabaseDriverClass(database);
  const databaseUrl = getDatabaseUrl(database, serviceName);
  const databaseDialect = getDatabaseDialect(database);

  // Feature flags
  const hasCoreFramework = true; // Always true, mandatory
  const hasAuth = features.includes('OAuth2 Authentication');
  const hasCamel = features.includes('Apache Camel Integration');
  const hasMultiTenancy = features.includes('Multi-tenancy Support');
  const hasSoftDelete = features.includes('Soft Delete Support');
  const hasAuditLogging = features.includes('Audit Logging');
  const hasEventPublishing = features.includes('Event Publishing');
  const hasDocker = features.includes('Docker Configuration');
  const hasKubernetes = features.includes('Kubernetes Manifests');
  const hasMonitoring = features.includes('Monitoring (Prometheus)');
  const hasOpenApi = features.includes('OpenAPI/Swagger');
  const hasFlyway = features.includes('Flyway Migrations');

  return {
    // Basic information
    serviceName,
    domain,
    domainTitleCase,
    packageName,
    frameworkVersion,
    database,

    // Package paths
    packagePath,
    frameworkPackage,
    frameworkPackagePath,

    // Entities
    entities: entityObjects,
    hasEntities: entityObjects.length > 0,
    firstEntity: entityObjects[0], // Convenience for templates

    // Database configuration
    databaseDriverClass,
    databaseUrl,
    databaseDialect,

    // Feature flags
    hasCoreFramework,
    hasAuth,
    hasCamel,
    hasMultiTenancy,
    hasSoftDelete,
    hasAuditLogging,
    hasEventPublishing,
    hasDocker,
    hasKubernetes,
    hasMonitoring,
    hasOpenApi,
    hasFlyway,

    // Current year for copyright headers
    year: new Date().getFullYear()
  };
}

// ========================================
// VALIDATION
// ========================================

/**
 * Validates user inputs
 * @param {object} answers - User answers to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validateInputs(answers) {
  const errors = [];

  // Validate service name
  if (!validation.isValidServiceName(answers.serviceName)) {
    errors.push('Service name must be kebab-case, 2-50 characters (e.g., "user-service")');
  }

  // Validate domain
  if (!answers.domain || !REGEX_PATTERNS.DOMAIN_NAME.test(answers.domain)) {
    errors.push('Domain must be lowercase alphanumeric (e.g., "user", "order")');
  }

  // Validate package name
  if (!validation.isValidJavaPackage(answers.packageName)) {
    errors.push('Package name must be valid Java package format (e.g., "com.company.domain")');
  }

  // Validate entities
  const entityList = answers.entities
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);

  if (entityList.length === 0) {
    errors.push('At least one entity must be specified');
  }

  for (const entity of entityList) {
    if (!validation.isValidJavaClassName(entity)) {
      errors.push(`Entity "${entity}" must be a valid PascalCase Java class name (e.g., "User", "UserProfile")`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ========================================
// PROJECT GENERATION
// ========================================

/**
 * Generate project from template
 * @param {object} answers - User answers
 * @returns {Promise<void>}
 */
async function generateProject(answers) {
  const { serviceName } = answers;
  const outputPath = path.join(process.cwd(), serviceName);

  // Check if directory already exists
  if (await fs.pathExists(outputPath)) {
    throw new Error(`Directory "${serviceName}" already exists. Please choose a different name or remove the existing directory.`);
  }

  // Build template variables
  const templateVars = buildTemplateVars(answers);

  // Create output directory
  await fs.ensureDir(outputPath);

  // Generate from template
  const spinner = ora('Generating microservice from template...').start();

  try {
    const result = await generateFromTemplate(
      'microservice-skeleton',
      outputPath,
      templateVars
    );

    spinner.succeed(`Generated ${result.filesGenerated} files`);

    // Show completion message
    showCompletionMessage(serviceName, templateVars);

    return result;
  } catch (error) {
    spinner.fail('Failed to generate microservice');
    throw error;
  }
}

/**
 * Show completion message with next steps
 * @param {string} serviceName - Generated service name
 * @param {object} templateVars - Template variables used
 */
function showCompletionMessage(serviceName, templateVars) {
  const { frameworkPackagePath } = templateVars;

  console.log();
  console.log(chalk.green.bold(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.MICROSERVICE_GENERATED}`));
  console.log();
  console.log(chalk.cyan.bold(`${SYMBOLS.PACKAGE} ${MESSAGES.INFO.FRAMEWORK_LOCATION}`), `src/main/java/${frameworkPackagePath}/`);
  console.log();
  console.log(chalk.white('The framework provides:'));
  console.log(chalk.gray('  - AbstractEnterpriseEntity (audit fields, soft delete)'));
  console.log(chalk.gray('  - AbstractEnterpriseRepository (common queries)'));
  console.log(chalk.gray('  - AbstractEnterpriseService (transaction management, validation)'));
  console.log(chalk.gray('  - AbstractEnterpriseController (CRUD endpoints)'));
  console.log(chalk.gray('  - BusinessValidator and BusinessRule interfaces'));
  console.log(chalk.gray('  - Event publishing system'));
  console.log();
  console.log(chalk.yellow.bold('💡 Your entities, services, and controllers extend these base classes.'));
  console.log(chalk.yellow.bold('   Focus on business logic only!'));
  console.log();
  console.log(chalk.white.bold('Next steps:'));
  console.log(chalk.gray(`  1. cd ${serviceName}`));
  console.log(chalk.gray(`  2. Review framework classes in src/main/java/${frameworkPackagePath}/`));
  console.log(chalk.gray('  3. Add business logic to generated entity/service/controller'));
  console.log(chalk.gray('  4. enterprise dev setup'));
  console.log(chalk.gray('  5. enterprise dev start --backend'));
  console.log();
}

// ========================================
// INTERACTIVE PROMPTS
// ========================================

/**
 * Get interactive prompts for missing parameters
 * @param {string} serviceName - Service name from CLI args
 * @param {object} options - Options from CLI flags
 * @returns {Promise<object>} - Complete answers
 */
async function getInteractiveAnswers(serviceName, options) {
  const questions = [];

  // Service name
  if (!serviceName) {
    questions.push({
      type: 'input',
      name: 'serviceName',
      message: 'Service name (kebab-case):',
      validate: (input) => {
        if (!input) return 'Service name is required';
        if (!validation.isValidServiceName(input)) {
          return 'Service name must be kebab-case, 2-50 characters (e.g., "user-service")';
        }
        return true;
      }
    });
  }

  // Domain
  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'Business domain (lowercase):',
      default: (answers) => {
        const name = serviceName || answers.serviceName;
        // Try to extract domain from service name (e.g., "user-service" -> "user")
        return name.split('-')[0];
      },
      validate: (input) => {
        if (!input) return 'Domain is required';
        if (!REGEX_PATTERNS.DOMAIN_NAME.test(input)) {
          return 'Domain must be lowercase alphanumeric (e.g., "user", "order")';
        }
        return true;
      }
    });
  }

  // Package name
  if (!options.package) {
    questions.push({
      type: 'input',
      name: 'packageName',
      message: 'Java package name:',
      default: (answers) => {
        const domain = options.domain || answers.domain;
        return `com.company.${domain}`;
      },
      validate: (input) => {
        if (!input) return 'Package name is required';
        if (!validation.isValidJavaPackage(input)) {
          return 'Package name must be valid Java package format (e.g., "com.company.domain")';
        }
        return true;
      }
    });
  }

  // Entities
  if (!options.entities) {
    questions.push({
      type: 'input',
      name: 'entities',
      message: 'Entities (comma-separated PascalCase):',
      default: (answers) => {
        const domain = options.domain || answers.domain;
        return validation.toPascalCase(domain);
      },
      validate: (input) => {
        if (!input) return 'At least one entity is required';
        const entities = input.split(',').map(e => e.trim()).filter(e => e.length > 0);
        if (entities.length === 0) return 'At least one entity is required';

        for (const entity of entities) {
          if (!validation.isValidJavaClassName(entity)) {
            return `"${entity}" is not a valid PascalCase class name (e.g., "User", "UserProfile")`;
          }
        }
        return true;
      }
    });
  }

  // Database
  if (!options.database) {
    questions.push({
      type: 'list',
      name: 'database',
      message: 'Database type:',
      choices: [DATABASES.POSTGRESQL, DATABASES.MYSQL, DATABASES.H2],
      default: DATABASES.POSTGRESQL
    });
  }

  // Framework version
  if (!options.frameworkVersion) {
    questions.push({
      type: 'input',
      name: 'frameworkVersion',
      message: 'Enterprise Framework version:',
      default: '1.0.0'
    });
  }

  // Features
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: 'Select features to include:',
    choices: [
      {
        name: 'Enterprise Framework Core',
        value: 'Enterprise Framework Core',
        checked: true,
        disabled: 'Required'
      },
      {
        name: 'OAuth2 Authentication',
        value: 'OAuth2 Authentication',
        checked: options.auth !== false
      },
      {
        name: 'Apache Camel Integration',
        value: 'Apache Camel Integration',
        checked: options.camel !== false
      },
      {
        name: 'Multi-tenancy Support',
        value: 'Multi-tenancy Support',
        checked: false
      },
      {
        name: 'Soft Delete Support',
        value: 'Soft Delete Support',
        checked: true
      },
      {
        name: 'Audit Logging',
        value: 'Audit Logging',
        checked: true
      },
      {
        name: 'Event Publishing',
        value: 'Event Publishing',
        checked: true
      },
      {
        name: 'Docker Configuration',
        value: 'Docker Configuration',
        checked: options.docker !== false
      },
      {
        name: 'Kubernetes Manifests',
        value: 'Kubernetes Manifests',
        checked: options.k8s !== false
      },
      {
        name: 'Monitoring (Prometheus)',
        value: 'Monitoring (Prometheus)',
        checked: true
      },
      {
        name: 'OpenAPI/Swagger',
        value: 'OpenAPI/Swagger',
        checked: true
      },
      {
        name: 'Flyway Migrations',
        value: 'Flyway Migrations',
        checked: true
      }
    ]
  });

  // Get answers from prompts
  const answers = await inquirer.prompt(questions);

  // Merge with provided options and arguments
  return {
    serviceName: serviceName || answers.serviceName,
    domain: options.domain || answers.domain,
    packageName: options.package || answers.packageName,
    entities: options.entities || answers.entities,
    database: options.database || answers.database || DATABASES.POSTGRESQL,
    frameworkVersion: options.frameworkVersion || answers.frameworkVersion || '1.0.0',
    features: answers.features // Always from prompts to get user selection
  };
}

// ========================================
// MAIN COMMAND
// ========================================

/**
 * Generate command - creates Spring Boot microservice with Enterprise Framework
 * @param {string} serviceName - Service name (optional, from CLI args)
 * @param {object} options - Command options
 */
async function generateCommand(serviceName, options) {
  try {
    console.log(chalk.cyan.bold(`\n${SYMBOLS.ROCKET} ${MESSAGES.HEADERS.ENTERPRISE_MICROSERVICE_GENERATOR}\n`));

    // Get complete answers (interactive + CLI options)
    const answers = await getInteractiveAnswers(serviceName, options);

    // Validate inputs
    const spinner = ora('Validating inputs...').start();
    const validation = validateInputs(answers);

    if (!validation.valid) {
      spinner.fail('Validation failed');
      console.log();
      validation.errors.forEach(error => {
        console.log(chalk.red(`  ${SYMBOLS.CROSS} ${error}`));
      });
      console.log();
      process.exit(EXIT_CODES.ERROR);
    }

    spinner.succeed('Validation passed');

    // Generate project
    await generateProject(answers);

  } catch (error) {
    console.log();
    console.log(chalk.red.bold(`${SYMBOLS.ERROR} ${MESSAGES.ERROR.GENERATION_FAILED}:`));
    console.log(chalk.red(`   ${error.message}`));
    console.log();

    if (process.env.DEBUG) {
      console.log(chalk.gray(error.stack));
    }

    process.exit(EXIT_CODES.ERROR);
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  generateCommand
};
