/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.exception;

import {{packageName}}.enterprise.framework.constants.FrameworkConstants;
import {{packageName}}.enterprise.framework.constants.MessageConstants;
import {{packageName}}.enterprise.framework.dto.ApiResponse;
import {{packageName}}.enterprise.framework.dto.ErrorDetails;
import {{packageName}}.enterprise.framework.validation.ValidationResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for REST controllers.
 * Converts exceptions to standardized API responses with error details.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles ResourceNotFoundException (HTTP 404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());

        // Add details if present
        if (!ex.getDetails().isEmpty()) {
            response.withMetadata(ex.getDetails());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles ValidationException (HTTP 400) with field-level errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            ValidationException ex, WebRequest request) {
        log.warn("Validation error: {}", ex.getMessage());

        ErrorDetails errorDetails = new ErrorDetails(ex.getErrorCode(), ex.getMessage());

        // Add field-level errors
        for (ValidationResult.ValidationError error : ex.getValidationErrors()) {
            errorDetails.addFieldError(error.getField(), error.getMessage(), error.getCode());
        }

        ApiResponse<Void> response = ApiResponse.error(errorDetails);

        // Add business details if present
        if (!ex.getDetails().isEmpty()) {
            response.withMetadata(ex.getDetails());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles Spring's MethodArgumentNotValidException (HTTP 400).
     * Thrown when @Valid annotation validation fails.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        log.warn("Method argument validation failed: {}", ex.getMessage());

        ErrorDetails errorDetails = new ErrorDetails(
                FrameworkConstants.ErrorCodes.VALIDATION_ERROR,
                MessageConstants.Error.VALIDATION_FAILED);

        // Add all field errors
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errorDetails.addFieldError(error.getField(), error.getDefaultMessage())
        );

        // Add global errors if any
        ex.getBindingResult().getGlobalErrors().forEach(error ->
            errorDetails.addFieldError(error.getObjectName(), error.getDefaultMessage())
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorDetails));
    }

    /**
     * Handles general BusinessException (HTTP 422).
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, WebRequest request) {
        log.warn("Business error: {} - {}", ex.getErrorCode(), ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());

        // Add details as metadata
        if (!ex.getDetails().isEmpty()) {
            response.withMetadata(ex.getDetails());
        }

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }

    /**
     * Handles IllegalArgumentException (HTTP 400).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), FrameworkConstants.ErrorCodes.INVALID_ARGUMENT));
    }

    /**
     * Handles all other uncaught exceptions (HTTP 500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(
            Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);

        ApiResponse<Void> response = ApiResponse.error(
            MessageConstants.Error.UNEXPECTED_ERROR,
            FrameworkConstants.ErrorCodes.INTERNAL_ERROR
        );

        // In development, include exception class name
        response.withMetadata("exceptionType", ex.getClass().getSimpleName());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
