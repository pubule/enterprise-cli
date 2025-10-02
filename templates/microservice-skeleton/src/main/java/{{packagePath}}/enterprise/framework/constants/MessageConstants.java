/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.constants;

/**
 * Centralized message constants for the framework.
 * Contains success messages, error messages, validation messages, and info messages.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public final class MessageConstants {

    private MessageConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Success messages for completed operations.
     */
    public static final class Success {
        public static final String ENTITY_CREATED = "Entity created successfully";
        public static final String ENTITY_UPDATED = "Entity updated successfully";
        public static final String ENTITY_DELETED = "Entity deleted successfully";
        public static final String OPERATION_COMPLETED = "Operation completed successfully";
        public static final String DATA_SAVED = "Data saved successfully";
        public static final String DATA_DELETED = "Data deleted successfully";

        private Success() {
        }
    }

    /**
     * Error messages for failed operations.
     */
    public static final class Error {
        public static final String VALIDATION_FAILED = "Validation failed";
        public static final String UNEXPECTED_ERROR = "An unexpected error occurred. Please contact support if the problem persists.";
        public static final String RESOURCE_NOT_FOUND_TEMPLATE = "%s not found with id: %s";
        public static final String DUPLICATE_RESOURCE = "Resource already exists";
        public static final String INVALID_INPUT = "Invalid input provided";
        public static final String OPERATION_FAILED = "Operation failed";
        public static final String UNAUTHORIZED_ACCESS = "Unauthorized access";
        public static final String FORBIDDEN_ACTION = "You are not allowed to perform this action";
        public static final String BUSINESS_RULE_FAILED = "Business rule validation failed";

        private Error() {
        }
    }

    /**
     * Validation messages for field-level validation.
     */
    public static final class Validation {
        public static final String REQUIRED_FIELD = "%s is required";
        public static final String INVALID_FORMAT = "%s has invalid format";
        public static final String MIN_LENGTH = "%s must be at least %d characters";
        public static final String MAX_LENGTH = "%s must not exceed %d characters";
        public static final String MIN_VALUE = "%s must be at least %d";
        public static final String MAX_VALUE = "%s must not exceed %d";
        public static final String INVALID_EMAIL = "Invalid email address";
        public static final String INVALID_PHONE = "Invalid phone number";
        public static final String INVALID_DATE = "Invalid date format";
        public static final String FUTURE_DATE_REQUIRED = "%s must be a future date";
        public static final String PAST_DATE_REQUIRED = "%s must be a past date";
        public static final String INVALID_RANGE = "%s must be between %d and %d";

        private Validation() {
        }
    }

    /**
     * Informational messages.
     */
    public static final class Info {
        public static final String PROCESSING = "Processing...";
        public static final String SEARCHING = "Searching...";
        public static final String LOADING = "Loading data...";
        public static final String NO_DATA_FOUND = "No data found";
        public static final String EMPTY_RESULT = "No results match your criteria";

        private Info() {
        }
    }

    /**
     * Warning messages.
     */
    public static final class Warning {
        public static final String DEPRECATED_FEATURE = "This feature is deprecated and will be removed in future versions";
        public static final String DATA_WILL_BE_LOST = "This action will result in data loss. Please confirm.";
        public static final String IRREVERSIBLE_ACTION = "This action cannot be undone";
        public static final String PERFORMANCE_WARNING = "This operation may take longer than usual";

        private Warning() {
        }
    }

    /**
     * Business rule messages.
     */
    public static final class BusinessRule {
        public static final String RULE_FAILED = "Business rule '%s' failed: %s";
        public static final String CRITICAL_RULE_VIOLATION = "Critical business rule violation: %s";
        public static final String RULE_EVALUATION_ERROR = "Error evaluating business rule: %s";

        private BusinessRule() {
        }
    }

    /**
     * Audit and logging messages.
     */
    public static final class Audit {
        public static final String ENTITY_CREATED_LOG = "Entity %s created with id: %s by user: %s";
        public static final String ENTITY_UPDATED_LOG = "Entity %s with id: %s updated by user: %s";
        public static final String ENTITY_DELETED_LOG = "Entity %s with id: %s deleted by user: %s";
        public static final String ENTITY_SOFT_DELETED_LOG = "Entity %s with id: %s soft deleted by user: %s";
        public static final String ACCESS_DENIED_LOG = "Access denied for user: %s to resource: %s";

        private Audit() {
        }
    }
}
