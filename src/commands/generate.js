const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const validateNpmPackageName = require('validate-npm-package-name');

const fileGenerator = require('../utils/file-generator');
const validation = require('../utils/validation');
const mavenUtils = require('../utils/maven-utils');

/**
 * Generate Spring Boot microservice with enterprise patterns
 */
async function generateCommand(serviceName, options) {
  console.log(chalk.cyan('\n🎯 Enterprise Spring Boot Microservice Generator\n'));

  try {
    // Interactive prompts if serviceName not provided
    const answers = await collectServiceInformation(serviceName, options);

    // Validate inputs
    await validateInputs(answers);

    // Generate project structure
    await generateProject(answers);

    console.log(chalk.green('\n✅ Spring Boot microservice generated successfully!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.white('  1. cd ' + answers.serviceName));
    console.log(chalk.white('  2. enterprise dev setup'));
    console.log(chalk.white('  3. enterprise dev start --backend'));

  } catch (error) {
    console.error(chalk.red('\n❌ Generation failed:'), error.message);
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

/**
 * Collect service information through interactive prompts
 */
async function collectServiceInformation(serviceName, options) {
  const questions = [];

  // Service name
  if (!serviceName) {
    questions.push({
      type: 'input',
      name: 'serviceName',
      message: 'What is the name of your microservice?',
      validate: (input) => {
        if (!input || typeof input !== 'string' || !input.trim()) return 'Service name is required';
        if (!validation.isValidServiceName(input)) {
          return 'Service name must be kebab-case (e.g., user-service, order-management)';
        }
        return true;
      },
      filter: (input) => input && typeof input === 'string' ? input.trim().toLowerCase() : ''
    });
  }

  // Business domain
  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'What is the business domain?',
      validate: (input) => {
        if (!input || typeof input !== 'string' || !input.trim()) return 'Domain is required';
        if (!validation.isValidJavaIdentifier(input)) {
          return 'Domain must be a valid Java identifier (e.g., user, order, inventory)';
        }
        return true;
      },
      filter: (input) => input && typeof input === 'string' ? input.trim().toLowerCase() : ''
    });
  }

  // Java package
  if (!options.package) {
    questions.push({
      type: 'input',
      name: 'packageName',
      message: 'Java package name?',
      default: (answers) => `com.company.${answers.domain || options.domain}`,
      validate: (input) => {
        if (!validation.isValidJavaPackage(input)) {
          return 'Invalid Java package name (e.g., com.company.domain)';
        }
        return true;
      }
    });
  }

  // Entities to generate
  if (!options.entities) {
    questions.push({
      type: 'input',
      name: 'entities',
      message: 'Entity classes to generate (comma-separated)?',
      default: (answers) => validation.capitalizeFirst(answers.domain || options.domain),
      validate: (input) => {
        // Handle both string and array inputs (filter may have processed it already)
        let entities;
        if (Array.isArray(input)) {
          entities = input;
        } else if (typeof input === 'string') {
          if (!input.trim()) return 'At least one entity is required';
          entities = input.split(',').map(e => e.trim());
        } else {
          return 'At least one entity is required';
        }

        if (entities.length === 0) return 'At least one entity is required';

        for (const entity of entities) {
          if (!entity || typeof entity !== 'string' || !entity.trim()) {
            return 'Empty entity name is not allowed';
          }
          if (!validation.isValidJavaClassName(entity)) {
            return `Invalid entity name: ${entity}. Must be PascalCase (e.g., User, OrderItem)`;
          }
        }
        return true;
      },
      filter: (input) => {
        if (!input || typeof input !== 'string') return [];
        return input.split(',').map(e => validation.capitalizeFirst(e.trim()));
      }
    });
  }

  // Database selection
  questions.push({
    type: 'list',
    name: 'database',
    message: 'Which database do you want to use?',
    choices: [
      { name: 'PostgreSQL (recommended for production)', value: 'postgresql' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'H2 (for testing/development)', value: 'h2' }
    ],
    default: options.database || 'postgresql'
  });

  // Features selection
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: 'Select enterprise features to include:',
    choices: [
      { name: 'OAuth2 Authentication & Authorization', value: 'auth', checked: options.auth !== false },
      { name: 'Apache Camel Integration Routes', value: 'camel', checked: options.camel !== false },
      { name: 'Docker Configuration', value: 'docker', checked: options.docker !== false },
      { name: 'Kubernetes Manifests', value: 'k8s', checked: options.k8s !== false },
      { name: 'Monitoring (Micrometer + Prometheus)', value: 'monitoring', checked: true },
      { name: 'API Documentation (OpenAPI/Swagger)', value: 'openapi', checked: true },
      { name: 'Database Migrations (Flyway)', value: 'flyway', checked: true },
      { name: 'Comprehensive Test Suite', value: 'tests', checked: true },
      { name: 'Architecture Tests (ArchUnit)', value: 'archunit', checked: true }
    ],
    validate: (answer) => {
      if (answer.length === 0) {
        return 'You must choose at least one feature.';
      }
      return true;
    }
  });

  // Legacy system integration
  questions.push({
    type: 'confirm',
    name: 'legacyIntegration',
    message: 'Will this service integrate with legacy systems?',
    default: true,
    when: (answers) => answers.features && answers.features.includes('camel')
  });

  if (questions.length > 0) {
    const answers = await inquirer.prompt(questions);

    // Merge with provided options
    const finalEntities = options.entities
      ? (typeof options.entities === 'string' ? options.entities.split(',').map(e => e.trim()) : [])
      : answers.entities
        ? (Array.isArray(answers.entities) ? answers.entities : (typeof answers.entities === 'string' ? answers.entities.split(',').map(e => e.trim()) : []))
        : [];

    return {
      ...options,
      serviceName: serviceName || answers.serviceName,
      domain: options.domain || answers.domain,
      packageName: options.package || answers.packageName,
      entities: finalEntities,
      database: answers.database,
      features: answers.features || [],
      legacyIntegration: answers.legacyIntegration || false
    };
  }

  // Use provided options
  const finalEntities = options.entities
    ? (typeof options.entities === 'string' ? options.entities.split(',').map(e => e.trim()) : [])
    : [validation.capitalizeFirst(options.domain)];

  return {
    serviceName,
    domain: options.domain,
    packageName: options.package || `com.company.${options.domain}`,
    entities: finalEntities,
    database: options.database || 'postgresql',
    features: [
      ...(options.auth !== false ? ['auth'] : []),
      ...(options.camel !== false ? ['camel'] : []),
      ...(options.docker !== false ? ['docker'] : []),
      ...(options.k8s !== false ? ['k8s'] : []),
      'monitoring', 'openapi', 'flyway', 'tests', 'archunit'
    ],
    legacyIntegration: options.camel !== false
  };
}

