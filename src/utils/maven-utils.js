const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

/**
 * Maven utilities for Spring Boot project management
 */

/**
 * Check if Maven is installed and accessible
 * @returns {boolean} True if Maven is available
 */
async function isMavenAvailable() {
  try {
    await execa('mvn', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Maven version
 * @returns {string|null} Maven version or null if not available
 */
async function getMavenVersion() {
  try {
    const { stdout } = await execa('mvn', ['--version']);
    const versionMatch = stdout.match(/Apache Maven (\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Create a new Maven project using archetype
 * @param {object} options - Project creation options
 */
async function createMavenProject(options) {
  const {
    groupId,
    artifactId,
    version = '1.0.0',
    packageName,
    archetypeGroupId = 'org.springframework.boot',
    archetypeArtifactId = 'spring-boot-starter-parent',
    archetypeVersion = '3.2.0'
  } = options;

  const args = [
    'archetype:generate',
    `-DgroupId=${groupId}`,
    `-DartifactId=${artifactId}`,
    `-Dversion=${version}`,
    `-DarchetypeGroupId=${archetypeGroupId}`,
    `-DarchetypeArtifactId=${archetypeArtifactId}`,
    `-DarchetypeVersion=${archetypeVersion}`,
    '-DinteractiveMode=false'
  ];

  if (packageName) {
    args.push(`-Dpackage=${packageName}`);
  }

  await execa('mvn', args, { stdio: 'pipe' });
}

/**
 * Add dependency to pom.xml
 * @param {string} pomPath - Path to pom.xml
 * @param {object} dependency - Dependency object
 */
async function addDependency(pomPath, dependency) {
  if (!await fs.pathExists(pomPath)) {
    throw new Error('pom.xml not found');
  }

  let pomContent = await fs.readFile(pomPath, 'utf8');

  // Find dependencies section
  const dependenciesMatch = pomContent.match(/<dependencies>([\s\S]*?)<\/dependencies>/);

  if (!dependenciesMatch) {
    // Create dependencies section if it doesn't exist
    const projectEndTag = '</project>';
    const dependenciesSection = `
  <dependencies>
    ${formatDependency(dependency)}
  </dependencies>
`;
    pomContent = pomContent.replace(projectEndTag, dependenciesSection + projectEndTag);
  } else {
    // Add to existing dependencies
    const dependenciesContent = dependenciesMatch[1];
    const newDependenciesContent = dependenciesContent + formatDependency(dependency);
    pomContent = pomContent.replace(dependenciesMatch[0], `<dependencies>${newDependenciesContent}</dependencies>`);
  }

  await fs.writeFile(pomPath, pomContent, 'utf8');
}

/**
 * Format dependency for XML insertion
 * @param {object} dependency - Dependency object
 * @returns {string} Formatted XML
 */
function formatDependency(dependency) {
  const { groupId, artifactId, version, scope, type } = dependency;

  let xml = `
    <dependency>
      <groupId>${groupId}</groupId>
      <artifactId>${artifactId}</artifactId>`;

  if (version) {
    xml += `
      <version>${version}</version>`;
  }

  if (scope) {
    xml += `
      <scope>${scope}</scope>`;
  }

  if (type) {
    xml += `
      <type>${type}</type>`;
  }

  xml += `
    </dependency>`;

  return xml;
}

/**
 * Add multiple dependencies to pom.xml
 * @param {string} pomPath - Path to pom.xml
 * @param {Array} dependencies - Array of dependency objects
 */
async function addDependencies(pomPath, dependencies) {
  for (const dependency of dependencies) {
    await addDependency(pomPath, dependency);
  }
}

/**
 * Add plugin to pom.xml
 * @param {string} pomPath - Path to pom.xml
 * @param {object} plugin - Plugin object
 */
async function addPlugin(pomPath, plugin) {
  if (!await fs.pathExists(pomPath)) {
    throw new Error('pom.xml not found');
  }

  let pomContent = await fs.readFile(pomPath, 'utf8');

  // Find build/plugins section
  let buildMatch = pomContent.match(/<build>([\s\S]*?)<\/build>/);

  if (!buildMatch) {
    // Create build section if it doesn't exist
    const projectEndTag = '</project>';
    const buildSection = `
  <build>
    <plugins>
      ${formatPlugin(plugin)}
    </plugins>
  </build>
`;
    pomContent = pomContent.replace(projectEndTag, buildSection + projectEndTag);
  } else {
    let pluginsMatch = buildMatch[1].match(/<plugins>([\s\S]*?)<\/plugins>/);

    if (!pluginsMatch) {
      // Create plugins section if it doesn't exist
      const buildContent = buildMatch[1];
      const newBuildContent = buildContent + `
    <plugins>
      ${formatPlugin(plugin)}
    </plugins>`;
      pomContent = pomContent.replace(buildMatch[0], `<build>${newBuildContent}</build>`);
    } else {
      // Add to existing plugins
      const pluginsContent = pluginsMatch[1];
      const newPluginsContent = pluginsContent + formatPlugin(plugin);
      pomContent = pomContent.replace(pluginsMatch[0], `<plugins>${newPluginsContent}</plugins>`);
    }
  }

  await fs.writeFile(pomPath, pomContent, 'utf8');
}

/**
 * Format plugin for XML insertion
 * @param {object} plugin - Plugin object
 * @returns {string} Formatted XML
 */
function formatPlugin(plugin) {
  const { groupId, artifactId, version, configuration, executions } = plugin;

  let xml = `
      <plugin>
        <groupId>${groupId}</groupId>
        <artifactId>${artifactId}</artifactId>`;

  if (version) {
    xml += `
        <version>${version}</version>`;
  }

  if (configuration) {
    xml += `
        <configuration>
          ${formatConfiguration(configuration)}
        </configuration>`;
  }

  if (executions && executions.length > 0) {
    xml += `
        <executions>`;
    executions.forEach(execution => {
      xml += formatExecution(execution);
    });
    xml += `
        </executions>`;
  }

  xml += `
      </plugin>`;

  return xml;
}

/**
 * Format plugin configuration
 * @param {object} config - Configuration object
 * @returns {string} Formatted XML
 */
function formatConfiguration(config) {
  let xml = '';

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      xml += `
          <${key}>
            ${formatConfiguration(value)}
          </${key}>`;
    } else if (Array.isArray(value)) {
      xml += `
          <${key}>`;
      value.forEach(item => {
        xml += `
            <item>${item}</item>`;
      });
      xml += `
          </${key}>`;
    } else {
      xml += `
          <${key}>${value}</${key}>`;
    }
  }

  return xml;
}

/**
 * Format plugin execution
 * @param {object} execution - Execution object
 * @returns {string} Formatted XML
 */
function formatExecution(execution) {
  const { id, phase, goals, configuration } = execution;

  let xml = `
          <execution>`;

  if (id) {
    xml += `
            <id>${id}</id>`;
  }

  if (phase) {
    xml += `
            <phase>${phase}</phase>`;
  }

  if (goals && goals.length > 0) {
    xml += `
            <goals>`;
    goals.forEach(goal => {
      xml += `
              <goal>${goal}</goal>`;
    });
    xml += `
            </goals>`;
  }

  if (configuration) {
    xml += `
            <configuration>
              ${formatConfiguration(configuration)}
            </configuration>`;
  }

  xml += `
          </execution>`;

  return xml;
}

/**
 * Run Maven command
 * @param {string} command - Maven command (e.g., 'clean compile')
 * @param {object} options - Execution options
 */
async function runMavenCommand(command, options = {}) {
  const { cwd = process.cwd(), silent = false } = options;

  const args = command.split(' ');

  const execOptions = {
    cwd,
    stdio: silent ? 'pipe' : 'inherit'
  };

  try {
    const result = await execa('mvn', args, execOptions);
    return {
      success: true,
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

/**
 * Install dependencies using Maven
 * @param {string} projectPath - Path to Maven project
 */
async function installDependencies(projectPath) {
  return await runMavenCommand('dependency:resolve', { cwd: projectPath });
}

/**
 * Build Maven project
 * @param {string} projectPath - Path to Maven project
 * @param {object} options - Build options
 */
async function buildProject(projectPath, options = {}) {
  const { skipTests = false, clean = true } = options;

  let command = clean ? 'clean compile' : 'compile';

  if (skipTests) {
    command += ' -DskipTests';
  }

  return await runMavenCommand(command, { cwd: projectPath });
}

/**
 * Run tests using Maven
 * @param {string} projectPath - Path to Maven project
 * @param {object} options - Test options
 */
async function runTests(projectPath, options = {}) {
  const { testClass, profile } = options;

  let command = 'test';

  if (testClass) {
    command += ` -Dtest=${testClass}`;
  }

  if (profile) {
    command += ` -P${profile}`;
  }

  return await runMavenCommand(command, { cwd: projectPath });
}

/**
 * Package Maven project
 * @param {string} projectPath - Path to Maven project
 * @param {object} options - Package options
 */
async function packageProject(projectPath, options = {}) {
  const { skipTests = false } = options;

  let command = 'package';

  if (skipTests) {
    command += ' -DskipTests';
  }

  return await runMavenCommand(command, { cwd: projectPath });
}

/**
 * Get common Spring Boot dependencies
 * @returns {Array} Array of common dependencies
 */
function getCommonSpringBootDependencies() {
  return [
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-web'
    },
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-data-jpa'
    },
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-security'
    },
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-validation'
    },
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-actuator'
    },
    {
      groupId: 'org.springframework.boot',
      artifactId: 'spring-boot-starter-test',
      scope: 'test'
    }
  ];
}

/**
 * Get database-specific dependencies
 * @param {string} database - Database type
 * @returns {Array} Array of database dependencies
 */
function getDatabaseDependencies(database) {
  const dependencies = {
    postgresql: [
      {
        groupId: 'org.postgresql',
        artifactId: 'postgresql'
      }
    ],
    mysql: [
      {
        groupId: 'mysql',
        artifactId: 'mysql-connector-java'
      }
    ],
    h2: [
      {
        groupId: 'com.h2database',
        artifactId: 'h2',
        scope: 'runtime'
      }
    ]
  };

  return dependencies[database] || [];
}

/**
 * Get Apache Camel dependencies
 * @returns {Array} Array of Camel dependencies
 */
function getCamelDependencies() {
  return [
    {
      groupId: 'org.apache.camel.springboot',
      artifactId: 'camel-spring-boot-starter'
    },
    {
      groupId: 'org.apache.camel.springboot',
      artifactId: 'camel-http-starter'
    },
    {
      groupId: 'org.apache.camel.springboot',
      artifactId: 'camel-jackson-starter'
    }
  ];
}

/**
 * Get testing dependencies
 * @returns {Array} Array of testing dependencies
 */
function getTestingDependencies() {
  return [
    {
      groupId: 'org.testcontainers',
      artifactId: 'testcontainers',
      scope: 'test'
    },
    {
      groupId: 'org.testcontainers',
      artifactId: 'postgresql',
      scope: 'test'
    },
    {
      groupId: 'com.tngtech.archunit',
      artifactId: 'archunit-junit5',
      scope: 'test'
    }
  ];
}

module.exports = {
  isMavenAvailable,
  getMavenVersion,
  createMavenProject,
  addDependency,
  addDependencies,
  addPlugin,
  runMavenCommand,
  installDependencies,
  buildProject,
  runTests,
  packageProject,
  getCommonSpringBootDependencies,
  getDatabaseDependencies,
  getCamelDependencies,
  getTestingDependencies
};