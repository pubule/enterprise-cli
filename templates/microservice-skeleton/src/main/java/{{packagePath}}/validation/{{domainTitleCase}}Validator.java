/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.validation;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.repository.{{domainTitleCase}}Repository;
import {{packageName}}.enterprise.framework.validation.BusinessValidator;
import {{packageName}}.enterprise.framework.validation.ValidationContext;
import {{packageName}}.enterprise.framework.validation.ValidationResult;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * {{domainTitleCase}} Validator
 *
 * <p>Implements BusinessValidator for custom business validation rules.
 * Called automatically by framework before create/update operations.
 *
 * <p><strong>Validation Types:</strong>
 * <ul>
 *   <li><strong>Errors</strong> - Block the operation (must be fixed)</li>
 *   <li><strong>Warnings</strong> - Allow operation but notify user</li>
 * </ul>
 *
 * <p><strong>Error Format:</strong>
 * <pre>
 * result.addError("fieldName", "Error message", "ERROR_CODE");
 * </pre>
 *
 * <p><strong>Warning Format:</strong>
 * <pre>
 * result.addWarning("fieldName", "Warning message");
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@Component
public class {{domainTitleCase}}Validator implements BusinessValidator<{{domainTitleCase}}> {

    private static final List<String> VALID_STATUSES = Arrays.asList("ACTIVE", "INACTIVE", "PENDING");

    private final {{domainTitleCase}}Repository {{domain}}Repository;

    public {{domainTitleCase}}Validator({{domainTitleCase}}Repository {{domain}}Repository) {
        this.{{domain}}Repository = {{domain}}Repository;
    }

    /**
     * Validates the {{domain}} entity.
     * Called automatically by framework before create/update operations.
     *
     * @param entity  the entity to validate
     * @param context validation context (operation type, existing entity, etc.)
     * @return validation result with errors and warnings
     */
    @Override
    public ValidationResult validate({{domainTitleCase}} entity, ValidationContext context) {
        ValidationResult result = new ValidationResult();

        // ═══════════════════════════════════════════════════════
        // BASIC FIELD VALIDATION
        // ═══════════════════════════════════════════════════════

        validateName(entity, context, result);
        validateDescription(entity, context, result);
        validateStatus(entity, context, result);

        // ═══════════════════════════════════════════════════════
        // BUSINESS RULES VALIDATION
        // ═══════════════════════════════════════════════════════

        validateUniqueness(entity, context, result);

        // ═══════════════════════════════════════════════════════
        // OPERATION-SPECIFIC VALIDATION
        // ═══════════════════════════════════════════════════════

        if (context.getOperationType() == ValidationContext.OperationType.CREATE) {
            validateForCreate(entity, result);
        } else if (context.getOperationType() == ValidationContext.OperationType.UPDATE) {
            validateForUpdate(entity, context, result);
        }

        return result;
    }

    /**
     * Validates the name field.
     */
    private void validateName({{domainTitleCase}} entity, ValidationContext context, ValidationResult result) {
        String name = entity.getName();

        if (name == null || name.trim().isEmpty()) {
            result.addError("name", "Name is required", "{{domain.toUpperCase()}}_NAME_REQUIRED");
            return;
        }

        if (name.length() < 3) {
            result.addError("name", "Name must be at least 3 characters long", "{{domain.toUpperCase()}}_NAME_TOO_SHORT");
        }

        if (name.length() > 100) {
            result.addError("name", "Name must not exceed 100 characters", "{{domain.toUpperCase()}}_NAME_TOO_LONG");
        }

        // Example: Forbidden words check
        if (name.toLowerCase().contains("test") || name.toLowerCase().contains("tmp")) {
            result.addWarning("name", "Name contains test/temporary keywords");
        }
    }

    /**
     * Validates the description field.
     */
    private void validateDescription({{domainTitleCase}} entity, ValidationContext context, ValidationResult result) {
        String description = entity.getDescription();

        if (description != null && description.length() > 500) {
            result.addError("description", "Description must not exceed 500 characters", "{{domain.toUpperCase()}}_DESCRIPTION_TOO_LONG");
        }

        // Warning if description is missing
        if (description == null || description.trim().isEmpty()) {
            result.addWarning("description", "Description is recommended for better documentation");
        }
    }

    /**
     * Validates the status field.
     */
    private void validateStatus({{domainTitleCase}} entity, ValidationContext context, ValidationResult result) {
        String status = entity.getStatus();

        if (status == null || status.trim().isEmpty()) {
            result.addError("status", "Status is required", "{{domain.toUpperCase()}}_STATUS_REQUIRED");
            return;
        }

        if (!VALID_STATUSES.contains(status.toUpperCase())) {
            result.addError(
                    "status",
                    "Status must be one of: " + String.join(", ", VALID_STATUSES),
                    "{{domain.toUpperCase()}}_STATUS_INVALID"
            );
        }
    }

    /**
     * Validates uniqueness constraints.
     */
    private void validateUniqueness({{domainTitleCase}} entity, ValidationContext context, ValidationResult result) {
        String name = entity.getName();

        if (name == null) {
            return; // Already handled by name validation
        }

        // Check name uniqueness
        if (context.getOperationType() == ValidationContext.OperationType.CREATE) {
            // For CREATE: check if name exists
            if ({{domain}}Repository.existsByName(name)) {
                result.addError(
                        "name",
                        "{{domainTitleCase}} with this name already exists",
                        "{{domain.toUpperCase()}}_NAME_DUPLICATE"
                );
            }
        } else if (context.getOperationType() == ValidationContext.OperationType.UPDATE) {
            // For UPDATE: check if name exists (excluding current entity)
            Long currentId = entity.getId();
            if (currentId != null && {{domain}}Repository.existsByNameAndIdNot(name, currentId)) {
                result.addError(
                        "name",
                        "Another {{domain}} with this name already exists",
                        "{{domain.toUpperCase()}}_NAME_DUPLICATE"
                );
            }
        }
    }

    /**
     * Validation specific to CREATE operations.
     */
    private void validateForCreate({{domainTitleCase}} entity, ValidationResult result) {
        // Example: New entities should start with PENDING status
        if (!"PENDING".equals(entity.getStatus())) {
            result.addWarning("status", "New {{domain}}s typically start with PENDING status");
        }
    }

    /**
     * Validation specific to UPDATE operations.
     */
    private void validateForUpdate({{domainTitleCase}} entity, ValidationContext context, ValidationResult result) {
        // Get existing entity from context
        Object existingObj = context.getExistingEntity();
        if (!(existingObj instanceof {{domainTitleCase}})) {
            return;
        }

        {{domainTitleCase}} existing = ({{domainTitleCase}}) existingObj;

        // Example: Cannot change status from INACTIVE to ACTIVE directly
        if ("INACTIVE".equals(existing.getStatus()) && "ACTIVE".equals(entity.getStatus())) {
            result.addError(
                    "status",
                    "Cannot activate an inactive {{domain}}. Use the activate endpoint instead.",
                    "{{domain.toUpperCase()}}_INVALID_STATUS_TRANSITION"
            );
        }
    }
}
