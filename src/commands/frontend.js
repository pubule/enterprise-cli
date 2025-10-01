/**
 * Frontend Command
 * Creates and manages React applications with modern tooling
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

const validation = require('../utils/validation');
const { generateFromTemplate } = require('../utils/file-generator');

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Validates API URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function validateApiUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Build template variables from user answers
 * @param {object} answers - User answers from prompts
 * @returns {object} - Template variables for mustache
 */
function buildTemplateVars(answers) {
  const {
    appName,
    uiFramework,
    features,
    buildTool,
    apiBaseUrl,
    authType
  } = answers;

  // App name transformations
  const appNamePascalCase = validation.toPascalCase(appName);
  const appNameCamelCase = validation.toCamelCase(appName);

  // Feature flags
  const hasTypeScript = features.includes('TypeScript');
  const hasRedux = features.includes('Redux Toolkit + RTK Query');
  const hasRouter = features.includes('React Router v6');
  const hasReactHookForm = features.includes('React Hook Form');
  const hasReactQuery = features.includes('React Query (TanStack)');
  const hasCypress = features.includes('Cypress E2E');
  const hasESLint = features.includes('ESLint + Prettier');
  const hasStorybook = features.includes('Storybook');
  const hasPWA = features.includes('PWA Support');

  // UI Framework flags
  const isMaterialUI = uiFramework === 'material-ui';
  const isAntDesign = uiFramework === 'ant-design';
  const isChakraUI = uiFramework === 'chakra-ui';
  const hasUIFramework = uiFramework !== 'none';

  // Build tool flags
  const isVite = buildTool === 'vite';
  const isCRA = buildTool === 'cra';
  const isWebpack = buildTool === 'webpack';

  // Auth flags
  const isJWTLocal = authType === 'jwt-local';
  const isJWTCookie = authType === 'jwt-cookie';
  const isOAuth2 = authType === 'oauth2';
  const hasAuth = authType !== 'none';

  // File extensions based on TypeScript
  const fileExt = hasTypeScript ? 'tsx' : 'jsx';
  const scriptExt = hasTypeScript ? 'ts' : 'js';

  return {
    // Basic information
    appName,
    appNamePascalCase,
    appNameCamelCase,
    uiFramework,
    buildTool,
    apiBaseUrl,
    authType,

    // Feature flags
    hasTypeScript,
    hasRedux,
    hasRouter,
    hasReactHookForm,
    hasReactQuery,
    hasCypress,
    hasESLint,
    hasStorybook,
    hasPWA,

    // UI Framework flags
    isMaterialUI,
    isAntDesign,
    isChakraUI,
    hasUIFramework,

    // Build tool flags
    isVite,
    isCRA,
    isWebpack,

    // Auth flags
    isJWTLocal,
    isJWTCookie,
    isOAuth2,
    hasAuth,

    // File extensions
    fileExt,
    scriptExt,

    // Current year for copyright headers
    year: new Date().getFullYear()
  };
}

/**
 * Validates user inputs for React app creation
 * @param {object} answers - User answers to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validateInputs(answers) {
  const errors = [];

  // Validate app name
  if (!validation.isValidAppName(answers.appName)) {
    errors.push('App name must be kebab-case, 2-50 characters (e.g., "my-react-app")');
  }

  // Check if directory already exists
  const outputPath = path.join(process.cwd(), answers.appName);
  if (fs.existsSync(outputPath)) {
    errors.push(`Directory "${answers.appName}" already exists. Please choose a different name or remove the existing directory.`);
  }

  // Validate API URL
  if (!validateApiUrl(answers.apiBaseUrl)) {
    errors.push('API base URL must be a valid HTTP/HTTPS URL (e.g., "http://localhost:8080/api/v1")');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get interactive prompts for missing parameters
 * @param {string} appName - App name from CLI args
 * @param {object} options - Options from CLI flags
 * @returns {Promise<object>} - Complete answers
 */
