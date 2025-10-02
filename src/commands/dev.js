/**
 * Dev Command
 * Manages development environment setup and server lifecycle
 */

const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { spawn, execSync } = require('child_process');
const {
  FILES,
  URLS,
  PORTS,
  PROFILES,
  EXIT_CODES,
  SYMBOLS,
  MESSAGES
} = require('../constants');

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
    console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.COULD_NOT_READ_PIDS}: ${error.message}`));
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
    console.log(chalk.cyan.bold(`\n${SYMBOLS.TOOLS} ${MESSAGES.HEADERS.DEV_ENV_SETUP}\n`));

    // Determine scope
    const setupBackend = options.backend || (!options.frontend && !options.docker);
    const setupFrontend = options.frontend || (!options.backend && !options.docker);
    const setupDocker = options.docker;

    const setupSummary = [];

    // Setup backend
    if (setupBackend) {
      console.log(chalk.yellow.bold(`${SYMBOLS.PACKAGE} ${MESSAGES.HEADERS.BACKEND_SETUP}\n`));

      // Check Java
      const spinner1 = ora('Checking Java...').start();
      const java = checkJavaInstalled();
      if (!java.installed) {
        spinner1.fail('Java not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.JAVA_REQUIRED}`));
        console.log(chalk.gray('   Install Java JDK 17 or higher'));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner1.succeed(`Java ${java.version} found`);

      // Check Maven
      const spinner2 = ora('Checking Maven...').start();
      const maven = checkMavenInstalled();
      if (!maven.installed) {
        spinner2.fail('Maven not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.MAVEN_REQUIRED}`));
        console.log(chalk.gray('   Install Apache Maven 3.8 or higher'));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner2.succeed(`Maven ${maven.version} found`);

      // Check for pom.xml
      const pomPath = path.join(process.cwd(), FILES.POM_XML);
      if (!(await fs.pathExists(pomPath))) {
        console.log(chalk.yellow(`   ${SYMBOLS.WARNING} ${MESSAGES.ERROR.POM_XML_NOT_FOUND}`));
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
          setupSummary.push(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.BACKEND_READY}`);
        } catch (error) {
          spinner3.fail('Maven build failed');
          console.log(chalk.red(`   ${SYMBOLS.ERROR} ${error.message}`));
          process.exit(EXIT_CODES.ERROR);
        }
      }

      console.log();
    }

    // Setup frontend
    if (setupFrontend) {
      console.log(chalk.yellow.bold(`⚛️  ${MESSAGES.HEADERS.FRONTEND_SETUP}\n`));

      // Check Node.js
      const spinner1 = ora('Checking Node.js...').start();
      const node = checkNodeInstalled();
      if (!node.installed) {
        spinner1.fail('Node.js not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.NODE_REQUIRED}`));
        console.log(chalk.gray('   Install Node.js 18 or higher'));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner1.succeed(`Node.js ${node.version} found`);

      // Check NPM
      const spinner2 = ora('Checking NPM...').start();
      const npm = checkNpmInstalled();
      if (!npm.installed) {
        spinner2.fail('NPM not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.NPM_REQUIRED}`));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner2.succeed(`NPM ${npm.version} found`);

      // Check for package.json
      const packagePath = path.join(process.cwd(), FILES.PACKAGE_JSON);
      if (!(await fs.pathExists(packagePath))) {
        console.log(chalk.yellow(`   ${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_PACKAGE_JSON}`));
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
          setupSummary.push(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.FRONTEND_READY}`);
        } catch (error) {
          spinner3.fail('NPM install failed');
          console.log(chalk.red(`   ${SYMBOLS.ERROR} ${error.message}`));
          process.exit(EXIT_CODES.ERROR);
        }
      }

      console.log();
    }

    // Setup Docker
    if (setupDocker) {
      console.log(chalk.yellow.bold(`🐳 ${MESSAGES.HEADERS.DOCKER_SETUP}\n`));

      // Check Docker
      const spinner1 = ora('Checking Docker...').start();
      const docker = checkDockerInstalled();
      if (!docker.installed) {
        spinner1.fail('Docker not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.DOCKER_REQUIRED}`));
        console.log(chalk.gray('   Install Docker Desktop'));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner1.succeed(`Docker ${docker.version} found`);

      // Check Docker Compose
      const spinner2 = ora('Checking Docker Compose...').start();
      const compose = checkDockerComposeInstalled();
      if (!compose.installed) {
        spinner2.fail('Docker Compose not found');
        console.log(chalk.red(`   ${SYMBOLS.ERROR} ${MESSAGES.ERROR.DOCKER_COMPOSE_REQUIRED}`));
        process.exit(EXIT_CODES.ERROR);
      }
      spinner2.succeed(`Docker Compose ${compose.version} found`);

      // Check for docker-compose.yml
      const composePath = path.join(process.cwd(), FILES.DOCKER_COMPOSE);
      if (!(await fs.pathExists(composePath))) {
        console.log(chalk.yellow(`   ${SYMBOLS.WARNING} ${MESSAGES.ERROR.DOCKER_COMPOSE_NOT_FOUND}`));
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
          setupSummary.push(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.DOCKER_READY}`);
        } catch (error) {
          spinner3.fail('Docker Compose failed');
          console.log(chalk.red(`   ${SYMBOLS.ERROR} ${error.message}`));
          process.exit(EXIT_CODES.ERROR);
        }
      }

      console.log();
    }

    // Show summary
    console.log(chalk.green.bold(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.SETUP_COMPLETE}!\n`));
    if (setupSummary.length > 0) {
      setupSummary.forEach(item => console.log(chalk.gray(`   ${item}`)));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold(`${SYMBOLS.ERROR} ${MESSAGES.ERROR.SETUP_FAILED}:`));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(EXIT_CODES.ERROR);
  }
}

