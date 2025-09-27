package {{packageName}}.controller;

import {{packageName}}.dto.{{domainTitleCase}}Request;
import {{packageName}}.dto.{{domainTitleCase}}Response;
import {{packageName}}.service.{{domainTitleCase}}Service;
import {{packageName}}.validation.{{domainTitleCase}}Validator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for {{domainTitleCase}} operations
 *
 * This controller provides RESTful endpoints for {{domainTitleCase}} management.
 * All operations use the service layer for business logic and persistence.
 */
@RestController
@RequestMapping("/{{domain}}s")
@Tag(name = "{{domainTitleCase}}", description = "{{domainTitleCase}} management operations")
public class {{domainTitleCase}}Controller {

    private static final Logger logger = LoggerFactory.getLogger({{domainTitleCase}}Controller.class);

    private final {{domainTitleCase}}Service {{domain}}Service;
    private final {{domainTitleCase}}Validator {{domain}}Validator;

    @Autowired
    public {{domainTitleCase}}Controller({{domainTitleCase}}Service {{domain}}Service,
                                        {{domainTitleCase}}Validator {{domain}}Validator) {
        this.{{domain}}Service = {{domain}}Service;
        this.{{domain}}Validator = {{domain}}Validator;
    }

    /**
     * Hello World endpoint for service verification
     */
    @GetMapping("/hello")
    @Operation(summary = "Service health check", description = "Returns a greeting message to verify the service is running")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello from {{domainTitleCase}} Service! 🚀");
    }

    /**
     * Get all {{domain}}s
     */
    @GetMapping
    @Operation(summary = "Get all {{domain}}s", description = "Retrieve a list of all {{domain}}s")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved {{domain}}s"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<{{domainTitleCase}}Response>> getAll{{domainTitleCase}}s() {
        logger.info("Fetching all {{domain}}s");
        List<{{domainTitleCase}}Response> {{domain}}s = {{domain}}Service.getAll{{domainTitleCase}}s();
        logger.info("Found {} {{domain}}s", {{domain}}s.size());
        return ResponseEntity.ok({{domain}}s);
    }

    /**
     * Get all {{domain}}s with pagination
     */
    @GetMapping("/paged")
    @Operation(summary = "Get all {{domain}}s with pagination", description = "Retrieve a paginated list of {{domain}}s")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved {{domain}}s"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<{{domainTitleCase}}Response>> getAll{{domainTitleCase}}sPaged(Pageable pageable) {
        logger.info("Fetching {{domain}}s with pagination: {}", pageable);
        Page<{{domainTitleCase}}Response> {{domain}}s = {{domain}}Service.getAll{{domainTitleCase}}s(pageable);
        logger.info("Found {} {{domain}}s in page {} of {}", {{domain}}s.getNumberOfElements(), {{domain}}s.getNumber(), {{domain}}s.getTotalPages());
        return ResponseEntity.ok({{domain}}s);
    }

    /**
     * Get {{domain}} by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get {{domain}} by ID", description = "Retrieve a specific {{domain}} by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "{{domainTitleCase}} found"),
            @ApiResponse(responseCode = "404", description = "{{domainTitleCase}} not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<{{domainTitleCase}}Response> get{{domainTitleCase}}ById(
            @Parameter(description = "{{domainTitleCase}} unique identifier")
            @PathVariable String id) {

        logger.info("Fetching {{domain}} with ID: {}", id);
        return {{domain}}Service.get{{domainTitleCase}}ById(id)
                .map({{domain}} -> {
                    logger.info("Found {{domain}} with ID: {}", id);
                    return ResponseEntity.ok({{domain}});
                })
                .orElseGet(() -> {
                    logger.warn("{{domainTitleCase}} not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Create new {{domain}}
     */
    @PostMapping
    @Operation(summary = "Create new {{domain}}", description = "Create a new {{domain}} with the provided information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "{{domainTitleCase}} created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "{{domainTitleCase}} already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<{{domainTitleCase}}Response> create{{domainTitleCase}}(
            @Valid @RequestBody {{domainTitleCase}}Request request) {

        try {
            // Perform custom validation
            {{domainTitleCase}}Validator.ValidationResult validationResult = {{domain}}Validator.validateCreateRequest(request);
            if (!validationResult.isValid()) {
                logger.warn("Validation failed for {{domain}} creation: {}", validationResult.getErrorMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            logger.info("Creating new {{domain}} with name: {}", request.getName());
            {{domainTitleCase}}Response {{domain}} = {{domain}}Service.create{{domainTitleCase}}(request);
            logger.info("Successfully created {{domain}} with ID: {}", {{domain}}.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body({{domain}});
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to create {{domain}}: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Update {{domain}}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update {{domain}}", description = "Update an existing {{domain}} with new information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "{{domainTitleCase}} updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "{{domainTitleCase}} not found"),
            @ApiResponse(responseCode = "409", description = "{{domainTitleCase}} name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<{{domainTitleCase}}Response> update{{domainTitleCase}}(
            @Parameter(description = "{{domainTitleCase}} unique identifier")
            @PathVariable String id,
            @Valid @RequestBody {{domainTitleCase}}Request request) {

        try {
            // Perform custom validation
            {{domainTitleCase}}Validator.ValidationResult validationResult = {{domain}}Validator.validateUpdateRequest(id, request);
            if (!validationResult.isValid()) {
                logger.warn("Validation failed for {{domain}} update: {}", validationResult.getErrorMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            logger.info("Updating {{domain}} with ID: {}", id);
            return {{domain}}Service.update{{domainTitleCase}}(id, request)
                    .map({{domain}} -> {
                        logger.info("Successfully updated {{domain}} with ID: {}", id);
                        return ResponseEntity.ok({{domain}});
                    })
                    .orElseGet(() -> {
                        logger.warn("{{domainTitleCase}} not found with ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update {{domain}} with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Delete {{domain}}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete {{domain}}", description = "Delete a {{domain}} by its unique identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "{{domainTitleCase}} deleted successfully"),
            @ApiResponse(responseCode = "404", description = "{{domainTitleCase}} not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> delete{{domainTitleCase}}(
            @Parameter(description = "{{domainTitleCase}} unique identifier")
            @PathVariable String id) {

        try {
            // Perform custom validation
            {{domainTitleCase}}Validator.ValidationResult validationResult = {{domain}}Validator.validateDeleteRequest(id);
            if (!validationResult.isValid()) {
                logger.warn("Validation failed for {{domain}} deletion: {}", validationResult.getErrorMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            logger.info("Deleting {{domain}} with ID: {}", id);
            boolean deleted = {{domain}}Service.delete{{domainTitleCase}}(id);

            if (deleted) {
                logger.info("Successfully deleted {{domain}} with ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                logger.warn("{{domainTitleCase}} not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to delete {{domain}} with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Search {{domain}}s by text
     */
    @GetMapping("/search")
    @Operation(summary = "Search {{domain}}s", description = "Search {{domain}}s by text in name or description")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<{{domainTitleCase}}Response>> search{{domainTitleCase}}s(
            @Parameter(description = "Search text")
            @RequestParam String searchText) {

        logger.info("Searching {{domain}}s with text: {}", searchText);
        List<{{domainTitleCase}}Response> results = {{domain}}Service.search{{domainTitleCase}}s(searchText);
        logger.info("Found {} {{domain}}s matching search criteria", results.size());
        return ResponseEntity.ok(results);
    }

    /**
     * Get {{domain}}s created after specific date
     */
    @GetMapping("/created-after")
    @Operation(summary = "Get {{domain}}s created after date", description = "Retrieve {{domain}}s created after the specified date")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "{{domainTitleCase}}s retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date format"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<{{domainTitleCase}}Response>> get{{domainTitleCase}}sCreatedAfter(
            @Parameter(description = "Date in ISO format (yyyy-MM-ddTHH:mm:ss)")
            @RequestParam String date) {

        try {
            LocalDateTime dateTime = LocalDateTime.parse(date);
            logger.info("Fetching {{domain}}s created after: {}", dateTime);
            List<{{domainTitleCase}}Response> results = {{domain}}Service.get{{domainTitleCase}}sCreatedAfter(dateTime);
            logger.info("Found {} {{domain}}s created after {}", results.size(), dateTime);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.warn("Invalid date format: {}", date);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if {{domain}} exists by name
     */
    @GetMapping("/exists")
    @Operation(summary = "Check if {{domain}} exists", description = "Check if a {{domain}} exists by name")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Boolean> exists{{domainTitleCase}}ByName(
            @Parameter(description = "{{domainTitleCase}} name")
            @RequestParam String name) {

        logger.info("Checking if {{domain}} exists with name: {}", name);
        boolean exists = {{domain}}Service.exists{{domainTitleCase}}ByName(name);
        logger.info("{{domainTitleCase}} with name '{}' exists: {}", name, exists);
        return ResponseEntity.ok(exists);
    }
}