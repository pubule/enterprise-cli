/**
 * Init Command - Initialize Enterprise CLI workspace
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { FRAMEWORK_VERSION, PATHS } = require('../config');
const {
  DATABASES,
  FILES,
  UI_FRAMEWORKS,
  SYMBOLS,
  EXIT_CODES,
  MESSAGES
} = require('../constants');

/**
 * Initialize Enterprise CLI workspace
 * Creates necessary directories and configuration files
 */
async function initCommand() {
  const spinner = ora('Initializing Enterprise CLI workspace...').start();

  try {
    const cwd = process.cwd();

    // Create workspace directories
    const workspaceDir = path.join(cwd, PATHS.workspace);
    const customTemplatesDir = path.join(cwd, PATHS.customTemplates);

    await fs.ensureDir(workspaceDir);
    await fs.ensureDir(customTemplatesDir);

    // Create .enterpriserc configuration file
    const config = {
      version: FRAMEWORK_VERSION,
      initialized: new Date().toISOString(),
      workspace: {
        root: cwd,
        customTemplates: PATHS.customTemplates
      },
      defaults: {
        database: DATABASES.POSTGRESQL,
        framework: {
          auth: true,
          camel: true,
          flyway: true,
          openApi: true
        },
        deployment: {
          docker: true,
          kubernetes: true
        }
      }
    };

    const configPath = path.join(cwd, FILES.ENTERPRISERC);
    await fs.writeJson(configPath, config, { spaces: 2 });

    // Create README in workspace directory
    const readmePath = path.join(workspaceDir, FILES.README);
    const readmeContent = `# Enterprise CLI Workspace

This directory is used by Enterprise CLI for managing your projects.

## Structure

- \`.enterprise/\` - Workspace directory (this folder)
- \`templates/custom/\` - Your custom templates
- \`.enterpriserc\` - Workspace configuration

## Framework Version

Enterprise Framework: v${FRAMEWORK_VERSION}

## Usage

Generate a microservice:
\`\`\`bash
ent generate my-service --domain user --package com.company.user
\`\`\`

Generate a React app:
\`\`\`bash
ent frontend create my-app --template ${UI_FRAMEWORKS.MATERIAL_UI}
\`\`\`

Check status:
\`\`\`bash
ent status
\`\`\`

## Documentation

For full documentation, visit the Enterprise CLI docs.
`;

    await fs.writeFile(readmePath, readmeContent);

    spinner.succeed();

    // Success message
    console.log();
    console.log(chalk.green(`${SYMBOLS.SUCCESS} ${MESSAGES.SUCCESS.WORKSPACE_INITIALIZED}`));
    console.log(chalk.cyan(MESSAGES.SUCCESS.READY_TO_GENERATE));
    console.log();
    console.log(chalk.gray(`${MESSAGES.INFO.CREATED}:`));
    console.log(chalk.gray(`  • ${PATHS.workspace}/`));
    console.log(chalk.gray(`  • ${PATHS.customTemplates}/`));
    console.log(chalk.gray(`  • ${FILES.ENTERPRISERC}`));
    console.log();
    console.log(chalk.white(`${MESSAGES.INFO.NEXT_STEPS}:`));
    console.log(chalk.white(`  ${chalk.cyan('ent generate')} <service-name>  - Generate a microservice`));
    console.log(chalk.white(`  ${chalk.cyan('ent frontend create')} <app-name> - Create a React app`));
    console.log(chalk.white(`  ${chalk.cyan('ent status')}                    - Check workspace status`));
    console.log();

  } catch (error) {
    spinner.fail(MESSAGES.ERROR.WORKSPACE_INIT_FAILED);
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(EXIT_CODES.ERROR);
  }
}

module.exports = { initCommand };
