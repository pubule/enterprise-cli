const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');
const globby = require('globby');

/**
 * File generation utilities using Mustache templates
 */

/**
 * Generate files from a template directory
 * @param {string} templateName - Name of the template directory
 * @param {string} outputPath - Path where files should be generated
 * @param {object} variables - Variables to pass to the template engine
 */
async function generateFromTemplate(templateName, outputPath, variables) {
  const templatePath = getTemplatePath(templateName);

  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  await processTemplateDirectory(templatePath, outputPath, variables);
}

/**
 * Generate a single file from a template
 * @param {string} templateFile - Path to template file
 * @param {string} outputFile - Path where file should be generated
 * @param {object} variables - Variables to pass to the template engine
 */
async function generateFile(templateFile, outputFile, variables) {
  const templatePath = getTemplatePath(templateFile);

  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template file not found: ${templateFile}`);
  }

  const content = await fs.readFile(templatePath, 'utf8');
  const rendered = mustache.render(content, variables);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputFile));

  // Write the rendered content
  await fs.writeFile(outputFile, rendered, 'utf8');
}

/**
 * Process an entire template directory recursively
 * @param {string} templatePath - Path to template directory
 * @param {string} outputPath - Path where files should be generated
 * @param {object} variables - Variables to pass to the template engine
 */
async function processTemplateDirectory(templatePath, outputPath, variables) {
  // Get all files in the template directory
  const files = await globby(['**/*'], {
    cwd: templatePath,
    dot: true,
    onlyFiles: true
  });

  for (const file of files) {
    const templateFilePath = path.join(templatePath, file);
    let outputFilePath = path.join(outputPath, file);

    // Process filename templates (e.g., {{serviceName}}.java)
    outputFilePath = mustache.render(outputFilePath, variables);

    // Skip binary files or files that shouldn't be templated
    if (shouldSkipFile(file)) {
      await fs.copy(templateFilePath, outputFilePath);
      continue;
    }

    // Read and process template content
    try {
      const content = await fs.readFile(templateFilePath, 'utf8');
      const rendered = mustache.render(content, variables);

      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputFilePath));

      // Write the rendered content
      await fs.writeFile(outputFilePath, rendered, 'utf8');
    } catch (error) {
      // If file can't be read as text, copy it as binary
      await fs.copy(templateFilePath, outputFilePath);
    }
  }
}

/**
 * Get the full path to a template
 * @param {string} templateName - Name of the template
 * @returns {string} Full path to the template
 */
function getTemplatePath(templateName) {
  // First check in src/templates directory
  const srcTemplatePath = path.join(__dirname, '..', 'templates', templateName);
  if (fs.existsSync(srcTemplatePath)) {
    return srcTemplatePath;
  }

  // Then check in root templates directory
  const rootTemplatePath = path.join(__dirname, '..', '..', 'templates', templateName);
  if (fs.existsSync(rootTemplatePath)) {
    return rootTemplatePath;
  }

  // If not found, return the first path for error handling
  return srcTemplatePath;
}

/**
 * Check if a file should be skipped from templating
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file should be skipped
 */
function shouldSkipFile(filename) {
  const binaryExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico',
    '.pdf', '.zip', '.tar', '.gz', '.7z',
    '.jar', '.war', '.ear',
    '.exe', '.dll', '.so',
    '.class'
  ];

  const ext = path.extname(filename).toLowerCase();
  return binaryExtensions.includes(ext);
}

/**
 * Generate files from multiple templates
 * @param {Array} templates - Array of template configurations
 * @param {string} baseOutputPath - Base path where files should be generated
 * @param {object} variables - Variables to pass to the template engine
 */
async function generateFromMultipleTemplates(templates, baseOutputPath, variables) {
  for (const template of templates) {
    const outputPath = template.outputPath ?
      path.join(baseOutputPath, template.outputPath) :
      baseOutputPath;

    if (template.templateFile) {
      // Single file template
      await generateFile(template.templateFile, path.join(outputPath, template.outputFile), variables);
    } else if (template.templateDirectory) {
      // Directory template
      await generateFromTemplate(template.templateDirectory, outputPath, variables);
    }
  }
}

/**
 * Create a template structure for a specific technology stack
 * @param {string} stackType - Type of stack (spring-boot, react, etc.)
 * @param {string} outputPath - Path where files should be generated
 * @param {object} config - Configuration for the stack
 */
async function generateTechStack(stackType, outputPath, config) {
  const stackTemplates = getStackTemplates(stackType);

  for (const template of stackTemplates) {
    // Merge stack-specific variables with user variables
    const templateVariables = {
      ...config,
      ...template.variables
    };

    if (template.condition && !evaluateCondition(template.condition, config)) {
      continue; // Skip this template if condition is not met
    }

    await generateFromTemplate(template.name, outputPath, templateVariables);
  }
}

/**
 * Get template configurations for a specific technology stack
 * @param {string} stackType - Type of stack
 * @returns {Array} Array of template configurations
 */
function getStackTemplates(stackType) {
  const stackConfigs = {
    'spring-boot': [
      {
        name: 'spring-boot/basic',
        variables: { framework: 'spring-boot' }
      },
      {
        name: 'spring-boot/security',
        condition: 'hasAuth',
        variables: { security: true }
      },
      {
        name: 'spring-boot/camel',
        condition: 'hasCamel',
        variables: { integration: true }
      },
      {
        name: 'docker/spring-boot',
        condition: 'hasDocker',
        variables: { containerized: true }
      }
    ],
    'react': [
      {
        name: 'react/basic',
        variables: { framework: 'react' }
      },
      {
        name: 'react/redux',
        condition: 'hasRedux',
        variables: { stateManagement: 'redux' }
      },
      {
        name: 'react/router',
        condition: 'hasRouter',
        variables: { routing: true }
      },
      {
        name: 'react/testing',
        condition: 'hasTesting',
        variables: { testing: true }
      }
    ]
  };

  return stackConfigs[stackType] || [];
}

/**
 * Evaluate a condition against configuration
 * @param {string} condition - Condition to evaluate
 * @param {object} config - Configuration object
 * @returns {boolean} Result of condition evaluation
 */
function evaluateCondition(condition, config) {
  // Simple condition evaluation
  // In a more complex system, this could use a proper expression parser
  return Boolean(config[condition]);
}

/**
 * List available templates
 * @param {string} category - Optional category filter
 * @returns {Array} Array of available templates
 */
async function listAvailableTemplates(category = null) {
  const templatePaths = [
    path.join(__dirname, '..', 'templates'),
    path.join(__dirname, '..', '..', 'templates')
  ];

  const templates = [];

  for (const templatePath of templatePaths) {
    if (await fs.pathExists(templatePath)) {
      const items = await fs.readdir(templatePath);

      for (const item of items) {
        const itemPath = path.join(templatePath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          if (!category || item.startsWith(category)) {
            templates.push({
              name: item,
              path: itemPath,
              category: item.split('/')[0]
            });
          }
        }
      }
    }
  }

  return templates;
}

/**
 * Validate template variables
 * @param {object} variables - Variables to validate
 * @param {object} schema - Validation schema
 * @returns {object} Validation result
 */
function validateTemplateVariables(variables, schema) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!variables[field]) {
        errors.push(`Required field missing: ${field}`);
      }
    }
  }

  // Type validation
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (variables[field] && typeof variables[field] !== expectedType) {
        errors.push(`Field ${field} should be of type ${expectedType}`);
      }
    }
  }

  // Pattern validation
  if (schema.patterns) {
    for (const [field, pattern] of Object.entries(schema.patterns)) {
      if (variables[field] && !pattern.test(variables[field])) {
        errors.push(`Field ${field} does not match required pattern`);
      }
    }
  }

  // Custom validators
  if (schema.validators) {
    for (const [field, validator] of Object.entries(schema.validators)) {
      if (variables[field]) {
        const result = validator(variables[field]);
        if (result !== true) {
          errors.push(`Field ${field}: ${result}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create a custom template from existing files
 * @param {string} sourcePath - Path to source files
 * @param {string} templateName - Name for the new template
 * @param {object} options - Template creation options
 */
async function createTemplateFromSource(sourcePath, templateName, options = {}) {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);

  // Ensure source exists
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Source path does not exist: ${sourcePath}`);
  }

  // Copy source to template directory
  await fs.copy(sourcePath, templatePath);

  // Convert specific values to template variables if specified
  if (options.variableReplacements) {
    await convertToTemplate(templatePath, options.variableReplacements);
  }

  // Create template metadata
  const metadata = {
    name: templateName,
    description: options.description || 'Custom template',
    variables: options.variables || {},
    created: new Date().toISOString(),
    version: '1.0.0'
  };

  await fs.writeJson(path.join(templatePath, 'template.json'), metadata, { spaces: 2 });
}

/**
 * Convert existing files to templates by replacing values with variables
 * @param {string} templatePath - Path to template directory
 * @param {object} replacements - Map of values to replace with variables
 */
async function convertToTemplate(templatePath, replacements) {
  const files = await globby(['**/*'], {
    cwd: templatePath,
    dot: true,
    onlyFiles: true
  });

  for (const file of files) {
    const filePath = path.join(templatePath, file);

    if (shouldSkipFile(file)) {
      continue;
    }

    try {
      let content = await fs.readFile(filePath, 'utf8');

      // Replace values with mustache variables
      for (const [value, variable] of Object.entries(replacements)) {
        const regex = new RegExp(escapeRegExp(value), 'g');
        content = content.replace(regex, `{{${variable}}}`);
      }

      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      // Skip files that can't be read as text
      continue;
    }
  }
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  generateFromTemplate,
  generateFile,
  generateFromMultipleTemplates,
  generateTechStack,
  listAvailableTemplates,
  validateTemplateVariables,
  createTemplateFromSource,
  processTemplateDirectory
};