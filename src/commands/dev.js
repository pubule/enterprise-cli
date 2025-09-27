const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

/**
 * Development environment management commands
 */
const devCommand = {
  setup: setupDevelopmentEnvironment,
  start: startDevelopmentServers,
  stop: stopDevelopmentServers,
  logs: viewDevelopmentLogs
};

// Store running processes
const runningProcesses = new Map();

/**
 * Setup development environment
 */
async function setupDevelopmentEnvironment(options) {
  console.log(chalk.cyan('\n🛠️  Setting up development environment\n'));

  try {
    const config = await detectProjectStructure();

    if (options.backend || (!options.frontend && config.hasBackend)) {
      await setupBackendDevelopment(config);
    }

    if (options.frontend || (!options.backend && config.hasFrontend)) {
      await setupFrontendDevelopment(config);
    }

    if (options.docker) {
      await setupDockerServices();
    }

    console.log(chalk.green('\n✅ Development environment setup completed!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.white('  enterprise dev start --full-stack'));

  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Start development servers
 */
async function startDevelopmentServers(options) {
  console.log(chalk.cyan('\n🚀 Starting development servers\n'));

  try {
    const config = await detectProjectStructure();

    // Determine what to start
    const startBackend = options.backend || options.fullStack || (!options.frontend && config.hasBackend);
    const startFrontend = options.frontend || options.fullStack || (!options.backend && config.hasFrontend);

    const promises = [];

    if (startBackend && config.hasBackend) {
      promises.push(startBackendServer(config, options));
    }

    if (startFrontend && config.hasFrontend) {
      promises.push(startFrontendServer(config, options));
    }

    if (promises.length === 0) {
      console.log(chalk.yellow('⚠️  No backend or frontend projects detected in current directory'));
      return;
    }

    // Start servers concurrently
    await Promise.all(promises);

    // Keep process running
    console.log(chalk.green('\n✅ Development servers started successfully!'));
    console.log(chalk.gray('\nPress Ctrl+C to stop all servers\n'));

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\n🛑 Stopping development servers...'));
      await stopAllProcesses();
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {});

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to start servers:'), error.message);
    await stopAllProcesses();
    process.exit(1);
  }
}

/**
 * Stop development servers
 */
async function stopDevelopmentServers() {
  console.log(chalk.yellow('\n🛑 Stopping development servers\n'));

  try {
    await stopAllProcesses();
    console.log(chalk.green('\n✅ All development servers stopped'));
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to stop servers:'), error.message);
    process.exit(1);
  }
}

/**
 * View development server logs
 */
async function viewDevelopmentLogs(options) {
  console.log(chalk.cyan('\n📋 Development Server Logs\n'));

  try {
    const config = await detectProjectStructure();

    if (options.backend && config.hasBackend) {
      await showBackendLogs(options);
    } else if (options.frontend && config.hasFrontend) {
      await showFrontendLogs(options);
    } else {
      // Show all logs
      await showAllLogs(config, options);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to show logs:'), error.message);
    process.exit(1);
  }
}

/**
 * Detect project structure
 */
async function detectProjectStructure() {
  const config = {
    hasBackend: false,
    hasFrontend: false,
    backendType: null,
    frontendType: null,
    backendPath: null,
    frontendPath: null
  };

  // Check for Spring Boot backend
  if (await fs.pathExists('pom.xml')) {
    config.hasBackend = true;
    config.backendType = 'spring-boot';
    config.backendPath = '.';
  } else if (await fs.pathExists('backend/pom.xml')) {
    config.hasBackend = true;
    config.backendType = 'spring-boot';
    config.backendPath = 'backend';
  }

  // Check for React frontend
  if (await fs.pathExists('package.json')) {
    const packageJson = await fs.readJson('package.json');
    if (packageJson.dependencies && packageJson.dependencies.react) {
      config.hasFrontend = true;
      config.frontendType = 'react';
      config.frontendPath = '.';
    }
  } else if (await fs.pathExists('frontend/package.json')) {
    const packageJson = await fs.readJson('frontend/package.json');
    if (packageJson.dependencies && packageJson.dependencies.react) {
      config.hasFrontend = true;
      config.frontendType = 'react';
      config.frontendPath = 'frontend';
    }
  }

  return config;
}

/**
 * Setup backend development environment
 */
async function setupBackendDevelopment(config) {
  const spinner = ora('Setting up backend development environment...').start();

  try {
    const backendDir = config.backendPath;

    // Check Java installation
    try {
      const { stdout } = await execa('java', ['-version'], { cwd: backendDir });
      spinner.text = 'Java installation verified';
    } catch {
      throw new Error('Java not found. Please install Java 17 or later.');
    }

    // Check Maven installation
    try {
      await execa('mvn', ['--version'], { cwd: backendDir });
      spinner.text = 'Maven installation verified';
    } catch {
      throw new Error('Maven not found. Please install Apache Maven.');
    }

    // Install dependencies
    spinner.text = 'Installing backend dependencies...';
    await execa('mvn', ['dependency:resolve'], { cwd: backendDir });

    // Run tests to ensure everything is working
    spinner.text = 'Running backend tests...';
    await execa('mvn', ['test', '-q'], { cwd: backendDir });

    spinner.succeed('Backend development environment ready');

  } catch (error) {
    spinner.fail('Backend setup failed');
    throw error;
  }
}

/**
 * Setup frontend development environment
 */
async function setupFrontendDevelopment(config) {
  const spinner = ora('Setting up frontend development environment...').start();

  try {
    const frontendDir = config.frontendPath;

    // Check Node.js installation
    try {
      const { stdout } = await execa('node', ['--version'], { cwd: frontendDir });
      const nodeVersion = stdout.trim();
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      if (majorVersion < 18) {
        throw new Error(`Node.js version ${nodeVersion} detected. Please upgrade to Node.js 18 or later.`);
      }
      spinner.text = `Node.js ${nodeVersion} verified`;
    } catch {
      throw new Error('Node.js not found. Please install Node.js 18 or later.');
    }

    // Install dependencies
    spinner.text = 'Installing frontend dependencies...';
    await execa('npm', ['install'], { cwd: frontendDir });

    // Run linting
    const packageJson = await fs.readJson(path.join(frontendDir, 'package.json'));
    if (packageJson.scripts && packageJson.scripts.lint) {
      spinner.text = 'Running frontend linting...';
      await execa('npm', ['run', 'lint'], { cwd: frontendDir });
    }

    spinner.succeed('Frontend development environment ready');

  } catch (error) {
    spinner.fail('Frontend setup failed');
    throw error;
  }
}

/**
 * Setup Docker services
 */
async function setupDockerServices() {
  const spinner = ora('Starting Docker services...').start();

  try {
    // Check Docker installation
    try {
      await execa('docker', ['--version']);
      await execa('docker-compose', ['--version']);
    } catch {
      throw new Error('Docker or Docker Compose not found. Please install Docker.');
    }

    // Start services if docker-compose.yml exists
    if (await fs.pathExists('docker-compose.yml')) {
      await execa('docker-compose', ['up', '-d']);
      spinner.succeed('Docker services started');
    } else {
      spinner.warn('No docker-compose.yml found. Skipping Docker setup.');
    }

  } catch (error) {
    spinner.fail('Docker setup failed');
    throw error;
  }
}

/**
 * Start backend server
 */
async function startBackendServer(config, options) {
  const spinner = ora('Starting backend server...').start();

  try {
    const backendDir = config.backendPath;
    const profile = options.profile || 'dev';

    const args = ['spring-boot:run'];
    if (profile) {
      args.push(`-Dspring-boot.run.profiles=${profile}`);
    }
    if (options.debug) {
      args.push('-Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"');
    }

    const backendProcess = execa('mvn', args, {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    runningProcesses.set('backend', backendProcess);

    // Handle backend output
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Started') && output.includes('Application')) {
        spinner.succeed('Backend server started on http://localhost:8080');
      }
      console.log(chalk.blue('[Backend]'), output.trim());
    });

    backendProcess.stderr.on('data', (data) => {
      console.log(chalk.red('[Backend Error]'), data.toString().trim());
    });

    backendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`\n❌ Backend server exited with code ${code}`));
      }
      runningProcesses.delete('backend');
    });

    // Wait a bit to see if it starts successfully
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    spinner.fail('Failed to start backend server');
    throw error;
  }
}