/**
 * Start development servers
 * @param {object} options - Command options
 */
async function startDevServers(options = {}) {
  try {
    console.log(chalk.cyan.bold(`\n${SYMBOLS.ROCKET} ${MESSAGES.HEADERS.STARTING_DEV_SERVERS}\n`));

    // Determine what to start
    const startBackend = options.backend || options.fullStack || (!options.frontend);
    const startFrontend = options.frontend || options.fullStack;
    const profile = options.profile || PROFILES.DEV;

    const startedServices = [];

    // Start backend
    if (startBackend) {
      const pomPath = path.join(process.cwd(), FILES.POM_XML);

      if (!(await fs.pathExists(pomPath))) {
        console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_POM_XML}`));
      } else {
        // Check dependencies
        const java = checkJavaInstalled();
        const maven = checkMavenInstalled();

        if (!java.installed || !maven.installed) {
          console.log(chalk.red(`${SYMBOLS.ERROR} Java and Maven are required for backend`));
          console.log(chalk.gray('   Run: enterprise dev setup --backend'));
          process.exit(EXIT_CODES.ERROR);
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
          console.log(chalk.green(`   ${SYMBOLS.SUCCESS} Backend: ${URLS.LOCALHOST_BACKEND}`));
          console.log(chalk.gray(`   PID: ${backendProcess.pid}`));
          console.log(chalk.gray(`   Profile: ${profile}`));
          console.log();

          startedServices.push('backend');
        } catch (error) {
          spinner.fail('Failed to start backend');
          console.log(chalk.red(`   ${SYMBOLS.ERROR} ${error.message}`));
        }
      }
    }

    // Start frontend
    if (startFrontend) {
      const packagePath = path.join(process.cwd(), FILES.PACKAGE_JSON);

      if (!(await fs.pathExists(packagePath))) {
        console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_PACKAGE_JSON}`));
      } else {
        // Check dependencies
        const node = checkNodeInstalled();
        const npm = checkNpmInstalled();

        if (!node.installed || !npm.installed) {
          console.log(chalk.red(`${SYMBOLS.ERROR} Node.js and NPM are required for frontend`));
          console.log(chalk.gray('   Run: enterprise dev setup --frontend'));
          process.exit(EXIT_CODES.ERROR);
        }

        // Check for dev script
        const packageJson = await fs.readJson(packagePath);
        const startScript = packageJson.scripts?.dev || packageJson.scripts?.start;

        if (!startScript) {
          console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.ERROR.NO_DEV_SCRIPT}`));
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
            console.log(chalk.green(`   ${SYMBOLS.SUCCESS} Frontend: ${URLS.LOCALHOST_FRONTEND}`));
            console.log(chalk.gray(`   PID: ${frontendProcess.pid}`));
            console.log();

            startedServices.push('frontend');
          } catch (error) {
            spinner.fail('Failed to start frontend');
            console.log(chalk.red(`   ${SYMBOLS.ERROR} ${error.message}`));
          }
        }
      }
    }

    // Show summary
    if (startedServices.length > 0) {
      console.log(chalk.green.bold(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.SERVERS_STARTED}!\n`));
      console.log(chalk.gray('   To stop servers:  enterprise dev stop'));
      console.log(chalk.gray('   To view logs:     enterprise dev logs'));
      console.log();
    } else {
      console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_SERVERS_STARTED}`));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold(`${SYMBOLS.ERROR} ${MESSAGES.ERROR.START_FAILED}:`));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(EXIT_CODES.ERROR);
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
      console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_SERVERS_RUNNING}`));
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
    console.log(chalk.green.bold(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.SERVERS_STOPPED}`));
    console.log();

  } catch (error) {
    console.log();
    console.log(chalk.red.bold(`${SYMBOLS.ERROR} ${MESSAGES.ERROR.STOP_FAILED}:`));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(EXIT_CODES.ERROR);
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
        console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.BACKEND_LOG_NOT_FOUND}`));
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
        console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.FRONTEND_LOG_NOT_FOUND}`));
        console.log(chalk.gray('   Frontend logs are typically shown in the console'));
        console.log();
      }
    }

    if (logFiles.length === 0) {
      console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.NO_LOG_FILES}`));
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
        console.log(chalk.red(`   ${SYMBOLS.ERROR} Failed to read log file: ${error.message}\n`));
      }
    }

    if (follow && logFiles.length > 0) {
      console.log(chalk.yellow(`${SYMBOLS.WARNING} ${MESSAGES.WARNING.FOLLOW_NOT_IMPLEMENTED}`));
      console.log(chalk.gray('   Use: tail -f ' + logFiles[0].path));
      console.log();
    }

  } catch (error) {
    console.log();
    console.log(chalk.red.bold(`${SYMBOLS.ERROR} ${MESSAGES.ERROR.LOGS_FAILED}:`));
    console.log(chalk.red(`   ${error.message}`));
    console.log();
    process.exit(EXIT_CODES.ERROR);
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
