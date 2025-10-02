/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

import java.util.HashMap;
import java.util.Map;

/**
 * Context for validation operations.
 * Provides operation type, existing entity (for updates), and additional context.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationContext {

    /**
     * Type of operation being validated.
     */
    public enum OperationType {
        CREATE, UPDATE, DELETE
    }

    private final OperationType operationType;
    private final Object existingEntity;
    private final Map<String, Object> additionalContext;

    private ValidationContext(OperationType operationType) {
        this.operationType = operationType;
        this.existingEntity = null;
        this.additionalContext = new HashMap<>();
    }

    private ValidationContext(OperationType operationType, Object existingEntity) {
        this.operationType = operationType;
        this.existingEntity = existingEntity;
        this.additionalContext = new HashMap<>();
    }

    /**
     * Creates a context for create operation.
     *
     * @return validation context
     */
    public static ValidationContext forCreate() {
        return new ValidationContext(OperationType.CREATE);
    }

    /**
     * Creates a context for update operation.
     *
     * @param existingEntity the existing entity being updated
     * @return validation context
     */
    public static ValidationContext forUpdate(Object existingEntity) {
        return new ValidationContext(OperationType.UPDATE, existingEntity);
    }

    /**
     * Creates a context for delete operation.
     *
     * @return validation context
     */
    public static ValidationContext forDelete() {
        return new ValidationContext(OperationType.DELETE);
    }

    /**
     * Adds additional context data (fluent API).
     *
     * @param key the context key
     * @param value the context value
     * @return this context
     */
    public ValidationContext with(String key, Object value) {
        this.additionalContext.put(key, value);
        return this;
    }

    /**
     * Gets a value from additional context.
     *
     * @param key the context key
     * @return the context value, or null if not present
     */
    public Object get(String key) {
        return additionalContext.get(key);
    }

    /**
     * Gets a typed value from additional context.
     *
     * @param key the context key
     * @param type the expected type
     * @param <T> the type parameter
     * @return the context value, or null if not present
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> type) {
        return (T) additionalContext.get(key);
    }

    // Getters

    public OperationType getOperationType() {
        return operationType;
    }

    public Object getExistingEntity() {
        return existingEntity;
    }

    public Map<String, Object> getAdditionalContext() {
        return additionalContext;
    }

    // Convenience methods

    public boolean isCreate() {
        return operationType == OperationType.CREATE;
    }

    public boolean isUpdate() {
        return operationType == OperationType.UPDATE;
    }

    public boolean isDelete() {
        return operationType == OperationType.DELETE;
    }
}
