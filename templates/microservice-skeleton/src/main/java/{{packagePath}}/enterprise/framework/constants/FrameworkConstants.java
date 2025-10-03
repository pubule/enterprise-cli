/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.constants;

/**
 * Framework-wide constants.
 * Provides centralized constants for pagination, field names, error codes, and configuration.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public final class FrameworkConstants {

    private FrameworkConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * HTTP Status codes used in the framework.
     */
    public static final class HttpStatus {
        public static final int OK = 200;
        public static final int CREATED = 201;
        public static final int NO_CONTENT = 204;
        public static final int BAD_REQUEST = 400;
        public static final int UNAUTHORIZED = 401;
        public static final int FORBIDDEN = 403;
        public static final int NOT_FOUND = 404;
        public static final int CONFLICT = 409;
        public static final int UNPROCESSABLE_ENTITY = 422;
        public static final int INTERNAL_SERVER_ERROR = 500;

        private HttpStatus() {
        }
    }

    /**
     * Pagination default values and limits.
     */
    public static final class Pagination {
        public static final int DEFAULT_PAGE = 0;
        public static final int DEFAULT_SIZE = 20;
        public static final int MAX_SIZE = 100;
        public static final String DEFAULT_SORT_BY = "id";
        public static final String SORT_ASC = "asc";
        public static final String SORT_DESC = "desc";

        private Pagination() {
        }
    }

    /**
     * String length limits for validation.
     */
    public static final class StringLimits {
        public static final int SHORT = 50;
        public static final int MEDIUM = 100;
        public static final int LONG = 255;
        public static final int VERY_LONG = 500;
        public static final int TEXT = 1000;
        public static final int LARGE_TEXT = 5000;

        private StringLimits() {
        }
    }

    /**
     * Common validation limits for entity fields.
     */
    public static final class ValidationLimits {
        public static final int NAME_MIN_LENGTH = 1;
        public static final int NAME_MAX_LENGTH = 100;
        public static final int NAME_MIN_LENGTH_STRICT = 3;
        public static final int DESCRIPTION_MAX_LENGTH = 500;
        public static final int STATUS_MAX_LENGTH = 20;
        public static final int USERNAME_MAX_LENGTH = 100;
        public static final int EMAIL_MAX_LENGTH = 255;

        private ValidationLimits() {
        }
    }

    /**
     * Standard field names used across entities.
     */
    public static final class FieldNames {
        // System fields
        public static final String ID = "id";
        public static final String CREATED_AT = "createdAt";
        public static final String CREATED_BY = "createdBy";
        public static final String UPDATED_AT = "updatedAt";
        public static final String UPDATED_BY = "updatedBy";
        public static final String DELETED = "deleted";
        public static final String DELETED_AT = "deletedAt";
        public static final String DELETED_BY = "deletedBy";
        public static final String TENANT_ID = "tenantId";
        public static final String VERSION = "version";

        // Common business fields
        public static final String NAME = "name";
        public static final String DESCRIPTION = "description";
        public static final String STATUS = "status";
        public static final String TYPE = "type";
        public static final String CODE = "code";
        public static final String ACTIVE = "active";

        private FieldNames() {
        }
    }

    /**
     * Common query parameter names for search and filtering.
     */
    public static final class QueryParams {
        public static final String NAME = "name";
        public static final String DESCRIPTION = "description";
        public static final String STATUS = "status";
        public static final String TYPE = "type";
        public static final String ACTIVE = "active";
        public static final String CREATED_AFTER = "createdAfter";
        public static final String CREATED_BEFORE = "createdBefore";
        public static final String NAME_PATTERN = "namePattern";
        public static final String SEARCH = "search";

        private QueryParams() {
        }
    }

    /**
     * Keys for exception detail maps (used in .withDetail()).
     */
    public static final class DetailKeys {
        public static final String ID = "id";
        public static final String FIELD_NAME = "fieldName";
        public static final String FIELD_VALUE = "fieldValue";
        public static final String RULE_NAME = "ruleName";
        public static final String SEVERITY = "severity";
        public static final String CURRENT_STATUS = "currentStatus";
        public static final String NEW_STATUS = "newStatus";
        public static final String ENTITY_NAME = "entityName";
        public static final String ERROR_CODE = "errorCode";
        public static final String CONSTRAINT_NAME = "constraintName";

        private DetailKeys() {
        }
    }

    /**
     * Standard error codes used throughout the framework.
     */
    public static final class ErrorCodes {
        public static final String BUSINESS_ERROR = "BUSINESS_ERROR";
        public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
        public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
        public static final String INVALID_ARGUMENT = "INVALID_ARGUMENT";
        public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
        public static final String BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION";
        public static final String DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE";
        public static final String UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS";
        public static final String FORBIDDEN_ACTION = "FORBIDDEN_ACTION";
        public static final String OPTIMISTIC_LOCK_FAILURE = "OPTIMISTIC_LOCK_FAILURE";

        private ErrorCodes() {
        }
    }

    /**
     * Standard entity status values.
     */
    public static final class EntityStatus {
        public static final String ACTIVE = "ACTIVE";
        public static final String INACTIVE = "INACTIVE";
        public static final String PENDING = "PENDING";
        public static final String ARCHIVED = "ARCHIVED";
        public static final String DELETED = "DELETED";

        private EntityStatus() {
        }
    }

    /**
     * API endpoint patterns and prefixes.
     */
    public static final class Endpoints {
        public static final String API_V1 = "/api/v1";
        public static final String API_V2 = "/api/v2";
        public static final String ACTUATOR = "/actuator";
        public static final String HEALTH = "/health";
        public static final String METRICS = "/metrics";
        public static final String SEARCH = "/search";
        public static final String COUNT = "/count";
        public static final String EXISTS = "/exists";

        private Endpoints() {
        }
    }

    /**
     * Content types and media types.
     */
    public static final class ContentTypes {
        public static final String APPLICATION_JSON = "application/json";
        public static final String APPLICATION_XML = "application/xml";
        public static final String TEXT_PLAIN = "text/plain";
        public static final String APPLICATION_PDF = "application/pdf";

        private ContentTypes() {
        }
    }

    /**
     * Business rule priority levels.
     */
    public static final class RulePriority {
        public static final int HIGHEST = 1;
        public static final int HIGH = 10;
        public static final int NORMAL = 100;
        public static final int LOW = 1000;
        public static final int LOWEST = 10000;

        private RulePriority() {
        }
    }

    /**
     * Default entity-related constants.
     */
    public static final class EntityDefaults {
        public static final String ENTITY_NAME = "Entity";
        public static final String DEFAULT_SCHEMA = "public";
        public static final int DEFAULT_BATCH_SIZE = 50;

        private EntityDefaults() {
        }
    }

    /**
     * Cache-related constants.
     */
    public static final class Cache {
        public static final String DEFAULT_CACHE_NAME = "enterpriseCache";
        public static final long DEFAULT_TTL_SECONDS = 3600; // 1 hour
        public static final int DEFAULT_MAX_ENTRIES = 1000;

        private Cache() {
        }
    }

    /**
     * Date and time format patterns.
     */
    public static final class DateTimeFormats {
        public static final String ISO_DATETIME = "yyyy-MM-dd'T'HH:mm:ss";
        public static final String ISO_DATE = "yyyy-MM-dd";
        public static final String ISO_TIME = "HH:mm:ss";
        public static final String DISPLAY_DATETIME = "dd/MM/yyyy HH:mm:ss";
        public static final String DISPLAY_DATE = "dd/MM/yyyy";

        private DateTimeFormats() {
        }
    }
}
