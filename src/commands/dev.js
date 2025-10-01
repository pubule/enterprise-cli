/**
 * Dev Command
 * Manages development environment setup and server lifecycle
 */

const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { spawn, execSync } = require('child_process');

// Directory for storing CLI state
const CLI_STATE_DIR = '.enterprise-cli';
const PIDS_FILE = 'pids.json';

// ========================================
// DEPENDENCY VERIFICATION
// ========================================

/**
 * Check if Java is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkJavaInstalled() {
  try {
    const version = execSync('java -version 2>&1', { encoding: 'utf-8' });
    const versionMatch = version.match(/version "(.+?)"/);
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : 'unknown'
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

/**
 * Check if Maven is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkMavenInstalled() {
  try {
    const cmd = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
    const version = execSync(`${cmd} -version 2>&1`, { encoding: 'utf-8' });
    const versionMatch = version.match(/Apache Maven ([\d.]+)/);
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : 'unknown'
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

/**
 * Check if Node.js is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkNodeInstalled() {
  try {
    const version = execSync('node -v', { encoding: 'utf-8' }).trim();
    return {
      installed: true,
      version: version.replace('v', '')
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

/**
 * Check if NPM is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkNpmInstalled() {
  try {
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const version = execSync(`${cmd} -v`, { encoding: 'utf-8' }).trim();
    return {
      installed: true,
      version
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

/**
 * Check if Docker is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkDockerInstalled() {
  try {
    const version = execSync('docker -v', { encoding: 'utf-8' });
    const versionMatch = version.match(/Docker version ([\d.]+)/);
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : 'unknown'
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

/**
 * Check if Docker Compose is installed
 * @returns {object} - { installed: boolean, version: string }
 */
function checkDockerComposeInstalled() {
  try {
    // Try docker-compose first, then docker compose
    let version;
    try {
      version = execSync('docker-compose -v', { encoding: 'utf-8' });
    } catch (e) {
      version = execSync('docker compose version', { encoding: 'utf-8' });
    }
    const versionMatch = version.match(/version v?([\d.]+)/i);
    return {
      installed: true,
      version: versionMatch ? versionMatch[1] : 'unknown'
    };
  } catch (error) {
    return { installed: false, version: null };
  }
}

// ========================================
// PROCESS MANAGEMENT
// ========================================

/**
 * Get path to CLI state directory
 * @returns {string} - Path to state directory
 */
function getStateDir() {
  return path.join(process.cwd(), CLI_STATE_DIR);
}

/**
 * Get path to PIDs file
 * @returns {string} - Path to PIDs file
 */
function getPidsFilePath() {
  return path.join(getStateDir(), PIDS_FILE);
}

/**
 * Ensure state directory exists
 * @returns {Promise<void>}
 */
async function ensureStateDir() {
  const stateDir = getStateDir();
  await fs.ensureDir(stateDir);
}

/**
 * Save process PID
 * @param {string} serviceName - Name of service (backend, frontend)
 * @param {number} pid - Process ID
 * @returns {Promise<void>}
 */
async function savePid(serviceName, pid) {
  await ensureStateDir();
  const pidsFile = getPidsFilePath();

  let pids = {};
  if (await fs.pathExists(pidsFile)) {
    pids = await fs.readJson(pidsFile);
  }

  pids[serviceName] = {
    pid,
    startedAt: new Date().toISOString()
  };

  await fs.writeJson(pidsFile, pids, { spaces: 2 });
}

/**
 * Load saved PIDs
 * @returns {Promise<object>} - Object with service PIDs
 */
