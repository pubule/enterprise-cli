/**
 * Status Command - Display Enterprise CLI workspace status
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { CLI_VERSION, FRAMEWORK_VERSION, CLI_NAME } = require('../config');

/**
 * Check if a command is available in PATH
 */
function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version of a command
 */
function getVersion(command, args = '--version') {
  try {
    const output = execSync(`${command} ${args}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    return output.split('\n')[0].trim();
  } catch {
    return 'Not installed';
  }
}

/**
 * Display workspace status
 */
async function statusCommand() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '.enterpriserc');

  console.log();
  console.log(chalk.cyan.bold(`╔═══════════════════════════════════════════════════════════════╗`));
  console.log(chalk.cyan.bold(`║  ${CLI_NAME.padEnd(57)}║`));
  console.log(chalk.cyan.bold(`╚═══════════════════════════════════════════════════════════════╝`));
  console.log();

  // CLI Information
  console.log(chalk.white.bold('📦 CLI Information'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log(`  ${chalk.cyan('CLI Version:')}         ${chalk.white(CLI_VERSION)}`);
  console.log(`  ${chalk.cyan('Framework Version:')}   ${chalk.white(`v${FRAMEWORK_VERSION}`)}`);
  console.log();

  // Workspace Status
  console.log(chalk.white.bold('🏗️  Workspace Status'));
  console.log(chalk.gray('─'.repeat(65)));

  if (await fs.pathExists(configPath)) {
    const config = await fs.readJson(configPath);
    console.log(`  ${chalk.green('✓')} Initialized`);
    console.log(`  ${chalk.cyan('Root:')}              ${chalk.white(config.workspace.root)}`);
    console.log(`  ${chalk.cyan('Initialized:')}       ${chalk.white(new Date(config.initialized).toLocaleString())}`);
    console.log(`  ${chalk.cyan('Config Version:')}    ${chalk.white(config.version)}`);
  } else {
    console.log(`  ${chalk.yellow('⚠')} Not initialized`);
    console.log(`  ${chalk.gray('Run')} ${chalk.cyan('ent init')} ${chalk.gray('to initialize workspace')}`);
  }
  console.log();

  // Environment Check
  console.log(chalk.white.bold('🔧 Environment'));
  console.log(chalk.gray('─'.repeat(65)));

  // Java
  const javaInstalled = checkCommand('java');
  const javaIcon = javaInstalled ? chalk.green('✓') : chalk.red('✗');
  const javaVersion = javaInstalled ? getVersion('java', '-version 2>&1') : 'Not installed';
  console.log(`  ${javaIcon} ${chalk.cyan('Java:')}             ${chalk.white(javaVersion)}`);

  // Maven
  const mavenInstalled = checkCommand('mvn');
  const mavenIcon = mavenInstalled ? chalk.green('✓') : chalk.red('✗');
  const mavenVersion = mavenInstalled ? getVersion('mvn') : 'Not installed';
  console.log(`  ${mavenIcon} ${chalk.cyan('Maven:')}            ${chalk.white(mavenVersion)}`);

  // Node.js
  const nodeVersion = getVersion('node');
  console.log(`  ${chalk.green('✓')} ${chalk.cyan('Node.js:')}          ${chalk.white(nodeVersion)}`);

  // NPM
  const npmVersion = getVersion('npm');
  console.log(`  ${chalk.green('✓')} ${chalk.cyan('NPM:')}              ${chalk.white(npmVersion)}`);

  // Docker
  const dockerInstalled = checkCommand('docker');
  const dockerIcon = dockerInstalled ? chalk.green('✓') : chalk.yellow('⚠');
  const dockerVersion = dockerInstalled ? getVersion('docker') : 'Not installed (optional)';
  console.log(`  ${dockerIcon} ${chalk.cyan('Docker:')}           ${chalk.white(dockerVersion)}`);

  // Kubernetes (kubectl)
  const kubectlInstalled = checkCommand('kubectl');
  const kubectlIcon = kubectlInstalled ? chalk.green('✓') : chalk.yellow('⚠');
  const kubectlVersion = kubectlInstalled ? getVersion('kubectl') : 'Not installed (optional)';
  console.log(`  ${kubectlIcon} ${chalk.cyan('Kubernetes:')}       ${chalk.white(kubectlVersion)}`);

  console.log();

  // Available Commands
  console.log(chalk.white.bold('🚀 Available Commands'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log(`  ${chalk.cyan('ent init')}                        Initialize workspace`);
  console.log(`  ${chalk.cyan('ent generate')} <name>             Generate Spring Boot microservice`);
  console.log(`  ${chalk.cyan('ent frontend create')} <name>     Create React application`);
  console.log(`  ${chalk.cyan('ent dev setup')}                  Setup development environment`);
  console.log(`  ${chalk.cyan('ent dev start')}                  Start development servers`);
  console.log(`  ${chalk.cyan('ent status')}                     Show this status (current command)`);
  console.log();

  // Warnings
  if (!javaInstalled || !mavenInstalled) {
    console.log(chalk.yellow.bold('⚠️  Warning'));
    console.log(chalk.gray('─'.repeat(65)));
    if (!javaInstalled) {
      console.log(chalk.yellow('  • Java is required for Spring Boot microservices'));
    }
    if (!mavenInstalled) {
      console.log(chalk.yellow('  • Maven is required for building Spring Boot applications'));
    }
    console.log();
  }

  console.log(chalk.gray('─'.repeat(65)));
  console.log();
}

module.exports = { statusCommand };
