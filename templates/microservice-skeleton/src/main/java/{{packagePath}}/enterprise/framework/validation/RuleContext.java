/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

import java.util.HashMap;
import java.util.Map;

/**
 * Context for business rule execution.
 * Provides operation type, existing entity, and additional context data.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class RuleContext {

    private final ValidationContext.OperationType operationType;
    private final Object existingEntity;
    private final Map<String, Object> context;

    private RuleContext(ValidationContext.OperationType operationType) {
        this.operationType = operationType;
        this.existingEntity = null;
        this.context = new HashMap<>();
    }

    private RuleContext(ValidationContext.OperationType operationType, Object existingEntity) {
        this.operationType = operationType;
        this.existingEntity = existingEntity;
        this.context = new HashMap<>();
    }

    /**
     * Creates a context for create operation.
     *
     * @return rule context
     */
    public static RuleContext forCreate() {
        return new RuleContext(ValidationContext.OperationType.CREATE);
    }

    /**
     * Creates a context for update operation.
     *
     * @param existingEntity the existing entity being updated
     * @return rule context
     */
    public static RuleContext forUpdate(Object existingEntity) {
        return new RuleContext(ValidationContext.OperationType.UPDATE, existingEntity);
    }

    /**
     * Creates a context for delete operation.
     *
     * @param existingEntity the entity being deleted
     * @return rule context
     */
    public static RuleContext forDelete(Object existingEntity) {
        return new RuleContext(ValidationContext.OperationType.DELETE, existingEntity);
    }

    /**
     * Adds context data (fluent API).
     *
     * @param key the context key
     * @param value the context value
     * @return this context
     */
    public RuleContext with(String key, Object value) {
        this.context.put(key, value);
        return this;
    }

    /**
     * Gets a value from context.
     *
     * @param key the context key
     * @return the context value, or null if not present
     */
    public Object get(String key) {
        return context.get(key);
    }

    /**
     * Gets a typed value from context.
     *
     * @param key the context key
     * @param type the expected type
     * @param <T> the type parameter
     * @return the context value, or null if not present
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> type) {
        return (T) context.get(key);
    }

    // Getters

    public ValidationContext.OperationType getOperationType() {
        return operationType;
    }

    public Object getExistingEntity() {
        return existingEntity;
    }

    public Map<String, Object> getContext() {
        return context;
    }

    // Convenience methods

    public boolean isCreate() {
        return operationType == ValidationContext.OperationType.CREATE;
    }

    public boolean isUpdate() {
        return operationType == ValidationContext.OperationType.UPDATE;
    }

    public boolean isDelete() {
        return operationType == ValidationContext.OperationType.DELETE;
    }
}
