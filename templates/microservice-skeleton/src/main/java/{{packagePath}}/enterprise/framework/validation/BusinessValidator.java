/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Interface for business validation logic.
 *
 * @param <T> the entity type to validate
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface BusinessValidator<T> {

    /**
     * Validates an entity within a given context.
     *
     * @param entity the entity to validate
     * @param context the validation context
     * @return validation result with any errors
     */
    ValidationResult validate(T entity, ValidationContext context);
}
