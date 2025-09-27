#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs-extra');
const path = require('path');

// Import command modules
const generateCommand = require('../src/commands/generate');
const frontendCommand = require('../src/commands/frontend');
const devCommand = require('../src/commands/dev');
const testCommand = require('../src/commands/test');
const deployCommand = require('../src/commands/deploy');

const program = new Command();

// Display ASCII banner
function displayBanner() {
  console.log(
    chalk.cyan(
      figlet.textSync('Enterprise CLI', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted',
        width: 120,
        whitespaceBreak: true
      })
    )
  );
  console.log(chalk.gray('🚀 Full-Stack Application Generator for Enterprise Development\n'));
}

// Get package version
function getVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = fs.readJsonSync(packagePath);
    return packageJson.version;
  }
  return '1.0.0';
}

// Main CLI setup
async function main() {
  try {
    displayBanner();

    program
      .name('enterprise')
      .description('Enterprise CLI - Automate full-stack application generation')
      .version(getVersion(), '-v, --version', 'display version number')
      .helpOption('-h, --help', 'display help for command');

    // Backend generation command
    program
      .command('generate')
      .alias('gen')
      .description('Generate Spring Boot microservice with enterprise patterns')
      .argument('[service-name]', 'name of the microservice to generate')
      .option('-d, --domain <domain>', 'business domain for the service')
      .option('-p, --package <package>', 'Java package name (e.g., com.company.domain)')
      .option('-e, --entities <entities>', 'comma-separated list of entities to generate')
      .option('--database <db>', 'database type (postgresql, mysql, h2)', 'postgresql')
      .option('--auth', 'include OAuth2 authentication', true)
      .option('--camel', 'include Apache Camel integration', true)
      .option('--docker', 'generate Docker configuration', true)
      .option('--k8s', 'generate Kubernetes manifests', true)
      .action(generateCommand);

    // Frontend management commands
    const frontend = program
      .command('frontend')
      .alias('fe')
      .description('React frontend application management');

    frontend
      .command('create')
      .description('Create a new React application')
      .argument('[app-name]', 'name of the React application')
      .option('-t, --template <template>', 'UI template (material-ui, ant-design)', 'material-ui')
      .option('--typescript', 'use TypeScript (default: true)', true)
      .option('--redux', 'include Redux Toolkit (default: true)', true)
      .option('--router', 'include React Router (default: true)', true)
      .option('--testing', 'include testing setup (Jest/Cypress)', true)
      .action(frontendCommand.create);

    frontend
      .command('build')
      .description('Build React application for deployment')
      .option('-e, --environment <env>', 'target environment (dev, staging, production)', 'production')
      .option('--analyze', 'analyze bundle size')
      .option('--sourcemap', 'generate source maps', false)
      .action(frontendCommand.build);

    frontend
      .command('test')
      .description('Run frontend tests')
      .option('--unit', 'run unit tests only')
      .option('--e2e', 'run E2E tests only')
      .option('--coverage', 'generate coverage report')
      .option('--watch', 'run tests in watch mode')
      .action(frontendCommand.test);

    // Development commands
    const dev = program
      .command('dev')
      .description('Development environment management');

    dev
      .command('setup')
      .description('Setup development environment')
      .option('--backend', 'setup backend only')
      .option('--frontend', 'setup frontend only')
      .option('--docker', 'start required Docker services')
      .action(devCommand.setup);

    dev
      .command('start')
      .description('Start development servers')
      .option('--backend', 'start backend only')
      .option('--frontend', 'start frontend only')
      .option('--full-stack', 'start both backend and frontend')
      .option('--debug', 'enable debug mode')
      .option('--profile <profile>', 'Spring profile to use', 'dev')
      .action(devCommand.start);

    dev
      .command('stop')
      .description('Stop development servers')
      .action(devCommand.stop);

    dev
      .command('logs')
      .description('View development server logs')
      .option('--backend', 'show backend logs only')
      .option('--frontend', 'show frontend logs only')
      .option('--follow', 'follow log output', true)
      .action(devCommand.logs);

    // Testing commands
    program
      .command('test')
      .description('Run comprehensive test suites')
      .option('--unit', 'run unit tests only')
      .option('--integration', 'run integration tests only')
      .option('--e2e', 'run E2E tests only')
      .option('--coverage', 'generate coverage reports')
      .option('--backend', 'test backend only')
      .option('--frontend', 'test frontend only')
      .action(testCommand);

    // Deployment commands
    program
      .command('deploy')
      .description('Deploy applications to target environment')
      .option('-e, --environment <env>', 'target environment (dev, staging, production)', 'staging')
      .option('--backend', 'deploy backend only')
      .option('--frontend', 'deploy frontend only')
      .option('--dry-run', 'show what would be deployed without executing')
      .action(deployCommand);

    // Additional utility commands
    program
      .command('init')
      .description('Initialize enterprise CLI in current directory')
      .option('--full-stack', 'initialize both backend and frontend')
      .action(async (options) => {
        console.log(chalk.green('🚀 Initializing Enterprise CLI workspace...'));
        console.log(chalk.gray('This will create configuration files and directory structure.'));

        // Create .enterprise directory with configuration
        await fs.ensureDir('.enterprise');
        const config = {
          version: getVersion(),
          workspace: {
            type: options.fullStack ? 'full-stack' : 'backend',
            backend: {
              type: 'spring-boot',
              java: '17',
              springBoot: '3.2.0'
            },
            frontend: options.fullStack ? {
              type: 'react',
              typescript: true,
              framework: 'react',
              version: '18'
            } : null
          },
          createdAt: new Date().toISOString()
        };

        await fs.writeJson('.enterprise/config.json', config, { spaces: 2 });
        console.log(chalk.green('✅ Enterprise CLI workspace initialized successfully!'));
      });

    program
      .command('status')
      .description('Show status of current workspace')
      .action(async () => {
        const configPath = '.enterprise/config.json';
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          console.log(chalk.cyan('📊 Enterprise CLI Workspace Status\n'));
          console.log(`${chalk.bold('Version:')} ${config.version}`);
          console.log(`${chalk.bold('Type:')} ${config.workspace.type}`);
          console.log(`${chalk.bold('Created:')} ${new Date(config.createdAt).toLocaleDateString()}`);

          if (config.workspace.backend) {
            console.log(`\n${chalk.yellow('Backend Configuration:')}`);
            console.log(`  Type: ${config.workspace.backend.type}`);
            console.log(`  Java: ${config.workspace.backend.java}`);
            console.log(`  Spring Boot: ${config.workspace.backend.springBoot}`);
          }

          if (config.workspace.frontend) {
            console.log(`\n${chalk.blue('Frontend Configuration:')}`);
            console.log(`  Type: ${config.workspace.frontend.type}`);
            console.log(`  TypeScript: ${config.workspace.frontend.typescript}`);
            console.log(`  Framework: ${config.workspace.frontend.framework}`);
          }
        } else {
          console.log(chalk.yellow('⚠️  No Enterprise CLI workspace found in current directory'));
          console.log(chalk.gray('Run "enterprise init" to initialize a workspace'));
        }
      });

    // Error handling
    program.configureOutput({
      writeErr: (str) => process.stderr.write(chalk.red(str))
    });

    // Parse command line arguments
    await program.parseAsync(process.argv);

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\n❌ Unhandled Rejection:'), error.message);
  if (process.env.DEBUG) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Uncaught Exception:'), error.message);
  if (process.env.DEBUG) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main };