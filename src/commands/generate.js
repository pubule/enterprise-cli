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
        if (!input.trim()) return 'Service name is required';
        if (!validation.isValidServiceName(input)) {
          return 'Service name must be kebab-case (e.g., user-service, order-management)';
        }
        return true;
      },
      filter: (input) => input.trim().toLowerCase()
    });
  }

  // Business domain
  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'What is the business domain?',
      validate: (input) => {
        if (!input.trim()) return 'Domain is required';
        if (!validation.isValidJavaIdentifier(input)) {
          return 'Domain must be a valid Java identifier (e.g., user, order, inventory)';
        }
        return true;
      },
      filter: (input) => input.trim().toLowerCase()
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
        if (!input.trim()) return 'At least one entity is required';
        const entities = input.split(',').map(e => e.trim());
        for (const entity of entities) {
          if (!validation.isValidJavaClassName(entity)) {
            return `Invalid entity name: ${entity}. Must be PascalCase (e.g., User, OrderItem)`;
          }
        }
        return true;
      },
      filter: (input) => input.split(',').map(e => validation.capitalizeFirst(e.trim()))
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
    return {
      serviceName: serviceName || answers.serviceName,
      domain: options.domain || answers.domain,
      packageName: options.package || answers.packageName,
      entities: options.entities ? options.entities.split(',').map(e => e.trim()) : answers.entities,
      database: answers.database,
      features: answers.features || [],
      legacyIntegration: answers.legacyIntegration || false,
      ...options
    };
  }

  // Use provided options
  return {
    serviceName,
    domain: options.domain,
    packageName: options.package || `com.company.${options.domain}`,
    entities: options.entities ? options.entities.split(',').map(e => e.trim()) : [validation.capitalizeFirst(options.domain)],
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
    // Check if directory already exists
    if (await fs.pathExists(answers.serviceName)) {
      throw new Error(`Directory '${answers.serviceName}' already exists`);
    }

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
  const spinner = ora('Generating Spring Boot microservice...').start();

  try {
    // Create project directory
    await fs.ensureDir(answers.serviceName);
    process.chdir(answers.serviceName);

    // Generate template variables
    const templateVars = createTemplateVariables(answers);

    // Generate project structure
    await fileGenerator.generateFromTemplate('microservice-skeleton', '.', templateVars);

    // Generate Maven POM
    await generateMavenPom(templateVars);

    // Generate application configuration
    await generateApplicationConfig(templateVars);

    // Generate entities and related classes
    await generateEntities(templateVars);

    // Generate controllers
    await generateControllers(templateVars);

    // Generate services
    await generateServices(templateVars);

    // Generate repositories
    await generateRepositories(templateVars);

    // Generate tests
    if (templateVars.features.includes('tests')) {
      await generateTests(templateVars);
    }

    // Generate Camel routes
    if (templateVars.features.includes('camel')) {
      await generateCamelRoutes(templateVars);
    }

    // Generate Docker configuration
    if (templateVars.features.includes('docker')) {
      await generateDockerConfig(templateVars);
    }

    // Generate Kubernetes manifests
    if (templateVars.features.includes('k8s')) {
      await generateKubernetesManifests(templateVars);
    }

    // Generate database migrations
    if (templateVars.features.includes('flyway')) {
      await generateDatabaseMigrations(templateVars);
    }

    // Generate README
    await generateReadme(templateVars);

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
    databaseDialect: getDatabaseDialect(answers.database)
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