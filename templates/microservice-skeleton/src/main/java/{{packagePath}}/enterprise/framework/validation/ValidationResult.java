/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of validation operations.
 * Contains validation errors and warnings.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationResult {

    private final List<ValidationError> errors;
    private final List<ValidationWarning> warnings;

    public ValidationResult() {
        this.errors = new ArrayList<>();
        this.warnings = new ArrayList<>();
    }

    /**
     * Adds a validation error.
     *
     * @param field the field name
     * @param message the error message
     * @param code the error code
     */
    public void addError(String field, String message, String code) {
        errors.add(new ValidationError(field, message, code));
    }

    /**
     * Adds a validation error without code.
     *
     * @param field the field name
     * @param message the error message
     */
    public void addError(String field, String message) {
        errors.add(new ValidationError(field, message, null));
    }

    /**
     * Adds a validation warning.
     *
     * @param field the field name
     * @param message the warning message
     */
    public void addWarning(String field, String message) {
        warnings.add(new ValidationWarning(field, message));
    }

    /**
     * Checks if validation passed (no errors).
     *
     * @return true if valid (no errors)
     */
    public boolean isValid() {
        return errors.isEmpty();
    }

    /**
     * Checks if there are warnings.
     *
     * @return true if warnings exist
     */
    public boolean hasWarnings() {
        return !warnings.isEmpty();
    }

    /**
     * Gets all errors as formatted strings.
     *
     * @return list of error messages
     */
    public List<String> getErrorMessages() {
        List<String> messages = new ArrayList<>();
        for (ValidationError error : errors) {
            messages.add(error.getField() + ": " + error.getMessage());
        }
        return messages;
    }

    // Getters

    public List<ValidationError> getErrors() {
        return errors;
    }

    public List<ValidationWarning> getWarnings() {
        return warnings;
    }

    /**
     * Validation error with field, message, and optional code.
     */
    public static class ValidationError {
        private final String field;
        private final String message;
        private final String code;

        public ValidationError(String field, String message, String code) {
            this.field = field;
            this.message = message;
            this.code = code;
        }

        public String getField() {
            return field;
        }

        public String getMessage() {
            return message;
        }

        public String getCode() {
            return code;
        }
    }

    /**
     * Validation warning with field and message.
     */
    public static class ValidationWarning {
        private final String field;
        private final String message;

        public ValidationWarning(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public String getMessage() {
            return message;
        }
    }
}
