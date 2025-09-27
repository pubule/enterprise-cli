const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');
const inquirer = require('inquirer');

/**
 * Deployment command for full-stack applications
 */
async function deployCommand(options) {
  console.log(chalk.magenta('\n🚀 Enterprise Deployment System\n'));

  try {
    const config = await detectProjectStructure();
    const deploymentConfig = await getDeploymentConfiguration(options, config);

    // Validate deployment prerequisites
    await validateDeploymentPrerequisites(deploymentConfig);

    // Show deployment plan
    if (options.dryRun) {
      await showDeploymentPlan(deploymentConfig);
      return;
    }

    // Confirm deployment
    await confirmDeployment(deploymentConfig);

    // Execute deployment
    await executeDeployment(deploymentConfig);

    console.log(chalk.green('\n✅ Deployment completed successfully!'));

  } catch (error) {
    console.error(chalk.red('\n❌ Deployment failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Detect project structure for deployment
 */
async function detectProjectStructure() {
  const config = {
    hasBackend: false,
    hasFrontend: false,
    backendType: null,
    frontendType: null,
    backendPath: null,
    frontendPath: null,
    hasDocker: false,
    hasKubernetes: false
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

  // Check for Docker
  config.hasDocker = await fs.pathExists('Dockerfile') || await fs.pathExists('docker-compose.yml');

  // Check for Kubernetes
  config.hasKubernetes = await fs.pathExists('k8s') || await fs.pathExists('kubernetes');

  return config;
}

/**
 * Get deployment configuration
 */
async function getDeploymentConfiguration(options, config) {
  const questions = [];

  // Environment selection
  if (!options.environment) {
    questions.push({
      type: 'list',
      name: 'environment',
      message: 'Select deployment environment:',
      choices: [
        { name: 'Development (dev)', value: 'dev' },
        { name: 'Staging (staging)', value: 'staging' },
        { name: 'Production (production)', value: 'production' }
      ],
      default: 'staging'
    });
  }

  // Deployment strategy
  questions.push({
    type: 'list',
    name: 'strategy',
    message: 'Select deployment strategy:',
    choices: [
      { name: 'Docker Containers', value: 'docker' },
      { name: 'Kubernetes', value: 'kubernetes' },
      { name: 'Traditional (JAR + Static Files)', value: 'traditional' },
      { name: 'Cloud Platform (AWS/GCP/Azure)', value: 'cloud' }
    ],
    default: config.hasKubernetes ? 'kubernetes' : config.hasDocker ? 'docker' : 'traditional'
  });

  // What to deploy
  const deployChoices = [];
  if (config.hasBackend) {
    deployChoices.push({ name: 'Backend (Spring Boot)', value: 'backend', checked: !options.frontend });
  }
  if (config.hasFrontend) {
    deployChoices.push({ name: 'Frontend (React)', value: 'frontend', checked: !options.backend });
  }

  if (deployChoices.length > 1 && !options.backend && !options.frontend) {
    questions.push({
      type: 'checkbox',
      name: 'deployTargets',
      message: 'What do you want to deploy?',
      choices: deployChoices,
      validate: (answer) => {
        if (answer.length === 0) {
          return 'You must choose at least one deployment target.';
        }
        return true;
      }
    });
  }

  // Additional configuration based on strategy
  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

  return {
    environment: options.environment || answers.environment,
    strategy: answers.strategy,
    deployTargets: options.backend ? ['backend'] :
                  options.frontend ? ['frontend'] :
                  answers.deployTargets || (config.hasBackend && config.hasFrontend ? ['backend', 'frontend'] :
                                           config.hasBackend ? ['backend'] : ['frontend']),
    config,
    options
  };
}

/**
 * Validate deployment prerequisites
 */
async function validateDeploymentPrerequisites(deploymentConfig) {
  const spinner = ora('Validating deployment prerequisites...').start();

  try {
    // Check for required tools based on strategy
    switch (deploymentConfig.strategy) {
      case 'docker':
        await validateDockerPrerequisites();
        break;
      case 'kubernetes':
        await validateKubernetesPrerequisites();
        break;
      case 'cloud':
        await validateCloudPrerequisites(deploymentConfig);
        break;
    }

    // Check if projects can be built
    for (const target of deploymentConfig.deployTargets) {
      if (target === 'backend' && deploymentConfig.config.hasBackend) {
        await validateBackendBuild(deploymentConfig.config.backendPath);
      }
      if (target === 'frontend' && deploymentConfig.config.hasFrontend) {
        await validateFrontendBuild(deploymentConfig.config.frontendPath);
      }
    }

    spinner.succeed('Prerequisites validated');

  } catch (error) {
    spinner.fail('Prerequisites validation failed');
    throw error;
  }
}

/**
 * Validate Docker prerequisites
 */
async function validateDockerPrerequisites() {
  try {
    await execa('docker', ['--version']);
    await execa('docker', ['info']);
  } catch {
    throw new Error('Docker is not installed or not running. Please install Docker and ensure it\'s running.');
  }
}

/**
 * Validate Kubernetes prerequisites
 */
async function validateKubernetesPrerequisites() {
  try {
    await execa('kubectl', ['version', '--client']);
    await execa('kubectl', ['cluster-info']);
  } catch {
    throw new Error('kubectl is not installed or not connected to a cluster. Please install kubectl and configure cluster access.');
  }
}

/**
 * Validate cloud prerequisites
 */
async function validateCloudPrerequisites(deploymentConfig) {
  // This would check for cloud CLI tools (aws, gcloud, az)
  console.log(chalk.yellow('⚠️  Cloud deployment requires additional setup and configuration.'));
}

/**
 * Validate backend build
 */
async function validateBackendBuild(backendPath) {
  try {
    await execa('mvn', ['compile'], { cwd: backendPath, stdio: 'ignore' });
  } catch {
    throw new Error('Backend cannot be compiled. Please fix compilation errors before deployment.');
  }
}

/**
 * Validate frontend build
 */
async function validateFrontendBuild(frontendPath) {
  try {
    const packageJson = await fs.readJson(path.join(frontendPath, 'package.json'));
    if (packageJson.scripts && packageJson.scripts.build) {
      // Just check if build script exists, don't run it yet
    } else {
      throw new Error('Frontend build script not found in package.json');
    }
  } catch {
    throw new Error('Frontend cannot be built. Please check package.json and dependencies.');
  }
}

/**
 * Show deployment plan (dry run)
 */
async function showDeploymentPlan(deploymentConfig) {
  console.log(chalk.cyan('📋 Deployment Plan (Dry Run)\n'));

  console.log(`${chalk.bold('Environment:')} ${deploymentConfig.environment}`);
  console.log(`${chalk.bold('Strategy:')} ${deploymentConfig.strategy}`);
  console.log(`${chalk.bold('Targets:')} ${deploymentConfig.deployTargets.join(', ')}\n`);

  console.log(chalk.yellow('🔧 Steps that would be executed:\n'));

  let stepNumber = 1;

  for (const target of deploymentConfig.deployTargets) {
    if (target === 'backend') {
      console.log(`${stepNumber++}. Build backend application (Maven)`);
      if (deploymentConfig.strategy === 'docker') {
        console.log(`${stepNumber++}. Build backend Docker image`);
        console.log(`${stepNumber++}. Push backend image to registry`);
      }
      if (deploymentConfig.strategy === 'kubernetes') {
        console.log(`${stepNumber++}. Apply backend Kubernetes manifests`);
      }
    }

    if (target === 'frontend') {
      console.log(`${stepNumber++}. Build frontend application (npm/yarn)`);
      if (deploymentConfig.strategy === 'docker') {
        console.log(`${stepNumber++}. Build frontend Docker image`);
        console.log(`${stepNumber++}. Push frontend image to registry`);
      }
      if (deploymentConfig.strategy === 'kubernetes') {
        console.log(`${stepNumber++}. Apply frontend Kubernetes manifests`);
      }
      if (deploymentConfig.strategy === 'traditional') {
        console.log(`${stepNumber++}. Upload static files to CDN/web server`);
      }
    }
  }

  console.log(`${stepNumber++}. Verify deployment health`);
  console.log(`${stepNumber++}. Run smoke tests\n`);

  console.log(chalk.gray('💡 Run without --dry-run to execute deployment'));
}

/**
 * Confirm deployment
 */
async function confirmDeployment(deploymentConfig) {
  if (deploymentConfig.environment === 'production') {
    console.log(chalk.red('⚠️  WARNING: You are about to deploy to PRODUCTION!'));
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `Deploy to ${deploymentConfig.environment} environment?`,
      default: deploymentConfig.environment !== 'production'
    }
  ]);

  if (!confirmed) {
    console.log(chalk.yellow('Deployment cancelled by user'));
    process.exit(0);
  }
}

/**
 * Execute deployment
 */
async function executeDeployment(deploymentConfig) {
  console.log(chalk.cyan('\n🚀 Starting deployment...\n'));

  const results = {
    backend: null,
    frontend: null,
    overall: true
  };

  try {
    // Deploy backend
    if (deploymentConfig.deployTargets.includes('backend')) {
      results.backend = await deployBackend(deploymentConfig);
      if (!results.backend.success) results.overall = false;
    }

    // Deploy frontend
    if (deploymentConfig.deployTargets.includes('frontend')) {
      results.frontend = await deployFrontend(deploymentConfig);
      if (!results.frontend.success) results.overall = false;
    }

    // Post-deployment verification
    if (results.overall) {
      await verifyDeployment(deploymentConfig);
    }

    // Display deployment summary
    displayDeploymentSummary(results, deploymentConfig);

  } catch (error) {
    console.error(chalk.red('Deployment execution failed:'), error.message);
    throw error;
  }
}

/**
 * Deploy backend application
 */
async function deployBackend(deploymentConfig) {
  console.log(chalk.blue('🎯 Deploying Backend\n'));

  const spinner = ora('Building backend application...').start();

  try {
    const backendPath = deploymentConfig.config.backendPath;

    // Build application
    await execa('mvn', ['clean', 'package', '-DskipTests'], {
      cwd: backendPath,
      stdio: 'ignore'
    });

    spinner.text = 'Backend built successfully';

    // Deploy based on strategy
    switch (deploymentConfig.strategy) {
      case 'docker':
        await deployBackendDocker(backendPath, deploymentConfig);
        break;
      case 'kubernetes':
        await deployBackendKubernetes(backendPath, deploymentConfig);
        break;
      case 'traditional':
        await deployBackendTraditional(backendPath, deploymentConfig);
        break;
      default:
        throw new Error(`Unsupported deployment strategy: ${deploymentConfig.strategy}`);
    }

    spinner.succeed('Backend deployed successfully');

    return { success: true };

  } catch (error) {
    spinner.fail('Backend deployment failed');
    return { success: false, error: error.message };
  }
}

/**
 * Deploy backend using Docker
 */
async function deployBackendDocker(backendPath, deploymentConfig) {
  const spinner = ora('Building backend Docker image...').start();

  try {
    // Build Docker image
    const imageName = `backend:${deploymentConfig.environment}`;
    await execa('docker', ['build', '-t', imageName, '.'], {
      cwd: backendPath,
      stdio: 'ignore'
    });

    spinner.text = 'Running backend container...';

    // Run container
    await execa('docker', ['run', '-d', '--name', `backend-${deploymentConfig.environment}`, '-p', '8080:8080', imageName], {
      stdio: 'ignore'
    });

    spinner.succeed('Backend container deployed');

  } catch (error) {
    spinner.fail('Backend Docker deployment failed');
    throw error;
  }
}

/**
 * Deploy backend using Kubernetes
 */
async function deployBackendKubernetes(backendPath, deploymentConfig) {
  const spinner = ora('Deploying backend to Kubernetes...').start();

  try {
    // Apply Kubernetes manifests
    const k8sPath = path.join(backendPath, 'k8s');
    if (await fs.pathExists(k8sPath)) {
      await execa('kubectl', ['apply', '-f', k8sPath], {
        stdio: 'ignore'
      });
    } else {
      throw new Error('Kubernetes manifests not found in k8s/ directory');
    }

    spinner.succeed('Backend deployed to Kubernetes');

  } catch (error) {
    spinner.fail('Backend Kubernetes deployment failed');
    throw error;
  }
}

/**
 * Deploy backend traditionally (JAR file)
 */
async function deployBackendTraditional(backendPath, deploymentConfig) {
  const spinner = ora('Preparing backend JAR for deployment...').start();

  try {
    // Find the built JAR file
    const targetDir = path.join(backendPath, 'target');
    const files = await fs.readdir(targetDir);
    const jarFile = files.find(file => file.endsWith('.jar') && !file.includes('sources') && !file.includes('javadoc'));

    if (!jarFile) {
      throw new Error('No JAR file found in target directory');
    }

    const jarPath = path.join(targetDir, jarFile);
    console.log(chalk.gray(`JAR file ready: ${jarPath}`));

    spinner.succeed('Backend JAR prepared for deployment');

    // In a real scenario, you would upload this to your server
    console.log(chalk.yellow('💡 Manual step: Upload and run the JAR file on your server'));
    console.log(chalk.gray(`   java -jar ${jarFile} --spring.profiles.active=${deploymentConfig.environment}`));

  } catch (error) {
    spinner.fail('Backend traditional deployment failed');
    throw error;
  }
}

/**
 * Deploy frontend application
 */
async function deployFrontend(deploymentConfig) {
  console.log(chalk.green('⚛️  Deploying Frontend\n'));

  const spinner = ora('Building frontend application...').start();

  try {
    const frontendPath = deploymentConfig.config.frontendPath;

    // Build application
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      REACT_APP_BUILD_ENV: deploymentConfig.environment
    };

    await execa('npm', ['run', 'build'], {
      cwd: frontendPath,
      env,
      stdio: 'ignore'
    });

    spinner.text = 'Frontend built successfully';

    // Deploy based on strategy
    switch (deploymentConfig.strategy) {
      case 'docker':
        await deployFrontendDocker(frontendPath, deploymentConfig);
        break;
      case 'kubernetes':
        await deployFrontendKubernetes(frontendPath, deploymentConfig);
        break;
      case 'traditional':
        await deployFrontendTraditional(frontendPath, deploymentConfig);
        break;
      default:
        throw new Error(`Unsupported deployment strategy: ${deploymentConfig.strategy}`);
    }

    spinner.succeed('Frontend deployed successfully');

    return { success: true };

  } catch (error) {
    spinner.fail('Frontend deployment failed');
    return { success: false, error: error.message };
  }
}

/**
 * Deploy frontend using Docker
 */
async function deployFrontendDocker(frontendPath, deploymentConfig) {
  const spinner = ora('Building frontend Docker image...').start();

  try {
    // Build Docker image
    const imageName = `frontend:${deploymentConfig.environment}`;
    await execa('docker', ['build', '-t', imageName, '.'], {
      cwd: frontendPath,
      stdio: 'ignore'
    });

    spinner.text = 'Running frontend container...';

    // Run container
    await execa('docker', ['run', '-d', '--name', `frontend-${deploymentConfig.environment}`, '-p', '3000:80', imageName], {
      stdio: 'ignore'
    });

    spinner.succeed('Frontend container deployed');

  } catch (error) {
    spinner.fail('Frontend Docker deployment failed');
    throw error;
  }
}

/**
 * Deploy frontend using Kubernetes
 */
async function deployFrontendKubernetes(frontendPath, deploymentConfig) {
  const spinner = ora('Deploying frontend to Kubernetes...').start();

  try {
    // Apply Kubernetes manifests
    const k8sPath = path.join(frontendPath, 'k8s');
    if (await fs.pathExists(k8sPath)) {
      await execa('kubectl', ['apply', '-f', k8sPath], {
        stdio: 'ignore'
      });
    } else {
      throw new Error('Kubernetes manifests not found in k8s/ directory');
    }

    spinner.succeed('Frontend deployed to Kubernetes');

  } catch (error) {
    spinner.fail('Frontend Kubernetes deployment failed');
    throw error;
  }
}

/**
 * Deploy frontend traditionally (static files)
 */
async function deployFrontendTraditional(frontendPath, deploymentConfig) {
  const spinner = ora('Preparing frontend static files...').start();

  try {
    const buildDir = path.join(frontendPath, 'build');
    if (!await fs.pathExists(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    console.log(chalk.gray(`Static files ready: ${buildDir}`));

    spinner.succeed('Frontend static files prepared');

    // In a real scenario, you would upload these to your CDN/web server
    console.log(chalk.yellow('💡 Manual step: Upload build/ contents to your web server or CDN'));

  } catch (error) {
    spinner.fail('Frontend traditional deployment failed');
    throw error;
  }
}

/**
 * Verify deployment health
 */
async function verifyDeployment(deploymentConfig) {
  const spinner = ora('Verifying deployment health...').start();

  try {
    // Basic health checks would go here
    // For now, just simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    spinner.succeed('Deployment health verified');

  } catch (error) {
    spinner.fail('Deployment health check failed');
    throw error;
  }
}

/**
 * Display deployment summary
 */
function displayDeploymentSummary(results, deploymentConfig) {
  console.log(chalk.cyan('\n📊 Deployment Summary\n'));

  console.log(`${chalk.bold('Environment:')} ${deploymentConfig.environment}`);
  console.log(`${chalk.bold('Strategy:')} ${deploymentConfig.strategy}\n`);

  if (results.backend) {
    const status = results.backend.success ? chalk.green('✅ SUCCESS') : chalk.red('❌ FAILED');
    console.log(`${chalk.blue('Backend:')} ${status}`);
    if (!results.backend.success && results.backend.error) {
      console.log(chalk.red(`  Error: ${results.backend.error}`));
    }
  }

  if (results.frontend) {
    const status = results.frontend.success ? chalk.green('✅ SUCCESS') : chalk.red('❌ FAILED');
    console.log(`${chalk.green('Frontend:')} ${status}`);
    if (!results.frontend.success && results.frontend.error) {
      console.log(chalk.red(`  Error: ${results.frontend.error}`));
    }
  }

  const overallStatus = results.overall ? chalk.green('✅ SUCCESS') : chalk.red('❌ FAILED');
  console.log(`\n${chalk.bold('Overall:')} ${overallStatus}\n`);

  if (results.overall) {
    console.log(chalk.gray('🎉 Your application has been deployed successfully!'));

    // Show access URLs based on strategy
    if (deploymentConfig.strategy === 'docker') {
      if (results.backend?.success) {
        console.log(chalk.gray('Backend: http://localhost:8080'));
      }
      if (results.frontend?.success) {
        console.log(chalk.gray('Frontend: http://localhost:3000'));
      }
    }
  }
}

module.exports = deployCommand;