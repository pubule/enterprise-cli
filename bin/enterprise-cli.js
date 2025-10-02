#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');

// Import configuration
const { FRAMEWORK_VERSION } = require('../src/config');

// Import commands
const { generateCommand } = require('../src/commands/generate');
const frontendCommand = require('../src/commands/frontend');
const devCommand = require('../src/commands/dev');
const { initCommand } = require('../src/commands/init');
const { statusCommand } = require('../src/commands/status');

const program = new Command();

// Display ASCII banner
console.log(
  chalk.cyan(
    figlet.textSync('ENTERPRISE CLI', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    })
  )
);

console.log(chalk.gray('─'.repeat(80)));
console.log(chalk.white('Enterprise-grade CLI for generating full-stack applications'));
console.log(chalk.gray('─'.repeat(80)));
console.log();

// Setup Commander
program
  .name('enterprise-cli')
  .description('CLI tool for generating enterprise applications')
  .version('1.0.0', '-v, --version', 'Display version number');

// Init command
program
  .command('init')
  .description('Initialize Enterprise CLI workspace')
  .action(initCommand);

// Status command
program
  .command('status')
  .description('Show Enterprise CLI workspace status')
  .action(statusCommand);

program
  .command('generate')
  .alias('gen')
  .description('Generate Spring Boot microservice with Enterprise Framework')
  .argument('[service-name]', 'Name of the microservice (kebab-case)')
  .option('-d, --domain <domain>', 'Business domain (e.g., user, order, product)')
  .option('-p, --package <package>', 'Java package name (e.g., com.company.domain)')
  .option('-e, --entities <entities>', 'Comma-separated entity names (PascalCase)')
  .option('--database <db>', 'Database type (postgresql, mysql, h2)', 'postgresql')
  .option('--framework-version <version>', 'Enterprise Framework version', FRAMEWORK_VERSION)
  .option('--auth', 'Include OAuth2 authentication', true)
  .option('--no-auth', 'Exclude OAuth2 authentication')
  .option('--camel', 'Include Apache Camel integration', true)
  .option('--no-camel', 'Exclude Apache Camel integration')
  .option('--docker', 'Generate Docker configuration', true)
  .option('--no-docker', 'Exclude Docker configuration')
  .option('--k8s', 'Generate Kubernetes manifests', true)
  .option('--no-k8s', 'Exclude Kubernetes manifests')
  .action(generateCommand);

// Frontend command group
const frontend = program
  .command('frontend')
  .alias('fe')
  .description('React frontend application management');

frontend
  .command('create')
  .description('Create a new React application')
  .argument('[app-name]', 'Name of the React application (kebab-case)')
  .option('-t, --template <template>', 'UI framework template (material-ui, ant-design, chakra-ui, none)', 'material-ui')
  .option('--typescript', 'Use TypeScript', true)
  .option('--no-typescript', 'Use JavaScript instead of TypeScript')
  .option('--redux', 'Include Redux Toolkit', true)
  .option('--no-redux', 'Exclude Redux Toolkit')
  .option('--router', 'Include React Router', true)
  .option('--no-router', 'Exclude React Router')
  .action(frontendCommand.create);

frontend
  .command('build')
  .description('Build React application for production')
  .option('-e, --environment <env>', 'Target environment (development, production)', 'production')
  .option('--sourcemap', 'Generate source maps', false)
  .action(frontendCommand.build);

frontend
  .command('test')
  .description('Run tests for React application')
  .option('--coverage', 'Generate test coverage report', false)
  .action(frontendCommand.test);

// Dev command group
const dev = program
  .command('dev')
  .description('Development environment management');

dev
  .command('setup')
  .description('Setup development environment')
  .option('--backend', 'Setup backend only (Java, Maven)')
  .option('--frontend', 'Setup frontend only (Node.js, NPM)')
  .option('--docker', 'Start Docker services (PostgreSQL, etc.)')
  .action(devCommand.setup);

dev
  .command('start')
  .description('Start development servers')
  .option('--backend', 'Start backend server only')
  .option('--frontend', 'Start frontend server only')
  .option('--full-stack', 'Start both backend and frontend servers')
  .option('--profile <profile>', 'Spring Boot profile to use', 'dev')
  .action(devCommand.start);

dev
  .command('stop')
  .description('Stop all development servers')
  .action(devCommand.stop);

dev
  .command('logs')
  .description('Show development server logs')
  .option('--backend', 'Show backend logs only')
  .option('--frontend', 'Show frontend logs only')
  .option('--follow', 'Follow logs in real-time', true)
  .option('--no-follow', 'Show logs without following')
  .action(devCommand.logs);

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
