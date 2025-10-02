/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Structured error details for API responses.
 * Contains error code, message, and field-level validation errors.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class ErrorDetails {

    private String code;
    private String message;
    private List<FieldError> fieldErrors;

    public ErrorDetails() {
        this.fieldErrors = new ArrayList<>();
    }

    public ErrorDetails(String code, String message) {
        this.code = code;
        this.message = message;
        this.fieldErrors = new ArrayList<>();
    }

    /**
     * Adds a field-level validation error.
     *
     * @param field the field name
     * @param message the error message
     */
    public void addFieldError(String field, String message) {
        this.fieldErrors.add(new FieldError(field, message));
    }

    /**
     * Adds a field-level validation error with error code.
     *
     * @param field the field name
     * @param message the error message
     * @param code the error code
     */
    public void addFieldError(String field, String message, String code) {
        this.fieldErrors.add(new FieldError(field, message, code));
    }

    // Getters and Setters

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(List<FieldError> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    /**
     * Field-level validation error.
     */
    public static class FieldError {
        private String field;
        private String message;
        private String code;

        public FieldError() {
        }

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public FieldError(String field, String message, String code) {
            this.field = field;
            this.message = message;
            this.code = code;
        }

        // Getters and Setters

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }
}
