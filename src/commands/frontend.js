const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

const fileGenerator = require('../utils/file-generator');
const validation = require('../utils/validation');
const npmUtils = require('../utils/npm-utils');

/**
 * Frontend command handlers
 */
const frontendCommand = {
  create: createReactApp,
  build: buildReactApp,
  test: testReactApp
};

/**
 * Create a new React application with enterprise patterns
 */
async function createReactApp(appName, options) {
  console.log(chalk.blue('\n⚛️  Enterprise React Application Generator\n'));

  try {
    // Interactive prompts if appName not provided
    const answers = await collectAppInformation(appName, options);

    // Validate inputs
    await validateInputs(answers);

    // Generate React application
    await generateReactApp(answers);

    console.log(chalk.green('\n✅ React application generated successfully!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.white('  1. cd ' + answers.appName));
    console.log(chalk.white('  2. npm install'));
    console.log(chalk.white('  3. enterprise dev start --frontend'));

  } catch (error) {
    console.error(chalk.red('\n❌ Generation failed:'), error.message);
    if (process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

/**
 * Build React application for deployment
 */
async function buildReactApp(options) {
  console.log(chalk.blue('\n📦 Building React Application\n'));

  const spinner = ora('Building React application...').start();

  try {
    // Check if we're in a React project
    if (!await fs.pathExists('package.json')) {
      throw new Error('No package.json found. Are you in a React project directory?');
    }

    const packageJson = await fs.readJson('package.json');
    if (!packageJson.dependencies || !packageJson.dependencies.react) {
      throw new Error('This doesn\'t appear to be a React project');
    }

    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      GENERATE_SOURCEMAP: options.sourcemap ? 'true' : 'false',
      REACT_APP_BUILD_ENV: options.environment
    };

    // Run build command
    if (packageJson.scripts && packageJson.scripts.build) {
      await execa('npm', ['run', 'build'], { env, stdio: 'pipe' });
    } else if (await fs.pathExists('node_modules/.bin/vite')) {
      await execa('npx', ['vite', 'build'], { env, stdio: 'pipe' });
    } else {
      await execa('npx', ['react-scripts', 'build'], { env, stdio: 'pipe' });
    }

    // Analyze bundle if requested
    if (options.analyze) {
      spinner.text = 'Analyzing bundle size...';
      if (await fs.pathExists('node_modules/.bin/webpack-bundle-analyzer')) {
        await execa('npx', ['webpack-bundle-analyzer', 'build/static/js/*.js'], { stdio: 'inherit' });
      } else {
        console.log(chalk.yellow('\n⚠️  Bundle analyzer not available. Install webpack-bundle-analyzer for analysis.'));
      }
    }

    spinner.succeed(`React application built successfully for ${options.environment}`);

    // Show build info
    if (await fs.pathExists('build')) {
      const stats = await fs.stat('build');
      console.log(chalk.gray(`\nBuild directory: ${path.resolve('build')}`));
      console.log(chalk.gray(`Build completed: ${stats.mtime.toLocaleString()}`));
    }

  } catch (error) {
    spinner.fail('Build failed');
    throw error;
  }
}

/**
 * Run React application tests
 */
async function testReactApp(options) {
  console.log(chalk.blue('\n🧪 Running React Tests\n'));

  try {
    // Check if we're in a React project
    if (!await fs.pathExists('package.json')) {
      throw new Error('No package.json found. Are you in a React project directory?');
    }

    const packageJson = await fs.readJson('package.json');

    if (options.unit || (!options.e2e && !options.unit)) {
      await runUnitTests(packageJson, options);
    }

    if (options.e2e) {
      await runE2ETests(packageJson, options);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Tests failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Run unit tests with Jest
 */
async function runUnitTests(packageJson, options) {
  const spinner = ora('Running unit tests...').start();

  try {
    const args = ['test'];

    if (!options.watch) {
      args.push('--watchAll=false');
    }

    if (options.coverage) {
      args.push('--coverage');
    }

    const env = {
      ...process.env,
      CI: 'true'
    };

    if (packageJson.scripts && packageJson.scripts.test) {
      await execa('npm', ['run', 'test', '--', ...args.slice(1)], { env, stdio: 'inherit' });
    } else {
      await execa('npx', ['react-scripts', ...args], { env, stdio: 'inherit' });
    }

    spinner.succeed('Unit tests completed');

  } catch (error) {
    spinner.fail('Unit tests failed');
    throw error;
  }
}

/**
 * Run E2E tests with Cypress
 */
async function runE2ETests(packageJson, options) {
  const spinner = ora('Running E2E tests...').start();

  try {
    if (await fs.pathExists('cypress.config.js') || await fs.pathExists('cypress')) {
      await execa('npx', ['cypress', 'run'], { stdio: 'inherit' });
      spinner.succeed('E2E tests completed');
    } else {
      spinner.warn('Cypress not configured. Skipping E2E tests.');
    }

  } catch (error) {
    spinner.fail('E2E tests failed');
    throw error;
  }
}

/**
 * Collect application information through interactive prompts
 */
async function collectAppInformation(appName, options) {
  const questions = [];

  // App name
  if (!appName) {
    questions.push({
      type: 'input',
      name: 'appName',
      message: 'What is the name of your React application?',
      validate: (input) => {
        if (!input.trim()) return 'Application name is required';
        if (!validation.isValidAppName(input)) {
          return 'App name must be kebab-case (e.g., user-dashboard, order-management-app)';
        }
        return true;
      },
      filter: (input) => input.trim().toLowerCase()
    });
  }

  // UI framework selection
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'uiFramework',
      message: 'Which UI framework would you like to use?',
      choices: [
        { name: 'Material-UI (recommended for enterprise)', value: 'material-ui' },
        { name: 'Ant Design (comprehensive component library)', value: 'ant-design' },
        { name: 'Chakra UI (simple and modular)', value: 'chakra-ui' },
        { name: 'None (custom CSS)', value: 'none' }
      ],
      default: 'material-ui'
    });
  }

  // Features selection
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: 'Select features to include:',
    choices: [
      { name: 'TypeScript (strongly recommended)', value: 'typescript', checked: options.typescript !== false },
      { name: 'Redux Toolkit + RTK Query', value: 'redux', checked: options.redux !== false },
      { name: 'React Router v6', value: 'router', checked: options.router !== false },
      { name: 'React Hook Form', value: 'forms', checked: true },
      { name: 'React Query (TanStack Query)', value: 'react-query', checked: true },
      { name: 'Testing (Jest + React Testing Library)', value: 'testing', checked: options.testing !== false },
      { name: 'Cypress E2E Testing', value: 'cypress', checked: true },
      { name: 'ESLint + Prettier', value: 'linting', checked: true },
      { name: 'Storybook (component documentation)', value: 'storybook', checked: false },
      { name: 'PWA Support', value: 'pwa', checked: false }
    ],
    validate: (answer) => {
      if (answer.length === 0) {
        return 'You must choose at least one feature.';
      }
      return true;
    }
  });

  // Build tool selection
  questions.push({
    type: 'list',
    name: 'buildTool',
    message: 'Which build tool would you prefer?',
    choices: [
      { name: 'Vite (fast, modern)', value: 'vite' },
      { name: 'Create React App (stable, batteries-included)', value: 'cra' },
      { name: 'Custom Webpack', value: 'webpack' }
    ],
    default: 'vite'
  });

  // API integration
  questions.push({
    type: 'input',
    name: 'apiBaseUrl',
    message: 'API base URL for backend integration?',
    default: 'http://localhost:8080/api/v1',
    validate: (input) => {
      try {
        new URL(input);
        return true;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  });

  // Authentication
  questions.push({
    type: 'list',
    name: 'authType',
    message: 'Authentication method?',
    choices: [
      { name: 'JWT with localStorage', value: 'jwt-local' },
      { name: 'JWT with httpOnly cookies', value: 'jwt-cookie' },
      { name: 'OAuth2 (Google, GitHub, etc.)', value: 'oauth2' },
      { name: 'None (implement later)', value: 'none' }
    ],
    default: 'jwt-local'
  });

  if (questions.length > 0) {
    const answers = await inquirer.prompt(questions);

    return {
      appName: appName || answers.appName,
      uiFramework: options.template || answers.uiFramework,
      features: answers.features || [],
      buildTool: answers.buildTool,
      apiBaseUrl: answers.apiBaseUrl,
      authType: answers.authType,
      ...options
    };
  }

  // Use provided options
  return {
    appName,
    uiFramework: options.template || 'material-ui',
    features: [
      ...(options.typescript !== false ? ['typescript'] : []),
      ...(options.redux !== false ? ['redux'] : []),
      ...(options.router !== false ? ['router'] : []),
      ...(options.testing !== false ? ['testing'] : []),
      'forms', 'react-query', 'cypress', 'linting'
    ],
    buildTool: 'vite',
    apiBaseUrl: 'http://localhost:8080/api/v1',
    authType: 'jwt-local',
    ...options
  };
}

/**
 * Validate all inputs
 */
async function validateInputs(answers) {
  const spinner = ora('Validating inputs...').start();

  try {
    // Check if directory already exists
    if (await fs.pathExists(answers.appName)) {
      throw new Error(`Directory '${answers.appName}' already exists`);
    }

    // Validate app name
    if (!validation.isValidAppName(answers.appName)) {
      throw new Error('Invalid application name format');
    }

    // Validate API URL
    try {
      new URL(answers.apiBaseUrl);
    } catch {
      throw new Error('Invalid API base URL');
    }

    spinner.succeed('Inputs validated successfully');
  } catch (error) {
    spinner.fail('Input validation failed');
    throw error;
  }
}

/**
 * Generate the complete React application
 */
async function generateReactApp(answers) {
  const spinner = ora('Generating React application...').start();

  try {
    // Create project directory
    await fs.ensureDir(answers.appName);
    process.chdir(answers.appName);

    // Generate template variables
    const templateVars = createTemplateVariables(answers);

    // Generate project structure based on build tool
    if (answers.buildTool === 'vite') {
      await generateViteProject(templateVars);
    } else if (answers.buildTool === 'cra') {
      await generateCRAProject(templateVars);
    } else {
      await generateWebpackProject(templateVars);
    }

    // Generate package.json
    await generatePackageJson(templateVars);

    // Generate configuration files
    await generateConfigFiles(templateVars);

    // Generate source code structure
    await generateSourceStructure(templateVars);

    // Generate components
    await generateComponents(templateVars);

    // Generate Redux store if enabled
    if (templateVars.hasRedux) {
      await generateReduxStore(templateVars);
    }

    // Generate routing if enabled
    if (templateVars.hasRouter) {
      await generateRouting(templateVars);
    }

    // Generate testing setup
    if (templateVars.hasTesting) {
      await generateTestingSetup(templateVars);
    }

    // Generate Cypress setup
    if (templateVars.hasCypress) {
      await generateCypressSetup(templateVars);
    }

    // Generate Storybook setup
    if (templateVars.hasStorybook) {
      await generateStorybookSetup(templateVars);
    }

    // Generate README
    await generateReadme(templateVars);

    spinner.succeed('React application generated successfully');
  } catch (error) {
    spinner.fail('Project generation failed');
    throw error;
  }
}

/**
 * Create template variables for React code generation
 */
function createTemplateVariables(answers) {
  const appNamePascalCase = validation.toPascalCase(answers.appName);
  const appNameCamelCase = validation.toCamelCase(answers.appName);

  return {
    appName: answers.appName,
    appNamePascalCase: appNamePascalCase,
    appNameCamelCase: appNameCamelCase,
    uiFramework: answers.uiFramework,
    features: answers.features,
    buildTool: answers.buildTool,
    apiBaseUrl: answers.apiBaseUrl,
    authType: answers.authType,
    timestamp: new Date().toISOString(),
    year: new Date().getFullYear(),

    // Feature flags for templates
    hasTypeScript: answers.features.includes('typescript'),
    hasRedux: answers.features.includes('redux'),
    hasRouter: answers.features.includes('router'),
    hasForms: answers.features.includes('forms'),
    hasReactQuery: answers.features.includes('react-query'),
    hasTesting: answers.features.includes('testing'),
    hasCypress: answers.features.includes('cypress'),
    hasLinting: answers.features.includes('linting'),
    hasStorybook: answers.features.includes('storybook'),
    hasPWA: answers.features.includes('pwa'),

    // UI framework flags
    isMaterialUI: answers.uiFramework === 'material-ui',
    isAntDesign: answers.uiFramework === 'ant-design',
    isChakraUI: answers.uiFramework === 'chakra-ui',

    // Build tool flags
    isVite: answers.buildTool === 'vite',
    isCRA: answers.buildTool === 'cra',
    isWebpack: answers.buildTool === 'webpack',

    // Auth flags
    isJWTLocal: answers.authType === 'jwt-local',
    isJWTCookie: answers.authType === 'jwt-cookie',
    isOAuth2: answers.authType === 'oauth2',
    hasAuth: answers.authType !== 'none'
  };
}

/**
 * Generate Vite-based React project
 */
async function generateViteProject(templateVars) {
  await fileGenerator.generateFromTemplate('react-vite', '.', templateVars);
}

/**
 * Generate Create React App project
 */
async function generateCRAProject(templateVars) {
  await fileGenerator.generateFromTemplate('react-cra', '.', templateVars);
}

/**
 * Generate custom Webpack project
 */
async function generateWebpackProject(templateVars) {
  await fileGenerator.generateFromTemplate('react-webpack', '.', templateVars);
}

/**
 * Generate package.json with all dependencies
 */
async function generatePackageJson(templateVars) {
  await fileGenerator.generateFromTemplate('react/package.json', 'package.json', templateVars);
}

/**
 * Generate configuration files
 */
async function generateConfigFiles(templateVars) {
  // TypeScript config
  if (templateVars.hasTypeScript) {
    await fileGenerator.generateFromTemplate('react/tsconfig.json', 'tsconfig.json', templateVars);
  }

  // ESLint config
  if (templateVars.hasLinting) {
    await fileGenerator.generateFromTemplate('react/.eslintrc.js', '.eslintrc.js', templateVars);
    await fileGenerator.generateFromTemplate('react/.prettierrc', '.prettierrc', templateVars);
  }

  // Vite config
  if (templateVars.isVite) {
    const configFile = templateVars.hasTypeScript ? 'vite.config.ts' : 'vite.config.js';
    await fileGenerator.generateFromTemplate('react/vite.config.js', configFile, templateVars);
  }

  // Environment files
  await fileGenerator.generateFromTemplate('react/.env.example', '.env.example', templateVars);
  await fileGenerator.generateFromTemplate('react/.env.local', '.env.local', templateVars);
}

/**
 * Generate source code structure
 */
async function generateSourceStructure(templateVars) {
  await fs.ensureDir('src');
  await fs.ensureDir('src/components');
  await fs.ensureDir('src/pages');
  await fs.ensureDir('src/hooks');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('src/services');
  await fs.ensureDir('src/styles');
  await fs.ensureDir('public');

  if (templateVars.hasTypeScript) {
    await fs.ensureDir('src/types');
  }

  if (templateVars.hasRedux) {
    await fs.ensureDir('src/store');
    await fs.ensureDir('src/store/slices');
    await fs.ensureDir('src/store/api');
  }

  if (templateVars.hasTesting) {
    await fs.ensureDir('src/__tests__');
    await fs.ensureDir('src/components/__tests__');
  }
}

/**
 * Generate React components
 */
async function generateComponents(templateVars) {
  // Main App component
  const appFile = templateVars.hasTypeScript ? 'src/App.tsx' : 'src/App.jsx';
  await fileGenerator.generateFromTemplate('react/App.jsx', appFile, templateVars);

  // Index file
  const indexFile = templateVars.hasTypeScript ? 'src/index.tsx' : 'src/index.jsx';
  await fileGenerator.generateFromTemplate('react/index.jsx', indexFile, templateVars);

  // Layout components
  await fileGenerator.generateFromTemplate('react/components/Layout.jsx', 'src/components/Layout.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/components/Header.jsx', 'src/components/Header.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/components/Sidebar.jsx', 'src/components/Sidebar.jsx', templateVars);

  // Authentication components
  if (templateVars.hasAuth) {
    await fileGenerator.generateFromTemplate('react/components/Login.jsx', 'src/components/Login.jsx', templateVars);
    await fileGenerator.generateFromTemplate('react/components/ProtectedRoute.jsx', 'src/components/ProtectedRoute.jsx', templateVars);
  }

  // Common components
  await fileGenerator.generateFromTemplate('react/components/LoadingSpinner.jsx', 'src/components/LoadingSpinner.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/components/ErrorBoundary.jsx', 'src/components/ErrorBoundary.jsx', templateVars);
}

/**
 * Generate Redux store setup
 */
async function generateReduxStore(templateVars) {
  await fileGenerator.generateFromTemplate('react/store/index.js', 'src/store/index.js', templateVars);
  await fileGenerator.generateFromTemplate('react/store/hooks.js', 'src/store/hooks.js', templateVars);

  // Auth slice
  if (templateVars.hasAuth) {
    await fileGenerator.generateFromTemplate('react/store/slices/authSlice.js', 'src/store/slices/authSlice.js', templateVars);
  }

  // API slice
  await fileGenerator.generateFromTemplate('react/store/api/apiSlice.js', 'src/store/api/apiSlice.js', templateVars);
}

/**
 * Generate routing setup
 */
async function generateRouting(templateVars) {
  await fileGenerator.generateFromTemplate('react/components/AppRouter.jsx', 'src/components/AppRouter.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/pages/HomePage.jsx', 'src/pages/HomePage.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/pages/AboutPage.jsx', 'src/pages/AboutPage.jsx', templateVars);

  if (templateVars.hasAuth) {
    await fileGenerator.generateFromTemplate('react/pages/LoginPage.jsx', 'src/pages/LoginPage.jsx', templateVars);
    await fileGenerator.generateFromTemplate('react/pages/DashboardPage.jsx', 'src/pages/DashboardPage.jsx', templateVars);
  }
}

/**
 * Generate testing setup
 */
async function generateTestingSetup(templateVars) {
  await fileGenerator.generateFromTemplate('react/test/setupTests.js', 'src/setupTests.js', templateVars);
  await fileGenerator.generateFromTemplate('react/test/App.test.jsx', 'src/__tests__/App.test.jsx', templateVars);
  await fileGenerator.generateFromTemplate('react/test/testUtils.jsx', 'src/__tests__/testUtils.jsx', templateVars);
}

/**
 * Generate Cypress setup
 */
async function generateCypressSetup(templateVars) {
  await fs.ensureDir('cypress/e2e');
  await fs.ensureDir('cypress/fixtures');
  await fs.ensureDir('cypress/support');

  await fileGenerator.generateFromTemplate('cypress/cypress.config.js', 'cypress.config.js', templateVars);
  await fileGenerator.generateFromTemplate('cypress/support/commands.js', 'cypress/support/commands.js', templateVars);
  await fileGenerator.generateFromTemplate('cypress/support/e2e.js', 'cypress/support/e2e.js', templateVars);
  await fileGenerator.generateFromTemplate('cypress/e2e/app.cy.js', 'cypress/e2e/app.cy.js', templateVars);
}

/**
 * Generate Storybook setup
 */
async function generateStorybookSetup(templateVars) {
  await fs.ensureDir('.storybook');
  await fileGenerator.generateFromTemplate('storybook/main.js', '.storybook/main.js', templateVars);
  await fileGenerator.generateFromTemplate('storybook/preview.js', '.storybook/preview.js', templateVars);
}

/**
 * Generate README file
 */
async function generateReadme(templateVars) {
  await fileGenerator.generateFromTemplate('react/README.md', 'README.md', templateVars);
}

module.exports = frontendCommand;