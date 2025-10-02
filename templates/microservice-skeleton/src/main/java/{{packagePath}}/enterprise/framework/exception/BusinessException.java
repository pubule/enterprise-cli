/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.exception;

import {{packageName}}.enterprise.framework.constants.FrameworkConstants;

import java.util.HashMap;
import java.util.Map;

/**
 * Base exception for business logic errors.
 * All custom business exceptions should extend this class.
 * Provides error code and additional details map for rich error information.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String errorCode;
    private final Map<String, Object> details;

    public BusinessException(String message) {
        super(message);
        this.errorCode = FrameworkConstants.ErrorCodes.BUSINESS_ERROR;
        this.details = new HashMap<>();
    }

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = FrameworkConstants.ErrorCodes.BUSINESS_ERROR;
        this.details = new HashMap<>();
    }

    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }

    /**
     * Adds a detail to the exception (fluent API).
     *
     * @param key the detail key
     * @param value the detail value
     * @return this exception
     */
    public BusinessException withDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }

    /**
     * Adds multiple details to the exception.
     *
     * @param details the details map
     * @return this exception
     */
    public BusinessException withDetails(Map<String, Object> details) {
        this.details.putAll(details);
        return this;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