/**
 * Validate all inputs
 */
async function validateInputs(answers) {
  const spinner = ora('Validating inputs...').start();

  try {
    // Validate service name
    if (!validation.isValidServiceName(answers.serviceName)) {
      throw new Error('Invalid service name format');
    }

    // Validate package name
    if (!validation.isValidJavaPackage(answers.packageName)) {
      throw new Error('Invalid Java package name');
    }

    // Validate entities
    for (const entity of answers.entities) {
      if (!validation.isValidJavaClassName(entity)) {
        throw new Error(`Invalid entity name: ${entity}`);
      }
    }

    spinner.succeed('Inputs validated successfully');
  } catch (error) {
    spinner.fail('Input validation failed');
    throw error;
  }
}


/**
 * Generate the complete project structure
 */
async function generateProject(answers) {
  // Reset file conflict choices for this new project generation
  fileGenerator.resetConflictChoice();

  const spinner = ora('Generating Spring Boot microservice...').start();

  try {
    // Create project directory
    await fs.ensureDir(answers.serviceName);
    process.chdir(answers.serviceName);

    // Generate template variables
    const templateVars = createTemplateVariables(answers);

    // Generate project structure from the main template
    await fileGenerator.generateFromTemplate('microservice-skeleton', '.', templateVars);

    // Note: POM and application config are already generated by the skeleton template above
    // No need to regenerate them separately

    // TODO: Generate additional components when templates are available
    // For now, the basic microservice structure is generated from the skeleton template

    // Generate entities and related classes
    // await generateEntities(templateVars);

    // Generate controllers
    // await generateControllers(templateVars);

    // Generate services
    // await generateServices(templateVars);

    // Generate repositories
    // await generateRepositories(templateVars);

    // Generate tests
    // if (templateVars.features.includes('tests')) {
    //   await generateTests(templateVars);
    // }

    // Generate Camel routes
    // if (templateVars.features.includes('camel')) {
    //   await generateCamelRoutes(templateVars);
    // }

    // Generate Docker configuration
    // if (templateVars.features.includes('docker')) {
    //   await generateDockerConfig(templateVars);
    // }

    // Generate Kubernetes manifests
    // if (templateVars.features.includes('k8s')) {
    //   await generateKubernetesManifests(templateVars);
    // }

    // Generate database migrations
    // if (templateVars.features.includes('flyway')) {
    //   await generateDatabaseMigrations(templateVars);
    // }

    // Generate README
    // await generateReadme(templateVars);

    spinner.succeed('Spring Boot microservice generated successfully');
  } catch (error) {
    spinner.fail('Project generation failed');
    throw error;
  }
}

