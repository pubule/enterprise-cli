/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Default validator that performs no validation.
 * Used when no specific validator is provided.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class DefaultValidator<T> implements BusinessValidator<T> {

    @Override
    public ValidationResult validate(T entity, ValidationContext context) {
        return ValidationResult.success();
    }
}
