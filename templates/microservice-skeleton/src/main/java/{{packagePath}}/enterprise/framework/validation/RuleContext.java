/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Context for business rule execution.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class RuleContext {

    public enum Operation {
        CREATE, UPDATE, DELETE
    }

    private final Operation operation;
    private final Object existingEntity;

    private RuleContext(Operation operation, Object existingEntity) {
        this.operation = operation;
        this.existingEntity = existingEntity;
    }

    public static RuleContext forCreate() {
        return new RuleContext(Operation.CREATE, null);
    }

    public static RuleContext forUpdate(Object existingEntity) {
        return new RuleContext(Operation.UPDATE, existingEntity);
    }

    public static RuleContext forDelete(Object existingEntity) {
        return new RuleContext(Operation.DELETE, existingEntity);
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
