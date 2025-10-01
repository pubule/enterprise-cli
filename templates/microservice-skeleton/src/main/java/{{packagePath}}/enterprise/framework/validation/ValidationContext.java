/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Context for validation operations.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationContext {

    public enum Operation {
        CREATE, UPDATE, DELETE
    }

    private final Operation operation;
    private final Object existingEntity;

    private ValidationContext(Operation operation, Object existingEntity) {
        this.operation = operation;
        this.existingEntity = existingEntity;
    }

    public static ValidationContext forCreate() {
        return new ValidationContext(Operation.CREATE, null);
    }

    public static ValidationContext forUpdate(Object existingEntity) {
        return new ValidationContext(Operation.UPDATE, existingEntity);
    }

    public static ValidationContext forDelete() {
        return new ValidationContext(Operation.DELETE, null);
    }

    public Operation getOperation() {
        return operation;
    }

    public Object getExistingEntity() {
        return existingEntity;
    }

    public boolean isCreate() {
        return operation == Operation.CREATE;
    }

    public boolean isUpdate() {
        return operation == Operation.UPDATE;
    }

    public boolean isDelete() {
        return operation == Operation.DELETE;
    }
}
