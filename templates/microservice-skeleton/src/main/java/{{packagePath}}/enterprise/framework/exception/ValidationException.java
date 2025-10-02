/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.exception;

import {{packageName}}.enterprise.framework.validation.ValidationResult;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Exception thrown when validation fails.
 * Maps to HTTP 400 status code.
 * Contains structured validation errors with field-level details.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationException extends BusinessException {

    private static final long serialVersionUID = 1L;

    private final List<ValidationResult.ValidationError> validationErrors;

    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.validationErrors = Collections.singletonList(
            new ValidationResult.ValidationError("general", message, "VALIDATION_ERROR")
        );
    }

    public ValidationException(List<ValidationResult.ValidationError> errors) {
        super("VALIDATION_ERROR", formatErrorMessage(errors));
        this.validationErrors = new ArrayList<>(errors);
    }

    /**
     * Creates ValidationException from ValidationResult.
     *
     * @param result the validation result
     */
    public static ValidationException fromValidationResult(ValidationResult result) {
        return new ValidationException(result.getErrors());
    }

    /**
     * Gets the list of validation errors.
     *
     * @return unmodifiable list of validation errors
     */
    public List<ValidationResult.ValidationError> getValidationErrors() {
        return Collections.unmodifiableList(validationErrors);
    }

    /**
     * Gets validation errors as simple string messages (for backwards compatibility).
     *
     * @return list of error messages
     */
    public List<String> getErrors() {
        return validationErrors.stream()
            .map(error -> error.getField() + ": " + error.getMessage())
            .collect(Collectors.toList());
    }

    private static String formatErrorMessage(List<ValidationResult.ValidationError> errors) {
        if (errors.isEmpty()) {
            return "Validation failed";
        }
        return errors.stream()
            .map(error -> error.getField() + ": " + error.getMessage())
            .collect(Collectors.joining(", "));
    }
}
