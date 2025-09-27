/**
 * Validation utilities for enterprise CLI
 */

/**
 * Validate service name (kebab-case)
 * @param {string} name - Service name to validate
 * @returns {boolean} True if valid
 */
function isValidServiceName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Must be kebab-case: lowercase letters, numbers, and hyphens only
  // Must start and end with letter or number
  // No consecutive hyphens
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  return kebabCaseRegex.test(name) &&
         name.length >= 2 &&
         name.length <= 50 &&
         !name.startsWith('-') &&
         !name.endsWith('-');
}

/**
 * Validate React application name
 * @param {string} name - App name to validate
 * @returns {boolean} True if valid
 */
function isValidAppName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Similar to service name but can include 'app' suffix
  const appNameRegex = /^[a-z0-9]+(-[a-z0-9]+)*(-app)?$/;

  return appNameRegex.test(name) &&
         name.length >= 2 &&
         name.length <= 50 &&
         !name.startsWith('-') &&
         !name.endsWith('-');
}

/**
 * Validate Java package name
 * @param {string} packageName - Package name to validate
 * @returns {boolean} True if valid
 */
function isValidJavaPackage(packageName) {
  if (!packageName || typeof packageName !== 'string') {
    return false;
  }

  // Java package naming rules:
  // - Lowercase letters, numbers, and dots
  // - Must start with letter
  // - Each segment must be valid Java identifier
  const segments = packageName.split('.');

  if (segments.length < 2) {
    return false; // Must have at least domain.name
  }

  return segments.every(segment => isValidJavaIdentifier(segment));
}

/**
 * Validate Java identifier (class name, method name, etc.)
 * @param {string} identifier - Identifier to validate
 * @returns {boolean} True if valid
 */
function isValidJavaIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    return false;
  }

  // Java identifier rules:
  // - Must start with letter, underscore, or dollar sign
  // - Can contain letters, digits, underscores, dollar signs
  // - Cannot be Java keyword
  const javaIdentifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  if (!javaIdentifierRegex.test(identifier)) {
    return false;
  }

  // Check against Java keywords
  const javaKeywords = [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
    'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
    'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
    'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
  ];

  return !javaKeywords.includes(identifier.toLowerCase());
}

/**
 * Validate Java class name (PascalCase)
 * @param {string} className - Class name to validate
 * @returns {boolean} True if valid
 */
function isValidJavaClassName(className) {
  if (!className || typeof className !== 'string') {
    return false;
  }

  // Must be PascalCase and valid Java identifier
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

  return pascalCaseRegex.test(className) &&
         isValidJavaIdentifier(className) &&
         className.length >= 2 &&
         className.length <= 50;
}

/**
 * Validate database name
 * @param {string} dbName - Database name to validate
 * @returns {boolean} True if valid
 */
