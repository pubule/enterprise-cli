/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.exception;

/**
 * Exception thrown when a requested resource is not found.
 * Maps to HTTP 404 status code.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ResourceNotFoundException extends BusinessException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }

    public ResourceNotFoundException(String resourceType, Object id) {
        super("RESOURCE_NOT_FOUND", String.format("%s not found with id: %s", resourceType, id));
    }
}