/**
 * Create template variables for code generation
 */
function createTemplateVariables(answers) {
  const packagePath = answers.packageName.replace(/\./g, '/');
  const serviceTitleCase = validation.toPascalCase(answers.serviceName);
  const domainTitleCase = validation.capitalizeFirst(answers.domain);

  return {
    serviceName: answers.serviceName,
    serviceNameTitleCase: serviceTitleCase,
    serviceNameCamelCase: validation.toCamelCase(answers.serviceName),
    domain: answers.domain,
    domainTitleCase: domainTitleCase,
    packageName: answers.packageName,
    packagePath: packagePath,
    entities: answers.entities,
    entitiesLowerCase: answers.entities.map(e => e.toLowerCase()),
    database: answers.database,
    features: answers.features,
    legacyIntegration: answers.legacyIntegration,
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),

    // Feature flags for templates
    hasAuth: answers.features.includes('auth'),
    hasCamel: answers.features.includes('camel'),
    hasDocker: answers.features.includes('docker'),
    hasK8s: answers.features.includes('k8s'),
    hasMonitoring: answers.features.includes('monitoring'),
    hasOpenApi: answers.features.includes('openapi'),
    hasFlyway: answers.features.includes('flyway'),
    hasTests: answers.features.includes('tests'),
    hasArchUnit: answers.features.includes('archunit'),

    // Database configuration
    databaseDriverClass: getDatabaseDriverClass(answers.database),
    databaseUrl: getDatabaseUrl(answers.database, answers.serviceName),
    databaseDialect: getDatabaseDialect(answers.database),

    // Database-specific flags for templates
    postgresql: answers.database === 'postgresql',
    mysql: answers.database === 'mysql',
    h2: answers.database === 'h2'
  };
}

/**
 * Generate Maven POM file
 */
async function generateMavenPom(templateVars) {
  await fileGenerator.generateFromTemplate('maven/pom.xml', 'pom.xml', templateVars);
}

/**
 * Generate application configuration files
 */
async function generateApplicationConfig(templateVars) {
  await fileGenerator.generateFromTemplate('config/application.yml', 'src/main/resources/application.yml', templateVars);
  await fileGenerator.generateFromTemplate('config/application-dev.yml', 'src/main/resources/application-dev.yml', templateVars);
  await fileGenerator.generateFromTemplate('config/application-prod.yml', 'src/main/resources/application-prod.yml', templateVars);
}

/**
 * Generate entity classes
 */
async function generateEntities(templateVars) {
  for (const entity of templateVars.entities) {
    const entityVars = { ...templateVars, entityName: entity, entityNameLowerCase: entity.toLowerCase() };
    await fileGenerator.generateFromTemplate(
      'java/entity/Entity.java',
      `src/main/java/${templateVars.packagePath}/entity/${entity}.java`,
      entityVars
    );
  }
}

/**
 * Generate controller classes
 */
async function generateControllers(templateVars) {
  for (const entity of templateVars.entities) {
    const entityVars = { ...templateVars, entityName: entity, entityNameLowerCase: entity.toLowerCase() };
    await fileGenerator.generateFromTemplate(
      'java/controller/EntityController.java',
      `src/main/java/${templateVars.packagePath}/controller/${entity}Controller.java`,
      entityVars
    );
  }
}

/**
 * Generate service classes
 */
async function generateServices(templateVars) {
  for (const entity of templateVars.entities) {
    const entityVars = { ...templateVars, entityName: entity, entityNameLowerCase: entity.toLowerCase() };
    await fileGenerator.generateFromTemplate(
      'java/service/EntityService.java',
      `src/main/java/${templateVars.packagePath}/service/${entity}Service.java`,
      entityVars
    );
  }
}

/**
 * Generate repository classes
 */
async function generateRepositories(templateVars) {
  for (const entity of templateVars.entities) {
    const entityVars = { ...templateVars, entityName: entity, entityNameLowerCase: entity.toLowerCase() };
    await fileGenerator.generateFromTemplate(
      'java/repository/EntityRepository.java',
      `src/main/java/${templateVars.packagePath}/repository/${entity}Repository.java`,
      entityVars
    );
  }
}

/**
 * Generate test classes
 */