/**
 * Start frontend server
 */
async function startFrontendServer(config, options) {
  const spinner = ora('Starting frontend server...').start();

  try {
    const frontendDir = config.frontendPath;
    const packageJson = await fs.readJson(path.join(frontendDir, 'package.json'));

    // Determine start command
    let startCommand = ['start'];
    if (packageJson.scripts && packageJson.scripts.dev) {
      startCommand = ['run', 'dev'];
    } else if (packageJson.scripts && packageJson.scripts.start) {
      startCommand = ['run', 'start'];
    }

    const frontendProcess = execa('npm', startCommand, {
      cwd: frontendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        BROWSER: 'none' // Don't auto-open browser
      }
    });

    runningProcesses.set('frontend', frontendProcess);

    // Handle frontend output
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost:')) {
        spinner.succeed('Frontend server started on http://localhost:3000');
      }
      console.log(chalk.green('[Frontend]'), output.trim());
    });

    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Vite and CRA send some info to stderr
      if (!output.includes('error') && !output.includes('Error')) {
        console.log(chalk.green('[Frontend]'), output.trim());
      } else {
        console.log(chalk.red('[Frontend Error]'), output.trim());
      }
    });

    frontendProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`\n❌ Frontend server exited with code ${code}`));
      }
      runningProcesses.delete('frontend');
    });

    // Wait a bit to see if it starts successfully
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    spinner.fail('Failed to start frontend server');
    throw error;
  }
}

