const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execa } = require('execa');

/**
 * Comprehensive testing command for both backend and frontend
 */
async function testCommand(options) {
  console.log(chalk.cyan('\n🧪 Enterprise Testing Suite\n'));

  try {
    const config = await detectProjectStructure();

    // Determine what to test
    const testBackend = options.backend || (!options.frontend && config.hasBackend);
    const testFrontend = options.frontend || (!options.backend && config.hasFrontend);

    const results = {
      backend: null,
      frontend: null,
      overall: true
    };

    if (testBackend && config.hasBackend) {
      results.backend = await runBackendTests(config, options);
      results.overall = results.overall && results.backend.success;
    }

    if (testFrontend && config.hasFrontend) {
      results.frontend = await runFrontendTests(config, options);
      results.overall = results.overall && results.frontend.success;
    }

    // Display summary
    displayTestSummary(results, options);

    if (!results.overall) {
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Testing failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Detect project structure for testing
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
 * Run comprehensive backend tests
 */
async function runBackendTests(config, options) {
  console.log(chalk.blue('🎯 Running Backend Tests\n'));

  const results = {
    success: true,
    unit: { success: false, duration: 0, tests: 0 },
    integration: { success: false, duration: 0, tests: 0 },
    architecture: { success: false, duration: 0, tests: 0 },
    coverage: null
  };

  const backendDir = config.backendPath;

  try {
    // Unit tests
    if (options.unit || (!options.integration && !options.e2e)) {
      results.unit = await runBackendUnitTests(backendDir, options);
      if (!results.unit.success) results.success = false;
    }

    // Integration tests
    if (options.integration || (!options.unit && !options.e2e)) {
      results.integration = await runBackendIntegrationTests(backendDir, options);
      if (!results.integration.success) results.success = false;
    }

    // Architecture tests (if ArchUnit is configured)
    if (await hasArchUnit(backendDir)) {
      results.architecture = await runArchitectureTests(backendDir, options);
      if (!results.architecture.success) results.success = false;
    }

    // Generate coverage report
    if (options.coverage) {
      results.coverage = await generateBackendCoverage(backendDir);
    }

  } catch (error) {
    console.error(chalk.red('Backend testing failed:'), error.message);
    results.success = false;
  }

  return results;
}

/**
 * Run backend unit tests
 */
async function runBackendUnitTests(backendDir, options) {
  const spinner = ora('Running backend unit tests...').start();

  try {
    const startTime = Date.now();

    const args = ['test'];
    if (options.coverage) {
      args.push('-P', 'coverage');
    }

    const { stdout } = await execa('mvn', args, {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const duration = Date.now() - startTime;

    // Parse test results from Maven output
    const testResults = parseBackendTestOutput(stdout);

    spinner.succeed(`Backend unit tests completed (${testResults.tests} tests, ${duration}ms)`);

    return {
      success: testResults.failures === 0,
      duration,
      tests: testResults.tests,
      failures: testResults.failures,
      errors: testResults.errors
    };

  } catch (error) {
    spinner.fail('Backend unit tests failed');
    return {
      success: false,
      duration: 0,
      tests: 0,
      error: error.message
    };
  }
}

/**
 * Run backend integration tests
 */
async function runBackendIntegrationTests(backendDir, options) {
  const spinner = ora('Running backend integration tests...').start();

  try {
    const startTime = Date.now();

    const { stdout } = await execa('mvn', ['test', '-P', 'integration'], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const duration = Date.now() - startTime;

    const testResults = parseBackendTestOutput(stdout);

    spinner.succeed(`Backend integration tests completed (${testResults.tests} tests, ${duration}ms)`);

    return {
      success: testResults.failures === 0,
      duration,
      tests: testResults.tests,
      failures: testResults.failures,
      errors: testResults.errors
    };

  } catch (error) {
    spinner.fail('Backend integration tests failed');
    return {
      success: false,
      duration: 0,
      tests: 0,
      error: error.message
    };
  }
}

/**
 * Run architecture tests with ArchUnit
 */
async function runArchitectureTests(backendDir, options) {
  const spinner = ora('Running architecture tests...').start();

  try {
    const startTime = Date.now();

    const { stdout } = await execa('mvn', ['test', '-Dtest=*ArchitectureTest'], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const duration = Date.now() - startTime;

    const testResults = parseBackendTestOutput(stdout);

    spinner.succeed(`Architecture tests completed (${testResults.tests} tests, ${duration}ms)`);

    return {
      success: testResults.failures === 0,
      duration,
      tests: testResults.tests,
      failures: testResults.failures,
      errors: testResults.errors
    };

  } catch (error) {
    spinner.fail('Architecture tests failed');
    return {
      success: false,
      duration: 0,
      tests: 0,
      error: error.message
    };
  }
}

/**
 * Generate backend coverage report
 */
async function generateBackendCoverage(backendDir) {
  const spinner = ora('Generating backend coverage report...').start();

  try {
    await execa('mvn', ['jacoco:report'], {
      cwd: backendDir,
      stdio: 'ignore'
    });

    const coverageFile = path.join(backendDir, 'target/site/jacoco/index.html');
    if (await fs.pathExists(coverageFile)) {
      spinner.succeed('Backend coverage report generated');
      return {
        file: coverageFile,
        url: `file://${path.resolve(coverageFile)}`
      };
    } else {
      spinner.warn('Coverage report not found');
      return null;
    }

  } catch (error) {
    spinner.fail('Failed to generate coverage report');
    return null;
  }
}

/**
 * Run comprehensive frontend tests
 */
async function runFrontendTests(config, options) {
  console.log(chalk.green('⚛️  Running Frontend Tests\n'));

  const results = {
    success: true,
    unit: { success: false, duration: 0, tests: 0 },
    e2e: { success: false, duration: 0, tests: 0 },
    coverage: null
  };

  const frontendDir = config.frontendPath;

  try {
    // Unit tests
    if (options.unit || (!options.integration && !options.e2e)) {
      results.unit = await runFrontendUnitTests(frontendDir, options);
      if (!results.unit.success) results.success = false;
    }

    // E2E tests
    if (options.e2e) {
      results.e2e = await runFrontendE2ETests(frontendDir, options);
      if (!results.e2e.success) results.success = false;
    }

    // Generate coverage report
    if (options.coverage) {
      results.coverage = await generateFrontendCoverage(frontendDir);
    }

  } catch (error) {
    console.error(chalk.red('Frontend testing failed:'), error.message);
    results.success = false;
  }

  return results;
}

/**
 * Run frontend unit tests
 */
async function runFrontendUnitTests(frontendDir, options) {
  const spinner = ora('Running frontend unit tests...').start();

  try {
    const startTime = Date.now();

    const packageJson = await fs.readJson(path.join(frontendDir, 'package.json'));

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

    let testCommand = ['run', 'test', '--', ...args];
    if (packageJson.scripts && packageJson.scripts['test:unit']) {
      testCommand = ['run', 'test:unit'];
    }

    const { stdout } = await execa('npm', testCommand, {
      cwd: frontendDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const duration = Date.now() - startTime;

    // Parse Jest output
    const testResults = parseFrontendTestOutput(stdout);

    spinner.succeed(`Frontend unit tests completed (${testResults.tests} tests, ${duration}ms)`);

    return {
      success: testResults.failures === 0,
      duration,
      tests: testResults.tests,
      failures: testResults.failures
    };

  } catch (error) {
    spinner.fail('Frontend unit tests failed');
    return {
      success: false,
      duration: 0,
      tests: 0,
      error: error.message
    };
  }
}

/**
 * Run frontend E2E tests with Cypress
 */
async function runFrontendE2ETests(frontendDir, options) {
  const spinner = ora('Running frontend E2E tests...').start();

  try {
    // Check if Cypress is configured
    if (!await fs.pathExists(path.join(frontendDir, 'cypress.config.js')) &&
        !await fs.pathExists(path.join(frontendDir, 'cypress'))) {
      spinner.warn('Cypress not configured. Skipping E2E tests.');
      return { success: true, duration: 0, tests: 0 };
    }

    const startTime = Date.now();

    await execa('npx', ['cypress', 'run'], {
      cwd: frontendDir,
      stdio: 'inherit'
    });

    const duration = Date.now() - startTime;

    spinner.succeed(`Frontend E2E tests completed (${duration}ms)`);

    return {
      success: true,
      duration,
      tests: 'N/A' // Cypress doesn't provide test count in CI mode easily
    };

  } catch (error) {
    spinner.fail('Frontend E2E tests failed');
    return {
      success: false,
      duration: 0,
      tests: 0,
      error: error.message
    };
  }
}

/**
 * Generate frontend coverage report
 */
async function generateFrontendCoverage(frontendDir) {
  const coverageDir = path.join(frontendDir, 'coverage');
  const coverageFile = path.join(coverageDir, 'lcov-report/index.html');

  if (await fs.pathExists(coverageFile)) {
    return {
      file: coverageFile,
      url: `file://${path.resolve(coverageFile)}`
    };
  }

  return null;
}

/**
 * Check if ArchUnit is configured
 */
async function hasArchUnit(backendDir) {
  try {
    const pomPath = path.join(backendDir, 'pom.xml');
    if (await fs.pathExists(pomPath)) {
      const pom = await fs.readFile(pomPath, 'utf8');
      return pom.includes('archunit');
    }
  } catch {
    // Ignore errors
  }
  return false;
}

/**
 * Parse backend test output from Maven
 */
function parseBackendTestOutput(output) {
  const results = {
    tests: 0,
    failures: 0,
    errors: 0,
    skipped: 0
  };

  // Parse Maven Surefire output
  const testPattern = /Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)/g;
  let match;

  while ((match = testPattern.exec(output)) !== null) {
    results.tests += parseInt(match[1]);
    results.failures += parseInt(match[2]);
    results.errors += parseInt(match[3]);
    results.skipped += parseInt(match[4]);
  }

  return results;
}

/**
 * Parse frontend test output from Jest
 */
function parseFrontendTestOutput(output) {
  const results = {
    tests: 0,
    failures: 0,
    passed: 0
  };

  // Parse Jest output
  const testPattern = /Test Suites: .* Tests: (\d+) passed.*?(\d+) total/;
  const match = output.match(testPattern);

  if (match) {
    results.passed = parseInt(match[1]);
    results.tests = parseInt(match[2]);
    results.failures = results.tests - results.passed;
  }

  return results;
}

/**
 * Display comprehensive test summary
 */
function displayTestSummary(results, options) {
  console.log(chalk.cyan('\n📊 Test Summary\n'));

  // Backend results
  if (results.backend) {
    console.log(chalk.blue('🎯 Backend Tests:'));

    if (results.backend.unit.tests > 0) {
      const status = results.backend.unit.success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} Unit Tests: ${results.backend.unit.tests} tests (${results.backend.unit.duration}ms)`);
      if (results.backend.unit.failures > 0) {
        console.log(chalk.red(`    Failures: ${results.backend.unit.failures}`));
      }
    }

    if (results.backend.integration.tests > 0) {
      const status = results.backend.integration.success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} Integration Tests: ${results.backend.integration.tests} tests (${results.backend.integration.duration}ms)`);
      if (results.backend.integration.failures > 0) {
        console.log(chalk.red(`    Failures: ${results.backend.integration.failures}`));
      }
    }

    if (results.backend.architecture.tests > 0) {
      const status = results.backend.architecture.success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} Architecture Tests: ${results.backend.architecture.tests} tests (${results.backend.architecture.duration}ms)`);
      if (results.backend.architecture.failures > 0) {
        console.log(chalk.red(`    Failures: ${results.backend.architecture.failures}`));
      }
    }

    if (results.backend.coverage) {
      console.log(chalk.gray(`  📄 Coverage Report: ${results.backend.coverage.file}`));
    }

    console.log();
  }

  // Frontend results
  if (results.frontend) {
    console.log(chalk.green('⚛️  Frontend Tests:'));

    if (results.frontend.unit.tests > 0) {
      const status = results.frontend.unit.success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} Unit Tests: ${results.frontend.unit.tests} tests (${results.frontend.unit.duration}ms)`);
      if (results.frontend.unit.failures > 0) {
        console.log(chalk.red(`    Failures: ${results.frontend.unit.failures}`));
      }
    }

    if (results.frontend.e2e.tests !== undefined) {
      const status = results.frontend.e2e.success ? chalk.green('✅') : chalk.red('❌');
      console.log(`  ${status} E2E Tests: completed (${results.frontend.e2e.duration}ms)`);
    }

    if (results.frontend.coverage) {
      console.log(chalk.gray(`  📄 Coverage Report: ${results.frontend.coverage.file}`));
    }

    console.log();
  }

  // Overall result
  const overallStatus = results.overall ? chalk.green('✅ PASSED') : chalk.red('❌ FAILED');
  console.log(`${chalk.bold('Overall Result:')} ${overallStatus}\n`);

  if (options.coverage && (results.backend?.coverage || results.frontend?.coverage)) {
    console.log(chalk.gray('💡 Tip: Open coverage reports in your browser to view detailed coverage information'));
  }
}

module.exports = testCommand;