async function getInteractiveAnswers(appName, options) {
  const questions = [];

  // App name
  if (!appName) {
    questions.push({
      type: 'input',
      name: 'appName',
      message: 'React application name (kebab-case):',
      validate: (input) => {
        if (!input) return 'App name is required';
        if (!validation.isValidAppName(input)) {
          return 'App name must be kebab-case, 2-50 characters (e.g., "my-react-app")';
        }
        return true;
      }
    });
  }

  // UI Framework
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'uiFramework',
      message: 'UI Framework:',
      choices: [
        { name: 'Material-UI', value: 'material-ui' },
        { name: 'Ant Design', value: 'ant-design' },
        { name: 'Chakra UI', value: 'chakra-ui' },
        { name: 'None (Plain CSS)', value: 'none' }
      ],
      default: 'material-ui'
    });
  }

  // Features
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: 'Select features to include:',
    choices: [
      {
        name: 'TypeScript',
        value: 'TypeScript',
        checked: options.typescript !== false
      },
      {
        name: 'Redux Toolkit + RTK Query',
        value: 'Redux Toolkit + RTK Query',
        checked: options.redux !== false
      },
      {
        name: 'React Router v6',
        value: 'React Router v6',
        checked: options.router !== false
      },
      {
        name: 'React Hook Form',
        value: 'React Hook Form',
        checked: true
      },
      {
        name: 'React Query (TanStack)',
        value: 'React Query (TanStack)',
        checked: true
      },
      {
        name: 'Cypress E2E',
        value: 'Cypress E2E',
        checked: true
      },
      {
        name: 'ESLint + Prettier',
        value: 'ESLint + Prettier',
        checked: true
      },
      {
        name: 'Storybook',
        value: 'Storybook',
        checked: false
      },
      {
        name: 'PWA Support',
        value: 'PWA Support',
        checked: false
      }
    ]
  });

  // Build tool
  questions.push({
    type: 'list',
    name: 'buildTool',
    message: 'Build tool:',
    choices: [
      { name: 'Vite (Recommended)', value: 'vite' },
      { name: 'Create React App', value: 'cra' },
      { name: 'Webpack 5', value: 'webpack' }
    ],
    default: 'vite'
  });

  // API Base URL
  questions.push({
    type: 'input',
    name: 'apiBaseUrl',
    message: 'API base URL:',
    default: 'http://localhost:8080/api/v1',
    validate: (input) => {
      if (!validateApiUrl(input)) {
        return 'Must be a valid HTTP/HTTPS URL';
      }
      return true;
    }
  });

  // Auth type
  questions.push({
    type: 'list',
    name: 'authType',
    message: 'Authentication type:',
    choices: [
      { name: 'JWT (LocalStorage)', value: 'jwt-local' },
      { name: 'JWT (Cookie)', value: 'jwt-cookie' },
      { name: 'OAuth2', value: 'oauth2' },
      { name: 'None', value: 'none' }
    ],
    default: 'jwt-local'
  });

  // Get answers from prompts
  const answers = await inquirer.prompt(questions);

  // Merge with provided options and arguments
  return {
    appName: appName || answers.appName,
    uiFramework: options.template || answers.uiFramework || 'material-ui',
    features: answers.features, // Always from prompts
    buildTool: answers.buildTool || 'vite',
    apiBaseUrl: answers.apiBaseUrl || 'http://localhost:8080/api/v1',
    authType: answers.authType || 'jwt-local'
  };
}

/**
 * Show completion message with next steps
 * @param {string} appName - Generated app name
 * @param {object} templateVars - Template variables used
 */
function showCompletionMessage(appName, templateVars) {
  const { buildTool, uiFramework, hasTypeScript, hasRedux, hasRouter } = templateVars;

  console.log();
  console.log(chalk.green.bold('✅ React application created successfully!'));
  console.log();
  console.log(chalk.cyan.bold('📦 Configuration:'));
  console.log(chalk.gray(`  - Build Tool: ${buildTool}`));
  console.log(chalk.gray(`  - UI Framework: ${uiFramework}`));
  console.log(chalk.gray(`  - TypeScript: ${hasTypeScript ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  - Redux Toolkit: ${hasRedux ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  - React Router: ${hasRouter ? 'Yes' : 'No'}`));
  console.log();
  console.log(chalk.white.bold('Next steps:'));
  console.log(chalk.gray(`  1. cd ${appName}`));
  console.log(chalk.gray('  2. npm install'));
  console.log(chalk.gray('  3. npm run dev (or npm start)'));
  console.log();
  console.log(chalk.yellow.bold('💡 To build for production:'));
  console.log(chalk.gray('   enterprise frontend build'));
  console.log();
  console.log(chalk.yellow.bold('💡 To run tests:'));
  console.log(chalk.gray('   enterprise frontend test'));
  console.log();
}

// ========================================
// MAIN FUNCTIONS
// ========================================

/**
 * Create React application
 * @param {string} appName - App name (optional, from CLI args)
 * @param {object} options - Command options
 */