/**
 * Stop all running processes
 */
async function stopAllProcesses() {
  const promises = [];

  for (const [name, process] of runningProcesses) {
    console.log(chalk.gray(`Stopping ${name}...`));
    promises.push(
      new Promise((resolve) => {
        process.kill('SIGTERM');
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
          resolve();
        }, 5000);
      })
    );
  }

  await Promise.all(promises);
  runningProcesses.clear();
}

/**
 * Show backend logs
 */
async function showBackendLogs(options) {
  if (runningProcesses.has('backend')) {
    console.log(chalk.blue('📄 Backend server is running. Logs will appear in real-time.\n'));
  } else {
    console.log(chalk.yellow('⚠️  Backend server is not running'));
    console.log(chalk.gray('Start it with: enterprise dev start --backend'));
  }
}

/**
 * Show frontend logs
 */
async function showFrontendLogs(options) {
  if (runningProcesses.has('frontend')) {
    console.log(chalk.green('📄 Frontend server is running. Logs will appear in real-time.\n'));
  } else {
    console.log(chalk.yellow('⚠️  Frontend server is not running'));
    console.log(chalk.gray('Start it with: enterprise dev start --frontend'));
  }
}

/**
 * Show all logs
 */
async function showAllLogs(config, options) {
  const hasRunningServers = runningProcesses.size > 0;

  if (!hasRunningServers) {
    console.log(chalk.yellow('⚠️  No development servers are currently running'));
    console.log(chalk.gray('Start them with: enterprise dev start --full-stack'));
    return;
  }

  console.log(chalk.cyan('📄 Development servers are running. Logs will appear in real-time.\n'));

  for (const [name] of runningProcesses) {
    console.log(chalk.gray(`${name} server is running`));
  }

  console.log();
}

module.exports = devCommand;