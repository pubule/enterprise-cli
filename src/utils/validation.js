/**
 * Validation and Transformation Utilities
 * Provides validation and string transformation functions for enterprise code generation
 */

// Java reserved keywords for validation
const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
]);

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validates service name (kebab-case, 2-50 characters)
 * @param {string} name - The service name to validate
 * @returns {boolean} - True if valid
 */
function isValidServiceName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Check length
  if (name.length < 2 || name.length > 50) {
    return false;
  }

  // Check kebab-case format: lowercase letters, numbers, hyphens
  // Must start and end with alphanumeric, no consecutive hyphens
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(name);
}

/**
 * Validates application name (same rules as service name)
 * @param {string} name - The application name to validate
 * @returns {boolean} - True if valid
 */
function isValidAppName(name) {
  return isValidServiceName(name);
}

/**
 * Validates Java package name (e.g., com.company.domain)
 * @param {string} pkg - The package name to validate
 * @returns {boolean} - True if valid
 */
function isValidJavaPackage(pkg) {
  if (!pkg || typeof pkg !== 'string') {
    return false;
  }

  // Split by dots
  const parts = pkg.split('.');

  // Must have at least 2 parts (e.g., com.company)
  if (parts.length < 2) {
    return false;
  }

  // Each part must be a valid Java identifier (lowercase preferred)
  for (const part of parts) {
    if (!part || part.length === 0) {
      return false;
    }

    // Check if it's a valid Java identifier (lowercase convention)
    if (!/^[a-z_][a-z0-9_]*$/i.test(part)) {
      return false;
    }

    // Check if it's a reserved keyword
    if (JAVA_KEYWORDS.has(part.toLowerCase())) {
      return false;
    }
  }

  return true;
}

/**
 * Validates Java identifier (variable/method name)
 * @param {string} id - The identifier to validate
 * @returns {boolean} - True if valid
 */
function isValidJavaIdentifier(id) {
  if (!id || typeof id !== 'string' || id.length === 0) {
    return false;
  }

  // Must start with letter or underscore
  if (!/^[a-zA-Z_]/.test(id)) {
    return false;
  }

  // Rest must be alphanumeric or underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
    return false;
  }

  // Cannot be a Java keyword
  if (JAVA_KEYWORDS.has(id.toLowerCase())) {
    return false;
  }

  return true;
}

/**
 * Validates Java class name (PascalCase)
 * @param {string} name - The class name to validate
 * @returns {boolean} - True if valid
 */
function isValidJavaClassName(name) {
  if (!name || typeof name !== 'string' || name.length === 0) {
    return false;
  }

  // Must start with uppercase letter
  if (!/^[A-Z]/.test(name)) {
    return false;
  }

  // Must be alphanumeric only (no underscores for class names)
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return false;
  }

  // Cannot be a Java keyword
  if (JAVA_KEYWORDS.has(name.toLowerCase())) {
    return false;
  }

  return true;
}

// ========================================
// TRANSFORMATION FUNCTIONS
// ========================================

/**
 * Converts string to PascalCase (e.g., "user-service" → "UserService")
 * @param {string} str - The string to convert
 * @returns {string} - PascalCase string
 */
function toPascalCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    // Split by common delimiters: space, hyphen, underscore, dot
    .split(/[\s\-_\.]+/)
    // Capitalize first letter of each word
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Converts string to camelCase (e.g., "user-service" → "userService")
 * @param {string} str - The string to convert
 * @returns {string} - camelCase string
 */
function toCamelCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const pascal = toPascalCase(str);
  if (!pascal) return '';

  // Lowercase the first character
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts string to kebab-case (e.g., "UserService" → "user-service")
 * @param {string} str - The string to convert
 * @returns {string} - kebab-case string
 */
function toKebabCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    // Insert hyphen before uppercase letters (for PascalCase/camelCase)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Replace spaces, underscores, dots with hyphens
    .replace(/[\s_\.]+/g, '-')
    // Convert to lowercase
    .toLowerCase()
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-');
}

/**
 * Converts string to snake_case (e.g., "UserService" → "user_service")
 * @param {string} str - The string to convert
 * @returns {string} - snake_case string
 */
function toSnakeCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    // Insert underscore before uppercase letters
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    // Replace spaces, hyphens, dots with underscores
    .replace(/[\s\-\.]+/g, '_')
    // Convert to lowercase
    .toLowerCase()
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Replace multiple consecutive underscores with single underscore
    .replace(/_+/g, '_');
}

/**
 * Capitalizes first letter (e.g., "user" → "User")
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirst(str) {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to CONSTANT_CASE (e.g., "userService" → "USER_SERVICE")
 * @param {string} str - The string to convert
 * @returns {string} - CONSTANT_CASE string
 */
function toConstantCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // First convert to snake_case, then uppercase
  return toSnakeCase(str).toUpperCase();
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Validation functions
  isValidServiceName,
  isValidAppName,
  isValidJavaPackage,
  isValidJavaIdentifier,
  isValidJavaClassName,

  // Transformation functions
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  capitalizeFirst,
  toConstantCase
};
