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
     * Business operation messages (templates for domain-specific messages).
     */
    public static final class Business {
        // Status change messages
        public static final String ALREADY_ACTIVE = "%s is already active";
        public static final String ALREADY_INACTIVE = "%s is already inactive";
        public static final String ACTIVATED_SUCCESSFULLY = "%s activated successfully: %s";
        public static final String DEACTIVATED_SUCCESSFULLY = "%s deactivated successfully: %s";
        public static final String CANNOT_ACTIVATE = "Cannot activate an inactive %s. Use the activate endpoint instead.";
        public static final String INVALID_STATUS_TRANSITION = "Cannot transition from %s to %s. %s";

        // Duplicate/existence messages
        public static final String DUPLICATE_NAME = "%s with this name already exists";
        public static final String ANOTHER_EXISTS = "Another %s with this name already exists";

        // Quality warnings
        public static final String NAME_CONTAINS_KEYWORDS = "Name contains test/temporary keywords";
        public static final String DESCRIPTION_RECOMMENDED = "Description is recommended for better documentation";
        public static final String SHORT_DESCRIPTION = "Description is very short. Consider providing more details.";
        public static final String NEW_ENTITY_STATUS = "New %ss typically start with %s status";
        public static final String PENDING_DELETE_WARNING = "Deleting a %s with %s status. Consider completing or canceling it first.";

        // Constraint messages
        public static final String MAX_ENTITIES_REACHED = "Maximum number of active %ss (%d) reached. Please deactivate some before creating new ones.";
        public static final String APPROACHING_MAX = "Approaching maximum number of active %ss. Currently at %d out of %d.";
        public static final String STATUS_REQUIRED = "Status cannot be null";
        public static final String STATUS_INVALID = "Status must be one of: %s";

        private Business() {
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

    /**
     * Log messages for debug and info logging.
     */
    public static final class Log {
        // REST/Controller logging
        public static final String REST_REQUEST = "REST request to %s %s: %s";
        public static final String REST_ACTIVATE = "REST request to activate %s: %s";
        public static final String REST_DEACTIVATE = "REST request to deactivate %s: %s";
        public static final String REST_FIND_BY_STATUS = "REST request to find %ss by status: %s";
        public static final String REST_SEARCH = "REST request to search %ss by name pattern: %s";
        public static final String REST_COUNT = "REST request to count %ss by status: %s";

        // Service logging
        public static final String EXECUTING_RULES = "Executing business rules for %s: %s";
        public static final String RULE_FAILED = "Business rule failed: %s - %s";
        public static final String RULE_WARNING = "Business rule warning: %s";
        public static final String ACTIVATING = "Activating %s with id: %s";
        public static final String DEACTIVATING = "Deactivating %s with id: %s";
        public static final String FINDING_BY_NAME = "Finding %s by name: %s";
        public static final String FINDING_BY_STATUS = "Finding all %ss with status: %s";
        public static final String SEARCHING_BY_PATTERN = "Searching %ss with name pattern: %s";
        public static final String COUNTING_BY_STATUS = "Counting %ss with status: %s";

        private Log() {
        }
    }
}