async function generateTests(templateVars) {
  // Unit tests
  for (const entity of templateVars.entities) {
    const entityVars = { ...templateVars, entityName: entity, entityNameLowerCase: entity.toLowerCase() };
    await fileGenerator.generateFromTemplate(
      'java/test/EntityServiceTest.java',
      `src/test/java/${templateVars.packagePath}/service/${entity}ServiceTest.java`,
      entityVars
    );
    await fileGenerator.generateFromTemplate(
      'java/test/EntityControllerTest.java',
      `src/test/java/${templateVars.packagePath}/controller/${entity}ControllerTest.java`,
      entityVars
    );
  }

  // Integration tests
  await fileGenerator.generateFromTemplate(
    'java/test/ApplicationIntegrationTest.java',
    `src/test/java/${templateVars.packagePath}/integration/${templateVars.serviceNameTitleCase}ApplicationIntegrationTest.java`,
    templateVars
  );

  // Architecture tests
  if (templateVars.hasArchUnit) {
    await fileGenerator.generateFromTemplate(
      'java/test/ArchitectureTest.java',
      `src/test/java/${templateVars.packagePath}/architecture/ArchitectureTest.java`,
      templateVars
    );
  }
}

/**
 * Generate Apache Camel routes
 */
async function generateCamelRoutes(templateVars) {
  await fileGenerator.generateFromTemplate(
    'java/camel/CamelConfig.java',
    `src/main/java/${templateVars.packagePath}/config/CamelConfig.java`,
    templateVars
  );

  if (templateVars.legacyIntegration) {
    await fileGenerator.generateFromTemplate(
      'java/camel/LegacyIntegrationRoute.java',
      `src/main/java/${templateVars.packagePath}/integration/routes/LegacyIntegrationRoute.java`,
      templateVars
    );
  }
}

/**
 * Generate Docker configuration
 */
async function generateDockerConfig(templateVars) {
  await fileGenerator.generateFromTemplate('docker/Dockerfile', 'Dockerfile', templateVars);
  await fileGenerator.generateFromTemplate('docker/docker-compose.yml', 'docker-compose.yml', templateVars);
  await fileGenerator.generateFromTemplate('docker/.dockerignore', '.dockerignore', templateVars);
}

/**
 * Generate Kubernetes manifests
 */
async function generateKubernetesManifests(templateVars) {
  await fs.ensureDir('k8s');
  await fileGenerator.generateFromTemplate('k8s/deployment.yaml', 'k8s/deployment.yaml', templateVars);
  await fileGenerator.generateFromTemplate('k8s/service.yaml', 'k8s/service.yaml', templateVars);
  await fileGenerator.generateFromTemplate('k8s/configmap.yaml', 'k8s/configmap.yaml', templateVars);
  await fileGenerator.generateFromTemplate('k8s/ingress.yaml', 'k8s/ingress.yaml', templateVars);
}

/**
 * Generate database migrations
 */
async function generateDatabaseMigrations(templateVars) {
  await fs.ensureDir('src/main/resources/db/migration');

  let migrationCounter = 1;
  for (const entity of templateVars.entities) {
    const entityVars = {
      ...templateVars,
      entityName: entity,
      entityNameLowerCase: entity.toLowerCase(),
      migrationVersion: `V${migrationCounter.toString().padStart(3, '0')}`
    };
    await fileGenerator.generateFromTemplate(
      'sql/create-entity-table.sql',
      `src/main/resources/db/migration/V${migrationCounter.toString().padStart(3, '0')}__create_${entity.toLowerCase()}_table.sql`,
      entityVars
    );
    migrationCounter++;
  }
}

/**
 * Generate README file
 */
async function generateReadme(templateVars) {
  await fileGenerator.generateFromTemplate('docs/README.md', 'README.md', templateVars);
}

/**
 * Utility functions
 */
function getDatabaseDriverClass(database) {
  const drivers = {
    postgresql: 'org.postgresql.Driver',
    mysql: 'com.mysql.cj.jdbc.Driver',
    h2: 'org.h2.Driver'
  };
  return drivers[database] || drivers.postgresql;
}

function getDatabaseUrl(database, serviceName) {
  const urls = {
    postgresql: `jdbc:postgresql://localhost:5432/${serviceName.replace('-', '_')}`,
    mysql: `jdbc:mysql://localhost:3306/${serviceName.replace('-', '_')}`,
    h2: `jdbc:h2:mem:${serviceName.replace('-', '_')}`
  };
  return urls[database] || urls.postgresql;
}

function getDatabaseDialect(database) {
  const dialects = {
    postgresql: 'org.hibernate.dialect.PostgreSQLDialect',
    mysql: 'org.hibernate.dialect.MySQLDialect',
    h2: 'org.hibernate.dialect.H2Dialect'
  };
  return dialects[database] || dialects.postgresql;
}

module.exports = generateCommand;