function isValidDatabaseName(dbName) {
  if (!dbName || typeof dbName !== 'string') {
    return false;
  }

  // Database names: lowercase letters, numbers, underscores
  // Must start with letter
  const dbNameRegex = /^[a-z][a-z0-9_]*$/;

  return dbNameRegex.test(dbName) &&
         dbName.length >= 2 &&
         dbName.length <= 63; // PostgreSQL limit
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate version string (semantic versioning)
 * @param {string} version - Version to validate
 * @returns {boolean} True if valid
 */
function isValidVersion(version) {
  if (!version || typeof version !== 'string') {
    return false;
  }

  // Semantic versioning: MAJOR.MINOR.PATCH
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  return semverRegex.test(version);
}

/**
 * Validate port number
 * @param {number|string} port - Port number to validate
 * @returns {boolean} True if valid
 */
function isValidPort(port) {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

/**
 * Validate environment name
 * @param {string} env - Environment name to validate
 * @returns {boolean} True if valid
 */
function isValidEnvironment(env) {
  if (!env || typeof env !== 'string') {
    return false;
  }

  const validEnvironments = ['dev', 'development', 'test', 'testing', 'stage', 'staging', 'prod', 'production'];
  return validEnvironments.includes(env.toLowerCase());
}

/**
 * String transformation utilities
 */

/**
 * Convert string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .replace(/\s/g, '');
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
function toCamelCase(str) {
  const pascalCase = toPascalCase(str);
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str
    .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
function toSnakeCase(str) {
  return str
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to CONSTANT_CASE
 * @param {string} str - String to convert
 * @returns {string} CONSTANT_CASE string
 */
function toConstantCase(str) {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Sanitize string for file system use
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeForFilename(str) {
  return str
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Complex validation functions
 */

/**
 * Validate Spring Boot application properties
 * @param {object} props - Properties to validate
 * @returns {object} Validation result
 */
function validateSpringBootProperties(props) {
  const errors = [];
  const warnings = [];

  if (props.serverPort && !isValidPort(props.serverPort)) {
    errors.push('Invalid server port');
  }

  if (props.databaseUrl && !isValidUrl(props.databaseUrl)) {
    errors.push('Invalid database URL');
  }

  if (props.profiles) {
    props.profiles.forEach(profile => {
      if (!isValidEnvironment(profile)) {
        warnings.push(`Unusual profile name: ${profile}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate React application configuration
 * @param {object} config - Configuration to validate
 * @returns {object} Validation result
 */
function validateReactConfiguration(config) {
  const errors = [];
  const warnings = [];

  if (config.apiUrl && !isValidUrl(config.apiUrl)) {
    errors.push('Invalid API URL');
  }

  if (config.buildOutputDir && !/^[a-zA-Z0-9_-]+$/.test(config.buildOutputDir)) {
    errors.push('Invalid build output directory name');
  }

  if (config.publicUrl && !isValidUrl(config.publicUrl)) {
    errors.push('Invalid public URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Docker configuration
 * @param {object} config - Docker configuration to validate
 * @returns {object} Validation result
 */
function validateDockerConfiguration(config) {
  const errors = [];
  const warnings = [];

  if (config.imageName && !/^[a-z0-9]+([._-][a-z0-9]+)*$/.test(config.imageName)) {
    errors.push('Invalid Docker image name');
  }

  if (config.tag && !/^[a-zA-Z0-9._-]+$/.test(config.tag)) {
    errors.push('Invalid Docker tag');
  }

  if (config.ports) {
    config.ports.forEach(port => {
      if (!isValidPort(port)) {
        errors.push(`Invalid port: ${port}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate entity definitions
 * @param {Array} entities - Array of entity definitions
 * @returns {object} Validation result
 */
function validateEntities(entities) {
  const errors = [];
  const warnings = [];
  const entityNames = new Set();

  entities.forEach((entity, index) => {
    // Check for duplicate names
    if (entityNames.has(entity.name)) {
      errors.push(`Duplicate entity name: ${entity.name}`);
    }
    entityNames.add(entity.name);

    // Validate entity name
    if (!isValidJavaClassName(entity.name)) {
      errors.push(`Invalid entity name: ${entity.name}`);
    }

    // Validate fields
    if (entity.fields) {
      const fieldNames = new Set();
      entity.fields.forEach(field => {
        if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name in ${entity.name}: ${field.name}`);
        }
        fieldNames.add(field.name);

        if (!isValidJavaIdentifier(field.name)) {
          errors.push(`Invalid field name in ${entity.name}: ${field.name}`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  // Basic validation
  isValidServiceName,
  isValidAppName,
  isValidJavaPackage,
  isValidJavaIdentifier,
  isValidJavaClassName,
  isValidDatabaseName,
  isValidUrl,
  isValidEmail,
  isValidVersion,
  isValidPort,
  isValidEnvironment,

  // String transformations
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  capitalizeFirst,
  toConstantCase,
  sanitizeForFilename,

  // Complex validation
  validateSpringBootProperties,
  validateReactConfiguration,
  validateDockerConfiguration,
  validateEntities
};