/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for Enterprise Framework.
 * Allows customization of framework behavior via application.yml.
 *
 * <p>Example configuration:
 * <pre>
 * enterprise:
 *   framework:
 *     enabled: true
 *     jpa:
 *       auditing-enabled: true
 *     events:
 *       async-enabled: true
 *     pagination:
 *       default-page-size: 20
 *       max-page-size: 100
 *     entity:
 *       soft-delete-enabled: true
 *     validation:
 *       enabled: true
 *       fail-fast: false
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
@ConfigurationProperties(prefix = "enterprise.framework")
public class FrameworkProperties {

    /**
     * Whether the framework is enabled.
     * Default is true.
     */
    private boolean enabled = true;

    /**
     * JPA-related properties.
     */
    private JpaProperties jpa = new JpaProperties();

    /**
     * Event-related properties.
     */
    private EventProperties events = new EventProperties();

    /**
     * Pagination-related properties.
     */
    private PaginationProperties pagination = new PaginationProperties();

    /**
     * Entity-related properties.
     */
    private EntityProperties entity = new EntityProperties();

    /**
     * Validation-related properties.
     */
    private ValidationProperties validation = new ValidationProperties();

    // Getters and Setters

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public JpaProperties getJpa() {
        return jpa;
    }

    public void setJpa(JpaProperties jpa) {
        this.jpa = jpa;
    }

    public EventProperties getEvents() {
        return events;
    }

    public void setEvents(EventProperties events) {
        this.events = events;
    }

    public PaginationProperties getPagination() {
        return pagination;
    }

    public void setPagination(PaginationProperties pagination) {
        this.pagination = pagination;
    }

    public EntityProperties getEntity() {
        return entity;
    }

    public void setEntity(EntityProperties entity) {
        this.entity = entity;
    }

    public ValidationProperties getValidation() {
        return validation;
    }

    public void setValidation(ValidationProperties validation) {
        this.validation = validation;
    }

    /**
     * JPA configuration properties.
     */
    public static class JpaProperties {
        /**
         * Whether JPA auditing is enabled.
         * Default is true.
         */
        private boolean auditingEnabled = true;

        public boolean isAuditingEnabled() {
            return auditingEnabled;
        }

        public void setAuditingEnabled(boolean auditingEnabled) {
            this.auditingEnabled = auditingEnabled;
        }
    }

    /**
     * Event configuration properties.
     */
    public static class EventProperties {
        /**
         * Whether async event publishing is enabled.
         * Default is true.
         */
        private boolean asyncEnabled = true;

        public boolean isAsyncEnabled() {
            return asyncEnabled;
        }

        public void setAsyncEnabled(boolean asyncEnabled) {
            this.asyncEnabled = asyncEnabled;
        }
    }

    /**
     * Pagination configuration properties.
     */
    public static class PaginationProperties {
        /**
         * Default page size for paginated requests.
         * Default is 20.
         */
        private int defaultPageSize = 20;

        /**
         * Maximum allowed page size.
         * Default is 100.
         */
        private int maxPageSize = 100;

        public int getDefaultPageSize() {
            return defaultPageSize;
        }

        public void setDefaultPageSize(int defaultPageSize) {
            this.defaultPageSize = defaultPageSize;
        }

        public int getMaxPageSize() {
            return maxPageSize;
        }

        public void setMaxPageSize(int maxPageSize) {
            this.maxPageSize = maxPageSize;
        }
    }

    /**
     * Entity configuration properties.
     */
    public static class EntityProperties {
        /**
         * Whether soft delete is enabled by default.
         * Default is true.
         */
        private boolean softDeleteEnabled = true;

        public boolean isSoftDeleteEnabled() {
            return softDeleteEnabled;
        }

        public void setSoftDeleteEnabled(boolean softDeleteEnabled) {
            this.softDeleteEnabled = softDeleteEnabled;
        }
    }

    /**
     * Validation configuration properties.
     */
    public static class ValidationProperties {
        /**
         * Whether validation is enabled.
         * Default is true.
         */
        private boolean enabled = true;

        /**
         * Whether to fail fast on first validation error.
         * If true, validation stops at first error.
         * If false, all validations are executed.
         * Default is false.
         */
        private boolean failFast = false;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public boolean isFailFast() {
            return failFast;
        }

        public void setFailFast(boolean failFast) {
            this.failFast = failFast;
        }
    }
}
