/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard API response wrapper.
 * Supports both success and error responses with optional metadata.
 *
 * @param <T> the response data type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ErrorDetails error;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;

    private ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Creates a successful response with data.
     *
     * @param data the response data
     * @param <T> the data type
     * @return the API response
     */
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    /**
     * Creates a successful response with data and message.
     *
     * @param data the response data
     * @param message the success message
     * @param <T> the data type
     * @return the API response
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        response.withMetadata("message", message);
        return response;
    }

    /**
     * Creates an error response with message.
     *
     * @param message the error message
     * @param <T> the data type
     * @return the API response
     */
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(new ErrorDetails("ERROR", message));
        return response;
    }

    /**
     * Creates an error response with code and message.
     *
     * @param message the error message
     * @param code the error code
     * @param <T> the data type
     * @return the API response
     */
    public static <T> ApiResponse<T> error(String message, String code) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(new ErrorDetails(code, message));
        return response;
    }

    /**
     * Creates an error response with ErrorDetails.
     *
     * @param errorDetails the error details
     * @param <T> the data type
     * @return the API response
     */
    public static <T> ApiResponse<T> error(ErrorDetails errorDetails) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(errorDetails);
        return response;
    }

    /**
     * Adds metadata to the response (fluent API).
     *
     * @param key the metadata key
     * @param value the metadata value
     * @return this response
     */
    public ApiResponse<T> withMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(key, value);
        return this;
    }

    /**
     * Adds multiple metadata entries.
     *
     * @param metadata the metadata map
     * @return this response
     */
    public ApiResponse<T> withMetadata(Map<String, Object> metadata) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.putAll(metadata);
        return this;
    }

    // Getters and Setters

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public ErrorDetails getError() {
        return error;
    }

    public void setError(ErrorDetails error) {
        this.error = error;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
