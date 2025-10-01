/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result of a validation operation.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationResult {

    private final List<String> errors;

    private ValidationResult(List<String> errors) {
        this.errors = new ArrayList<>(errors);
    }

    public static ValidationResult success() {
        return new ValidationResult(Collections.emptyList());
    }

    public static ValidationResult failure(String error) {
        return new ValidationResult(Collections.singletonList(error));
    }

    public static ValidationResult failure(List<String> errors) {
        return new ValidationResult(errors);
    }

    public boolean isValid() {
        return errors.isEmpty();
    }

    public List<String> getErrors() {
        return Collections.unmodifiableList(errors);
    }

    public void addError(String error) {
        errors.add(error);
    }

    public void addErrors(List<String> newErrors) {
        errors.addAll(newErrors);
    }
}
