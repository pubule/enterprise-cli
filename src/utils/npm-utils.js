const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

/**
 * NPM/Node.js utilities for React project management
 */

/**
 * Check if Node.js is installed and accessible
 * @returns {boolean} True if Node.js is available
 */
async function isNodeAvailable() {
  try {
    await execa('node', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if NPM is installed and accessible
 * @returns {boolean} True if NPM is available
 */
async function isNpmAvailable() {
  try {
    await execa('npm', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Node.js version
 * @returns {string|null} Node.js version or null if not available
 */
async function getNodeVersion() {
  try {
    const { stdout } = await execa('node', ['--version']);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Get NPM version
 * @returns {string|null} NPM version or null if not available
 */
async function getNpmVersion() {
  try {
    const { stdout } = await execa('npm', ['--version']);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check if Yarn is available
 * @returns {boolean} True if Yarn is available
 */
async function isYarnAvailable() {
  try {
    await execa('yarn', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create package.json file
 * @param {string} projectPath - Path to project directory
 * @param {object} packageData - Package.json data
 */
async function createPackageJson(projectPath, packageData) {
  const packagePath = path.join(projectPath, 'package.json');
  await fs.writeJson(packagePath, packageData, { spaces: 2 });
}

/**
 * Read package.json file
 * @param {string} projectPath - Path to project directory
 * @returns {object|null} Package.json data or null if not found
 */
async function readPackageJson(projectPath) {
  const packagePath = path.join(projectPath, 'package.json');

  if (await fs.pathExists(packagePath)) {
    return await fs.readJson(packagePath);
  }

  return null;
}

/**
 * Update package.json file
 * @param {string} projectPath - Path to project directory
 * @param {object} updates - Updates to apply
 */
async function updatePackageJson(projectPath, updates) {
  const packagePath = path.join(projectPath, 'package.json');
  const currentPackage = await readPackageJson(projectPath);

  if (!currentPackage) {
    throw new Error('package.json not found');
  }

  const updatedPackage = { ...currentPackage, ...updates };
  await fs.writeJson(packagePath, updatedPackage, { spaces: 2 });
}

/**
 * Add dependency to package.json
 * @param {string} projectPath - Path to project directory
 * @param {string} packageName - Name of the package
 * @param {string} version - Version (optional)
 * @param {boolean} isDev - Whether it's a dev dependency
 */
async function addDependency(projectPath, packageName, version, isDev = false) {
  const packageData = await readPackageJson(projectPath);

  if (!packageData) {
    throw new Error('package.json not found');
  }

  const dependencyType = isDev ? 'devDependencies' : 'dependencies';

  if (!packageData[dependencyType]) {
    packageData[dependencyType] = {};
  }

  packageData[dependencyType][packageName] = version || 'latest';

  await updatePackageJson(projectPath, packageData);
}

/**
 * Add multiple dependencies to package.json
 * @param {string} projectPath - Path to project directory
 * @param {Array} dependencies - Array of dependency objects
 */
async function addDependencies(projectPath, dependencies) {
  const packageData = await readPackageJson(projectPath);

  if (!packageData) {
    throw new Error('package.json not found');
  }

  dependencies.forEach(({ name, version, isDev = false }) => {
    const dependencyType = isDev ? 'devDependencies' : 'dependencies';

    if (!packageData[dependencyType]) {
      packageData[dependencyType] = {};
    }

    packageData[dependencyType][name] = version || 'latest';
  });

  await updatePackageJson(projectPath, packageData);
}

/**
 * Add script to package.json
 * @param {string} projectPath - Path to project directory
 * @param {string} scriptName - Name of the script
 * @param {string} scriptCommand - Command to run
 */
async function addScript(projectPath, scriptName, scriptCommand) {
  const packageData = await readPackageJson(projectPath);

  if (!packageData) {
    throw new Error('package.json not found');
  }

  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  packageData.scripts[scriptName] = scriptCommand;

  await updatePackageJson(projectPath, packageData);
}

/**
 * Add multiple scripts to package.json
 * @param {string} projectPath - Path to project directory
 * @param {object} scripts - Object with script name/command pairs
 */
async function addScripts(projectPath, scripts) {
  const packageData = await readPackageJson(projectPath);

  if (!packageData) {
    throw new Error('package.json not found');
  }

  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  Object.assign(packageData.scripts, scripts);

  await updatePackageJson(projectPath, packageData);
}

/**
 * Run NPM command
 * @param {string} command - NPM command (e.g., 'install', 'run build')
 * @param {object} options - Execution options
 */
async function runNpmCommand(command, options = {}) {
  const { cwd = process.cwd(), silent = false, useYarn = false } = options;

  const packageManager = useYarn ? 'yarn' : 'npm';
  const args = command.split(' ');

  // Convert NPM commands to Yarn equivalents if needed
  if (useYarn) {
    if (args[0] === 'install') {
      args[0] = 'add';
    } else if (args[0] === 'run') {
      args.shift(); // Remove 'run' for Yarn
    }
  }

  const execOptions = {
    cwd,
    stdio: silent ? 'pipe' : 'inherit'
  };

  try {
    const result = await execa(packageManager, args, execOptions);
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
 * Install dependencies
 * @param {string} projectPath - Path to project directory
 * @param {object} options - Installation options
 */
async function installDependencies(projectPath, options = {}) {
  const { useYarn = false } = options;

  return await runNpmCommand('install', { cwd: projectPath, useYarn });
}

/**
 * Install specific package
 * @param {string} projectPath - Path to project directory
 * @param {string} packageName - Name of the package
 * @param {object} options - Installation options
 */
async function installPackage(projectPath, packageName, options = {}) {
  const { isDev = false, useYarn = false, version } = options;

  const packageSpec = version ? `${packageName}@${version}` : packageName;
  let command = `install ${packageSpec}`;

  if (isDev) {
    command += useYarn ? ' --dev' : ' --save-dev';
  }

  return await runNpmCommand(command, { cwd: projectPath, useYarn });
}

/**
 * Build project
 * @param {string} projectPath - Path to project directory
 * @param {object} options - Build options
 */
async function buildProject(projectPath, options = {}) {
  const { useYarn = false, script = 'build' } = options;

  return await runNpmCommand(`run ${script}`, { cwd: projectPath, useYarn });
}

/**
 * Run tests
 * @param {string} projectPath - Path to project directory
 * @param {object} options - Test options
 */
async function runTests(projectPath, options = {}) {
  const { useYarn = false, watch = false, coverage = false } = options;

  let command = 'run test';

  const args = [];
  if (!watch) {
    args.push('--watchAll=false');
  }
  if (coverage) {
    args.push('--coverage');
  }

  if (args.length > 0) {
    command += ` -- ${args.join(' ')}`;
  }

  return await runNpmCommand(command, { cwd: projectPath, useYarn });
}

/**
 * Start development server
 * @param {string} projectPath - Path to project directory
 * @param {object} options - Start options
 */
async function startDevServer(projectPath, options = {}) {
  const { useYarn = false, script = 'start' } = options;

  return await runNpmCommand(`run ${script}`, { cwd: projectPath, useYarn });
}

/**
 * Get React dependencies for different configurations
 * @param {object} config - Configuration object
 * @returns {Array} Array of dependencies
 */
function getReactDependencies(config) {
  const dependencies = [
    { name: 'react', version: '^18.2.0' },
    { name: 'react-dom', version: '^18.2.0' }
  ];

  if (config.hasTypeScript) {
    dependencies.push(
      { name: '@types/react', version: '^18.2.0', isDev: true },
      { name: '@types/react-dom', version: '^18.2.0', isDev: true },
      { name: 'typescript', version: '^5.0.0', isDev: true }
    );
  }

  if (config.hasRedux) {
    dependencies.push(
      { name: '@reduxjs/toolkit', version: '^1.9.0' },
      { name: 'react-redux', version: '^8.1.0' }
    );

    if (config.hasTypeScript) {
      dependencies.push(
        { name: '@types/react-redux', version: '^7.1.0', isDev: true }
      );
    }
  }

  if (config.hasRouter) {
    dependencies.push(
      { name: 'react-router-dom', version: '^6.15.0' }
    );
  }

  if (config.hasForms) {
    dependencies.push(
      { name: 'react-hook-form', version: '^7.45.0' }
    );
  }

  if (config.hasReactQuery) {
    dependencies.push(
      { name: '@tanstack/react-query', version: '^4.32.0' },
      { name: '@tanstack/react-query-devtools', version: '^4.32.0' }
    );
  }

  // UI Framework dependencies
  if (config.isMaterialUI) {
    dependencies.push(
      { name: '@mui/material', version: '^5.14.0' },
      { name: '@mui/icons-material', version: '^5.14.0' },
      { name: '@emotion/react', version: '^11.11.0' },
      { name: '@emotion/styled', version: '^11.11.0' }
    );
  } else if (config.isAntDesign) {
    dependencies.push(
      { name: 'antd', version: '^5.8.0' }
    );
  } else if (config.isChakraUI) {
    dependencies.push(
      { name: '@chakra-ui/react', version: '^2.8.0' },
      { name: '@chakra-ui/icons', version: '^2.1.0' },
      { name: '@emotion/react', version: '^11.11.0' },
      { name: '@emotion/styled', version: '^11.11.0' },
      { name: 'framer-motion', version: '^10.16.0' }
    );
  }

  return dependencies;
}

/**
 * Get development dependencies for React projects
 * @param {object} config - Configuration object
 * @returns {Array} Array of dev dependencies
 */
function getReactDevDependencies(config) {
  const devDependencies = [];

  if (config.hasTesting) {
    devDependencies.push(
      { name: '@testing-library/react', version: '^13.4.0', isDev: true },
      { name: '@testing-library/jest-dom', version: '^6.1.0', isDev: true },
      { name: '@testing-library/user-event', version: '^14.4.0', isDev: true }
    );
  }

  if (config.hasCypress) {
    devDependencies.push(
      { name: 'cypress', version: '^13.0.0', isDev: true }
    );
  }

  if (config.hasLinting) {
    devDependencies.push(
      { name: 'eslint', version: '^8.48.0', isDev: true },
      { name: 'eslint-plugin-react', version: '^7.33.0', isDev: true },
      { name: 'eslint-plugin-react-hooks', version: '^4.6.0', isDev: true },
      { name: 'prettier', version: '^3.0.0', isDev: true }
    );

    if (config.hasTypeScript) {
      devDependencies.push(
        { name: '@typescript-eslint/parser', version: '^6.6.0', isDev: true },
        { name: '@typescript-eslint/eslint-plugin', version: '^6.6.0', isDev: true }
      );
    }
  }

  if (config.hasStorybook) {
    devDependencies.push(
      { name: '@storybook/react', version: '^7.4.0', isDev: true },
      { name: '@storybook/addon-essentials', version: '^7.4.0', isDev: true }
    );
  }

  return devDependencies;
}

/**
 * Get common scripts for React projects
 * @param {object} config - Configuration object
 * @returns {object} Scripts object
 */
function getReactScripts(config) {
  const scripts = {};

  if (config.isVite) {
    scripts.dev = 'vite';
    scripts.build = 'vite build';
    scripts.preview = 'vite preview';
  } else if (config.isCRA) {
    scripts.start = 'react-scripts start';
    scripts.build = 'react-scripts build';
    scripts.test = 'react-scripts test';
    scripts.eject = 'react-scripts eject';
  } else {
    scripts.start = 'webpack serve --mode development';
    scripts.build = 'webpack --mode production';
  }

  if (config.hasTesting) {
    if (!scripts.test) {
      scripts.test = 'jest';
    }
    scripts['test:coverage'] = 'jest --coverage';
  }

  if (config.hasCypress) {
    scripts['test:e2e'] = 'cypress run';
    scripts['test:e2e:open'] = 'cypress open';
  }

  if (config.hasLinting) {
    scripts.lint = 'eslint src --ext .js,.jsx,.ts,.tsx';
    scripts['lint:fix'] = 'eslint src --ext .js,.jsx,.ts,.tsx --fix';
    scripts.format = 'prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}';
  }

  if (config.hasStorybook) {
    scripts.storybook = 'storybook dev -p 6006';
    scripts['build-storybook'] = 'storybook build';
  }

  return scripts;
}

/**
 * Create React project structure
 * @param {string} projectPath - Path to project directory
 * @param {object} config - Configuration object
 */
async function createReactProjectStructure(projectPath, config) {
  // Create directory structure
  const directories = [
    'src',
    'src/components',
    'src/pages',
    'src/hooks',
    'src/utils',
    'src/services',
    'src/styles',
    'public'
  ];

  if (config.hasTypeScript) {
    directories.push('src/types');
  }

  if (config.hasRedux) {
    directories.push('src/store', 'src/store/slices', 'src/store/api');
  }

  if (config.hasTesting) {
    directories.push('src/__tests__', 'src/components/__tests__');
  }

  for (const dir of directories) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  // Create basic package.json
  const packageData = {
    name: config.appName,
    version: '0.1.0',
    private: true,
    dependencies: {},
    devDependencies: {},
    scripts: getReactScripts(config),
    eslintConfig: config.hasLinting ? {
      extends: [
        'react-app',
        'react-app/jest'
      ]
    } : undefined,
    browserslist: {
      production: [
        '>0.2%',
        'not dead',
        'not op_mini all'
      ],
      development: [
        'last 1 chrome version',
        'last 1 firefox version',
        'last 1 safari version'
      ]
    }
  };

  await createPackageJson(projectPath, packageData);

  // Add dependencies
  const dependencies = getReactDependencies(config);
  const devDependencies = getReactDevDependencies(config);

  await addDependencies(projectPath, [...dependencies, ...devDependencies]);
}

module.exports = {
  isNodeAvailable,
  isNpmAvailable,
  getNodeVersion,
  getNpmVersion,
  isYarnAvailable,
  createPackageJson,
  readPackageJson,
  updatePackageJson,
  addDependency,
  addDependencies,
  addScript,
  addScripts,
  runNpmCommand,
  installDependencies,
  installPackage,
  buildProject,
  runTests,
  startDevServer,
  getReactDependencies,
  getReactDevDependencies,
  getReactScripts,
  createReactProjectStructure
};