async function createReactApp(appName, options = {}) {
  try {
    console.log(chalk.cyan.bold('\n⚛️  React Application Generator\n'));

    // Get complete answers (interactive + CLI options)
    const answers = await getInteractiveAnswers(appName, options);

    // Validate inputs
    const spinner = ora('Validating inputs...').start();
    const validationResult = validateInputs(answers);

    if (!validationResult.valid) {
      spinner.fail('Validation failed');
      console.log();
      validationResult.errors.forEach(error => {
        console.log(chalk.red(`  ✗ ${error}`));
      });
      console.log();
      process.exit(1);
    }

    spinner.succeed('Validation passed');

    // Build template variables
    const templateVars = buildTemplateVars(answers);

    // Create output directory
    const outputPath = path.join(process.cwd(), answers.appName);
    await fs.ensureDir(outputPath);

    // Generate from template
    const genSpinner = ora('Generating React application from template...').start();

    try {
      const result = await generateFromTemplate(
        'react-skeleton',
        outputPath,
        templateVars
      );

      genSpinner.succeed(`Generated ${result.filesGenerated} files`);

      // Show completion message
      showCompletionMessage(answers.appName, templateVars);

    } catch (error) {
      genSpinner.fail('Failed to generate React application');
      throw error;
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Generation failed:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();

    if (process.env.DEBUG) {
      console.log(chalk.gray(error.stack));
    }

    process.exit(1);
  }
}

/**
 * Build React application for production
 * @param {object} options - Command options
 */
async function buildReactApp(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n🔨 Building React Application\n'));

    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red('❌ package.json not found in current directory'));
      console.log(chalk.yellow('   Make sure you are in the React application root directory'));
      process.exit(1);
    }

    // Read package.json to verify it's a React project
    const packageJson = await fs.readJson(packageJsonPath);
    if (!packageJson.dependencies || !packageJson.dependencies.react) {
      console.log(chalk.yellow('⚠️  Warning: This does not appear to be a React project'));
    }

    // Determine build command
    const buildCommand = packageJson.scripts?.build || 'build';

    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: options.environment || 'production',
      GENERATE_SOURCEMAP: options.sourcemap ? 'true' : 'false'
    };

    console.log(chalk.gray(`Environment: ${env.NODE_ENV}`));
    console.log(chalk.gray(`Source maps: ${options.sourcemap ? 'enabled' : 'disabled'}`));
    console.log();

    // Start build spinner
    const spinner = ora('Building application...').start();

    // Run build command
    return new Promise((resolve, reject) => {
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const buildProcess = spawn(npm, ['run', buildCommand], {
        cwd: process.cwd(),
        env,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      buildProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      buildProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          spinner.succeed('Build completed successfully');
          console.log();
          console.log(chalk.green.bold('✅ Production build ready!'));
          console.log(chalk.gray('   Check the build/ or dist/ directory for output'));
          console.log();
          resolve();
        } else {
          spinner.fail('Build failed');
          console.log();
          console.log(chalk.red.bold('❌ Build failed with errors:'));
          console.log(chalk.gray(errorOutput || output));
          console.log();
          reject(new Error('Build process failed'));
        }
      });

      buildProcess.on('error', (error) => {
        spinner.fail('Build failed');
        console.log();
        console.log(chalk.red.bold('❌ Failed to start build process:'));
        console.log(chalk.red(`   ${error.message}`));
        console.log();
        reject(error);
      });
    });

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Build failed:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Run tests for React application
 * @param {object} options - Command options
 */
async function testReactApp(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n🧪 Running Tests\n'));

    // Check if package.json exists
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(chalk.red('❌ package.json not found in current directory'));
      console.log(chalk.yellow('   Make sure you are in the React application root directory'));
      process.exit(1);
    }

    // Read package.json
    const packageJson = await fs.readJson(packageJsonPath);

    // Check if test script exists
    if (!packageJson.scripts?.test) {
      console.log(chalk.yellow('⚠️  No test script found in package.json'));
      console.log(chalk.gray('   Add a "test" script to package.json to enable testing'));
      process.exit(0);
    }

    // Set environment variables
    const env = {
      ...process.env,
      CI: 'true', // Run in CI mode (non-interactive)
      ...(options.coverage && { COVERAGE: 'true' })
    };

    console.log(chalk.gray(`Coverage: ${options.coverage ? 'enabled' : 'disabled'}`));
    console.log();

    // Start test spinner
    const spinner = ora('Running tests...').start();

    // Run test command
    return new Promise((resolve, reject) => {
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const args = ['test'];

      if (options.coverage) {
        args.push('--', '--coverage');
      }

      const testProcess = spawn(npm, args, {
        cwd: process.cwd(),
        env,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          spinner.succeed('All tests passed');
          console.log();
          console.log(chalk.green.bold('✅ Tests completed successfully!'));

          if (options.coverage) {
            console.log(chalk.gray('   Coverage report generated in coverage/ directory'));
          }
          console.log();

          // Show test summary from output
          const lines = output.split('\n');
          const summaryLines = lines.filter(line =>
            line.includes('Tests:') ||
            line.includes('Snapshots:') ||
            line.includes('Time:')
          );

          if (summaryLines.length > 0) {
            console.log(chalk.cyan('Test Summary:'));
            summaryLines.forEach(line => {
              console.log(chalk.gray(`  ${line.trim()}`));
            });
            console.log();
          }

          resolve();
        } else {
          spinner.fail('Tests failed');
          console.log();
          console.log(chalk.red.bold('❌ Some tests failed:'));
          console.log(chalk.gray(output || errorOutput));
          console.log();
          reject(new Error('Test execution failed'));
        }
      });

      testProcess.on('error', (error) => {
        spinner.fail('Tests failed');
        console.log();
        console.log(chalk.red.bold('❌ Failed to start test process:'));
        console.log(chalk.red(`   ${error.message}`));
        console.log();
        reject(error);
      });
    });

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Tests failed:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  create: createReactApp,
  build: buildReactApp,
  test: testReactApp
};