async function loadPids() {
  const pidsFile = getPidsFilePath();

  if (!(await fs.pathExists(pidsFile))) {
    return {};
  }

  try {
    return await fs.readJson(pidsFile);
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Warning: Could not read PIDs file: ${error.message}`));
    return {};
  }
}

/**
 * Clear all saved PIDs
 * @returns {Promise<void>}
 */
async function clearPids() {
  const pidsFile = getPidsFilePath();
  if (await fs.pathExists(pidsFile)) {
    await fs.remove(pidsFile);
  }
}

/**
 * Check if process is running
 * @param {number} pid - Process ID
 * @returns {boolean} - True if running
 */
function isProcessRunning(pid) {
  try {
    if (process.platform === 'win32') {
      // On Windows, use tasklist
      const result = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8' });
      return result.includes(pid.toString());
    } else {
      // On Unix, send signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Kill process by PID
 * @param {number} pid - Process ID
 * @param {string} signal - Signal to send (default: SIGTERM)
 * @returns {boolean} - True if killed successfully
 */
function killProcess(pid, signal = 'SIGTERM') {
  try {
    if (process.platform === 'win32') {
      // On Windows, use taskkill
      const force = signal === 'SIGKILL' ? '/F' : '';
      execSync(`taskkill /PID ${pid} ${force} /T`, { stdio: 'ignore' });
      return true;
    } else {
      // On Unix, use process.kill
      process.kill(pid, signal);
      return true;
    }
  } catch (error) {
    return false;
  }
}

// ========================================
// MAIN FUNCTIONS
// ========================================

/**
 * Setup development environment
 * @param {object} options - Command options
 */
async function setupDevEnvironment(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n🔧 Development Environment Setup\n'));

    // Determine scope
    const setupBackend = options.backend || (!options.frontend && !options.docker);
    const setupFrontend = options.frontend || (!options.backend && !options.docker);
    const setupDocker = options.docker;

    const setupSummary = [];

    // Setup backend
    if (setupBackend) {
      console.log(chalk.yellow.bold('📦 Backend Setup\n'));

      // Check Java
      const spinner1 = ora('Checking Java...').start();
      const java = checkJavaInstalled();
      if (!java.installed) {
        spinner1.fail('Java not found');
        console.log(chalk.red('   ❌ Java is required for backend development'));
        console.log(chalk.gray('   Install Java JDK 17 or higher'));
        process.exit(1);
      }
      spinner1.succeed(`Java ${java.version} found`);

      // Check Maven
      const spinner2 = ora('Checking Maven...').start();
      const maven = checkMavenInstalled();
      if (!maven.installed) {
        spinner2.fail('Maven not found');
        console.log(chalk.red('   ❌ Maven is required for backend development'));
        console.log(chalk.gray('   Install Apache Maven 3.8 or higher'));
        process.exit(1);
      }
      spinner2.succeed(`Maven ${maven.version} found`);

      // Check for pom.xml
      const pomPath = path.join(process.cwd(), 'pom.xml');
      if (!(await fs.pathExists(pomPath))) {
        console.log(chalk.yellow('   ⚠️  No pom.xml found in current directory'));
        console.log(chalk.gray('   Make sure you are in a Spring Boot project directory'));
      } else {
        // Run mvn clean install
        const spinner3 = ora('Running mvn clean install...').start();

        try {
          const mvnCmd = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
          execSync(`${mvnCmd} clean install -DskipTests`, {
            cwd: process.cwd(),
            stdio: 'pipe'
          });
          spinner3.succeed('Backend dependencies installed');
          setupSummary.push('✅ Backend ready');
        } catch (error) {
          spinner3.fail('Maven build failed');
          console.log(chalk.red(`   ❌ ${error.message}`));
          process.exit(1);
        }
      }

      console.log();
    }

    // Setup frontend
    if (setupFrontend) {
      console.log(chalk.yellow.bold('⚛️  Frontend Setup\n'));

      // Check Node.js
      const spinner1 = ora('Checking Node.js...').start();
      const node = checkNodeInstalled();
      if (!node.installed) {
        spinner1.fail('Node.js not found');
        console.log(chalk.red('   ❌ Node.js is required for frontend development'));
        console.log(chalk.gray('   Install Node.js 18 or higher'));
        process.exit(1);
      }
      spinner1.succeed(`Node.js ${node.version} found`);

      // Check NPM
      const spinner2 = ora('Checking NPM...').start();
      const npm = checkNpmInstalled();
      if (!npm.installed) {
        spinner2.fail('NPM not found');
        console.log(chalk.red('   ❌ NPM is required for frontend development'));
        process.exit(1);
      }
      spinner2.succeed(`NPM ${npm.version} found`);

      // Check for package.json
      const packagePath = path.join(process.cwd(), 'package.json');
      if (!(await fs.pathExists(packagePath))) {
        console.log(chalk.yellow('   ⚠️  No package.json found in current directory'));
        console.log(chalk.gray('   Make sure you are in a React project directory'));
      } else {
        // Run npm install
        const spinner3 = ora('Running npm install...').start();

        try {
          const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
          execSync(`${npmCmd} install`, {
            cwd: process.cwd(),
            stdio: 'pipe'
          });
          spinner3.succeed('Frontend dependencies installed');
          setupSummary.push('✅ Frontend ready');
        } catch (error) {
          spinner3.fail('NPM install failed');
          console.log(chalk.red(`   ❌ ${error.message}`));
          process.exit(1);
        }
      }

      console.log();
    }

    // Setup Docker
    if (setupDocker) {
      console.log(chalk.yellow.bold('🐳 Docker Setup\n'));

      // Check Docker
      const spinner1 = ora('Checking Docker...').start();
      const docker = checkDockerInstalled();
      if (!docker.installed) {
        spinner1.fail('Docker not found');
        console.log(chalk.red('   ❌ Docker is required for containerized services'));
        console.log(chalk.gray('   Install Docker Desktop'));
        process.exit(1);
      }
      spinner1.succeed(`Docker ${docker.version} found`);

      // Check Docker Compose
      const spinner2 = ora('Checking Docker Compose...').start();
      const compose = checkDockerComposeInstalled();
      if (!compose.installed) {
        spinner2.fail('Docker Compose not found');
        console.log(chalk.red('   ❌ Docker Compose is required'));
        process.exit(1);
      }
      spinner2.succeed(`Docker Compose ${compose.version} found`);

      // Check for docker-compose.yml
      const composePath = path.join(process.cwd(), 'docker-compose.yml');
      if (!(await fs.pathExists(composePath))) {
        console.log(chalk.yellow('   ⚠️  No docker-compose.yml found in current directory'));
      } else {
        // Start Docker services
        const spinner3 = ora('Starting Docker services...').start();

        try {
          // Try docker-compose first, then docker compose
          try {
            execSync('docker-compose up -d', {
              cwd: process.cwd(),
              stdio: 'pipe'
            });
          } catch (e) {
            execSync('docker compose up -d', {
              cwd: process.cwd(),
              stdio: 'pipe'
            });
          }
          spinner3.succeed('Docker services started');
          setupSummary.push('✅ Docker services running');
        } catch (error) {
          spinner3.fail('Docker Compose failed');
          console.log(chalk.red(`   ❌ ${error.message}`));
          process.exit(1);
        }
      }

      console.log();
    }

    // Show summary
    console.log(chalk.green.bold('✅ Development Environment Setup Complete!\n'));
    if (setupSummary.length > 0) {
      setupSummary.forEach(item => console.log(chalk.gray(`   ${item}`)));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Setup failed:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Start development servers
 * @param {object} options - Command options
 */
async function startDevServers(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n🚀 Starting Development Servers\n'));

    // Determine what to start
    const startBackend = options.backend || options.fullStack || (!options.frontend);
    const startFrontend = options.frontend || options.fullStack;
    const profile = options.profile || 'dev';

    const startedServices = [];

    // Start backend
    if (startBackend) {
      const pomPath = path.join(process.cwd(), 'pom.xml');

      if (!(await fs.pathExists(pomPath))) {
        console.log(chalk.yellow('⚠️  No pom.xml found - skipping backend'));
      } else {
        // Check dependencies
        const java = checkJavaInstalled();
        const maven = checkMavenInstalled();

        if (!java.installed || !maven.installed) {
          console.log(chalk.red('❌ Java and Maven are required for backend'));
          console.log(chalk.gray('   Run: enterprise dev setup --backend'));
          process.exit(1);
        }

        const spinner = ora('Starting backend server...').start();

        try {
          const mvnCmd = process.platform === 'win32' ? 'mvn.cmd' : 'mvn';
          const backendProcess = spawn(
            mvnCmd,
            ['spring-boot:run', `-Dspring-boot.run.profiles=${profile}`],
            {
              cwd: process.cwd(),
              detached: false,
              stdio: 'ignore'
            }
          );

          // Save PID
          await savePid('backend', backendProcess.pid);

          spinner.succeed('Backend server started');
          console.log(chalk.green('   ✅ Backend: http://localhost:8080'));
          console.log(chalk.gray(`   PID: ${backendProcess.pid}`));
          console.log(chalk.gray(`   Profile: ${profile}`));
          console.log();

          startedServices.push('backend');
        } catch (error) {
          spinner.fail('Failed to start backend');
          console.log(chalk.red(`   ❌ ${error.message}`));
        }
      }
    }

    // Start frontend
    if (startFrontend) {
      const packagePath = path.join(process.cwd(), 'package.json');

      if (!(await fs.pathExists(packagePath))) {
        console.log(chalk.yellow('⚠️  No package.json found - skipping frontend'));
      } else {
        // Check dependencies
        const node = checkNodeInstalled();
        const npm = checkNpmInstalled();

        if (!node.installed || !npm.installed) {
          console.log(chalk.red('❌ Node.js and NPM are required for frontend'));
          console.log(chalk.gray('   Run: enterprise dev setup --frontend'));
          process.exit(1);
        }

        // Check for dev script
        const packageJson = await fs.readJson(packagePath);
        const startScript = packageJson.scripts?.dev || packageJson.scripts?.start;

        if (!startScript) {
          console.log(chalk.yellow('⚠️  No dev or start script found in package.json'));
        } else {
          const spinner = ora('Starting frontend server...').start();

          try {
            const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const scriptName = packageJson.scripts?.dev ? 'dev' : 'start';

            const frontendProcess = spawn(
              npmCmd,
              ['run', scriptName],
              {
                cwd: process.cwd(),
                detached: false,
                stdio: 'ignore'
              }
            );

            // Save PID
            await savePid('frontend', frontendProcess.pid);

            spinner.succeed('Frontend server started');
            console.log(chalk.green('   ✅ Frontend: http://localhost:3000'));
            console.log(chalk.gray(`   PID: ${frontendProcess.pid}`));
            console.log();

            startedServices.push('frontend');
          } catch (error) {
            spinner.fail('Failed to start frontend');
            console.log(chalk.red(`   ❌ ${error.message}`));
          }
        }
      }
    }

    // Show summary
    if (startedServices.length > 0) {
      console.log(chalk.green.bold('✅ Development servers started!\n'));
      console.log(chalk.gray('   To stop servers:  enterprise dev stop'));
      console.log(chalk.gray('   To view logs:     enterprise dev logs'));
      console.log();
    } else {
      console.log(chalk.yellow('⚠️  No servers were started'));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Failed to start servers:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Stop development servers
 * @param {object} options - Command options
 */
async function stopDevServers(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n🛑 Stopping Development Servers\n'));

    // Load saved PIDs
    const pids = await loadPids();

    if (Object.keys(pids).length === 0) {
      console.log(chalk.yellow('⚠️  No development servers are running'));
      console.log();
      return;
    }

    // Stop each service
    for (const [serviceName, info] of Object.entries(pids)) {
      const spinner = ora(`Stopping ${serviceName}...`).start();

      if (!isProcessRunning(info.pid)) {
        spinner.warn(`${serviceName} is not running (PID ${info.pid})`);
        continue;
      }

      // Try graceful shutdown first
      const killed = killProcess(info.pid, 'SIGTERM');

      if (killed) {
        // Wait up to 5 seconds for graceful shutdown
        let graceful = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (!isProcessRunning(info.pid)) {
            graceful = true;
            break;
          }
        }

        if (!graceful) {
          // Force kill
          killProcess(info.pid, 'SIGKILL');
        }

        spinner.succeed(`${serviceName} stopped`);
      } else {
        spinner.fail(`Failed to stop ${serviceName}`);
      }
    }

    // Clear PIDs file
    await clearPids();

    console.log();
    console.log(chalk.green.bold('✅ All development servers stopped'));
    console.log();

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Failed to stop servers:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Show development logs
 * @param {object} options - Command options
 */
async function showDevLogs(options = {}) {
  try {
    console.log(chalk.cyan.bold('\n📋 Development Logs\n'));

    const showBackend = options.backend || (!options.frontend);
    const showFrontend = options.frontend || (!options.backend);
    const follow = options.follow !== false;

    const logFiles = [];

    // Find backend logs
    if (showBackend) {
      const possibleBackendLogs = [
        path.join(process.cwd(), 'target', 'spring-boot.log'),
        path.join(process.cwd(), 'logs', 'application.log'),
        path.join(process.cwd(), 'application.log')
      ];

      for (const logPath of possibleBackendLogs) {
        if (await fs.pathExists(logPath)) {
          logFiles.push({ service: 'backend', path: logPath, color: 'green' });
          break;
        }
      }

      if (logFiles.length === 0 && showBackend) {
        console.log(chalk.yellow('⚠️  Backend log file not found'));
        console.log(chalk.gray('   Expected locations:'));
        possibleBackendLogs.forEach(p => console.log(chalk.gray(`   - ${p}`)));
        console.log();
      }
    }

    // Find frontend logs
    if (showFrontend) {
      const possibleFrontendLogs = [
        path.join(process.cwd(), 'logs', 'frontend.log'),
        path.join(process.cwd(), 'frontend.log')
      ];

      for (const logPath of possibleFrontendLogs) {
        if (await fs.pathExists(logPath)) {
          logFiles.push({ service: 'frontend', path: logPath, color: 'blue' });
          break;
        }
      }

      if (logFiles.length === 0 && showFrontend) {
        console.log(chalk.yellow('⚠️  Frontend log file not found'));
        console.log(chalk.gray('   Frontend logs are typically shown in the console'));
        console.log();
      }
    }

    if (logFiles.length === 0) {
      console.log(chalk.yellow('⚠️  No log files found'));
      console.log();
      return;
    }

    // Show logs
    for (const logFile of logFiles) {
      console.log(chalk[logFile.color].bold(`📄 ${logFile.service.toUpperCase()} LOGS`));
      console.log(chalk.gray(`   ${logFile.path}\n`));

      try {
        const content = await fs.readFile(logFile.path, 'utf-8');
        const lines = content.split('\n');
        const lastLines = lines.slice(-50); // Show last 50 lines

        lastLines.forEach(line => {
          if (line.trim()) {
            console.log(chalk.gray(line));
          }
        });

        console.log();

        if (follow) {
          console.log(chalk.gray(`Following ${logFile.service} logs... (Press Ctrl+C to exit)`));
          console.log();
        }
      } catch (error) {
        console.log(chalk.red(`   ❌ Failed to read log file: ${error.message}\n`));
      }
    }

    if (follow && logFiles.length > 0) {
      console.log(chalk.yellow('⚠️  Live log following not yet implemented'));
      console.log(chalk.gray('   Use: tail -f ' + logFiles[0].path));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold('❌ Failed to show logs:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(1);
  }
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  setup: setupDevEnvironment,
  start: startDevServers,
  stop: stopDevServers,
  logs: showDevLogs
};
