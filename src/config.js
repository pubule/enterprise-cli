/**
 * Enterprise CLI Configuration
 * Central configuration file for CLI and Framework versions
 */

const packageJson = require('../package.json');

module.exports = {
  // CLI Version
  CLI_VERSION: packageJson.version,

  // Enterprise Framework Version
  FRAMEWORK_VERSION: '2.0.0',

  // CLI Info
  CLI_NAME: 'Enterprise CLI',
  CLI_DESCRIPTION: 'Enterprise-grade CLI for generating full-stack applications',

  // Default Values
  DEFAULTS: {
    database: 'postgresql',
    auth: true,
    camel: true,
    flyway: true,
    openApi: true,
    docker: true,
    k8s: true,
    typescript: true,
    redux: true,
    router: true,
    uiFramework: 'material-ui',
    buildTool: 'vite',
    springBootVersion: '3.2.0',
    javaVersion: '17',
    nodeVersion: '18',
    pageSize: 20,
    maxPageSize: 100
  },

  // Supported Options
  SUPPORTED: {
    databases: ['postgresql', 'mysql', 'h2'],
    uiFrameworks: ['material-ui', 'ant-design', 'chakra-ui', 'none'],
    buildTools: ['vite', 'webpack', 'cra']
  },

  // Paths
  PATHS: {
    templates: 'templates',
    microserviceSkeleton: 'templates/microservice-skeleton',
    reactSkeleton: 'templates/react-skeleton',
    workspace: '.enterprise',
    customTemplates: 'templates/custom'
  }
};
