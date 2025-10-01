/**
 * File Generator Utilities
 * Handles template processing and file generation for enterprise applications
 */

const fs = require('fs-extra');
const path = require('path');
const mustache = require('mustache');
const globby = require('globby');

/**
 * Processes a path/filename by replacing mustache variables
 * @param {string} pathStr - Path or filename with {{variables}}
 * @param {object} variables - Variables to replace
 * @returns {string} - Processed path/filename
 */
function processPath(pathStr, variables) {
  if (!pathStr || typeof pathStr !== 'string') {
    return pathStr;
  }

  try {
    // Replace {{variable}} patterns in the path/filename
    return mustache.render(pathStr, variables);
  } catch (error) {
    console.error(`Error processing path "${pathStr}":`, error.message);
    return pathStr;
  }
}

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure
 * @returns {Promise<void>}
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to create directory "${dirPath}": ${error.message}`);
  }
}

/**
 * Checks if a template exists
 * @param {string} templateName - Name of the template
 * @param {string} templatesDir - Base templates directory
 * @returns {Promise<boolean>}
 */
async function templateExists(templateName, templatesDir) {
  const templatePath = path.join(templatesDir, templateName);
  try {
    const stats = await fs.stat(templatePath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Processes a single template file
 * @param {string} sourceFile - Source template file path
 * @param {string} templateDir - Template base directory
 * @param {string} outputPath - Output base path
 * @param {object} variables - Variables for mustache rendering
 * @returns {Promise<string>} - Path of generated file
 */
async function processTemplateFile(sourceFile, templateDir, outputPath, variables) {
  try {
    // Read template file content
    const content = await fs.readFile(sourceFile, 'utf-8');

    // Get relative path from template directory
    const relativePath = path.relative(templateDir, sourceFile);

    // Process the relative path to replace variables in directory/file names
    const processedRelativePath = processPath(relativePath, variables);

    // Calculate output file path
    const outputFilePath = path.join(outputPath, processedRelativePath);

    // Ensure output directory exists
    const outputDir = path.dirname(outputFilePath);
    await ensureDirectory(outputDir);

    // Process content with mustache
    const processedContent = mustache.render(content, variables);

    // Write processed file
    await fs.writeFile(outputFilePath, processedContent, 'utf-8');

    return outputFilePath;
  } catch (error) {
    throw new Error(`Failed to process template file "${sourceFile}": ${error.message}`);
  }
}

/**
 * Generates files from a template directory
 * @param {string} templateName - Name of the template (subdirectory in templates/)
 * @param {string} outputPath - Destination path for generated files
 * @param {object} variables - Variables for mustache template rendering
 * @param {object} options - Additional options
 * @param {string} options.templatesDir - Custom templates directory (default: templates/)
 * @returns {Promise<object>} - Result object with generated files and stats
 */
async function generateFromTemplate(templateName, outputPath, variables = {}, options = {}) {
  // Determine templates directory (default to templates/ in project root)
  const templatesDir = options.templatesDir || path.join(process.cwd(), 'templates');
  const templateDir = path.join(templatesDir, templateName);

  // Validate template exists
  const exists = await templateExists(templateName, templatesDir);
  if (!exists) {
    throw new Error(
      `Template "${templateName}" not found in "${templatesDir}". ` +
      `Expected path: "${templateDir}"`
    );
  }

  // Validate output path
  if (!outputPath || typeof outputPath !== 'string') {
    throw new Error('Output path must be a valid string');
  }

  // Ensure output directory exists
  await ensureDirectory(outputPath);

  try {
    // Find all files in template directory (including hidden files, excluding .git)
    const templateFiles = await globby(['**/*'], {
      cwd: templateDir,
      dot: true,
      onlyFiles: true,
      gitignore: false,
      ignore: [
        '**/.git/**',
        '**/.DS_Store',
        '**/Thumbs.db'
      ]
    });

    if (templateFiles.length === 0) {
      console.warn(`Warning: Template "${templateName}" contains no files`);
      return {
        success: true,
        filesGenerated: 0,
        files: [],
        templateDir,
        outputPath
      };
    }

    // Process all template files
    const generatedFiles = [];
    const errors = [];

    for (const relativeFile of templateFiles) {
      const sourceFile = path.join(templateDir, relativeFile);

      try {
        const outputFile = await processTemplateFile(
          sourceFile,
          templateDir,
          outputPath,
          variables
        );
        generatedFiles.push(outputFile);
      } catch (error) {
        errors.push({
          file: relativeFile,
          error: error.message
        });
      }
    }

    // Report results
    const result = {
      success: errors.length === 0,
      filesGenerated: generatedFiles.length,
      files: generatedFiles,
      errors: errors.length > 0 ? errors : undefined,
      templateDir,
      outputPath
    };

    return result;

  } catch (error) {
    throw new Error(
      `Failed to generate files from template "${templateName}": ${error.message}`
    );
  }
}

/**
 * Generates files from a template with progress callback
 * @param {string} templateName - Name of the template
 * @param {string} outputPath - Destination path
 * @param {object} variables - Template variables
 * @param {function} onProgress - Callback for progress updates (file, index, total)
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Result object
 */
async function generateFromTemplateWithProgress(
  templateName,
  outputPath,
  variables = {},
  onProgress = null,
  options = {}
) {
  const templatesDir = options.templatesDir || path.join(process.cwd(), 'templates');
  const templateDir = path.join(templatesDir, templateName);

  // Validate template exists
  const exists = await templateExists(templateName, templatesDir);
  if (!exists) {
    throw new Error(`Template "${templateName}" not found in "${templatesDir}"`);
  }

  await ensureDirectory(outputPath);

  // Find all template files
  const templateFiles = await globby(['**/*'], {
    cwd: templateDir,
    dot: true,
    onlyFiles: true,
    gitignore: false,
    ignore: ['**/.git/**', '**/.DS_Store', '**/Thumbs.db']
  });

  const generatedFiles = [];
  const errors = [];
  const total = templateFiles.length;

  for (let i = 0; i < templateFiles.length; i++) {
    const relativeFile = templateFiles[i];
    const sourceFile = path.join(templateDir, relativeFile);

    try {
      // Call progress callback if provided
      if (onProgress && typeof onProgress === 'function') {
        onProgress(relativeFile, i + 1, total);
      }

      const outputFile = await processTemplateFile(
        sourceFile,
        templateDir,
        outputPath,
        variables
      );
      generatedFiles.push(outputFile);
    } catch (error) {
      errors.push({
        file: relativeFile,
        error: error.message
      });
    }
  }

  return {
    success: errors.length === 0,
    filesGenerated: generatedFiles.length,
    files: generatedFiles,
    errors: errors.length > 0 ? errors : undefined,
    templateDir,
    outputPath
  };
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  generateFromTemplate,
  generateFromTemplateWithProgress,
  processPath,
  ensureDirectory,
  templateExists
};
