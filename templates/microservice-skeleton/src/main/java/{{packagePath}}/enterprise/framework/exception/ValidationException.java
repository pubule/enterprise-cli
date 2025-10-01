/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.exception;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Exception thrown when validation fails.
 * Maps to HTTP 400 status code.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ValidationException extends BusinessException {

    private static final long serialVersionUID = 1L;

    private final List<String> errors;

    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.errors = Collections.singletonList(message);
    }

    public ValidationException(List<String> errors) {
        super("VALIDATION_ERROR", String.join(", ", errors));
        this.errors = new ArrayList<>(errors);
    }

    public List<String> getErrors() {
        return Collections.unmodifiableList(errors);
    }
}
