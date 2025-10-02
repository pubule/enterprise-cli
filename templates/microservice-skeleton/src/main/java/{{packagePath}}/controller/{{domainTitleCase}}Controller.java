/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.controller;

import {{packageName}}.dto.{{domainTitleCase}}Request;
import {{packageName}}.dto.{{domainTitleCase}}Response;
import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.mapper.{{domainTitleCase}}Mapper;
import {{packageName}}.service.{{domainTitleCase}}Service;
import {{packageName}}.enterprise.framework.annotation.EnterpriseController;
import {{packageName}}.enterprise.framework.core.controller.AbstractEnterpriseController;
import {{packageName}}.enterprise.framework.core.repository.SpecificationBuilder;
import {{packageName}}.enterprise.framework.dto.ApiResponse;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * {{domainTitleCase}} REST Controller
 *
 * <p>Extends AbstractEnterpriseController for comprehensive REST endpoints.
 *
 * <p><strong>Inherited endpoints from framework (fully functional):</strong>
 * <ul>
 *   <li>{@code POST /api/v1/{{domain}}s} - Create {{domain}}</li>
 *   <li>{@code GET /api/v1/{{domain}}s/{id}} - Get {{domain}} by ID</li>
 *   <li>{@code GET /api/v1/{{domain}}s} - List all (paginated)</li>
 *   <li>{@code PUT /api/v1/{{domain}}s/{id}} - Update {{domain}}</li>
 *   <li>{@code PATCH /api/v1/{{domain}}s/{id}} - Partially update {{domain}}</li>
 *   <li>{@code DELETE /api/v1/{{domain}}s/{id}} - Delete {{domain}} (soft)</li>
 *   <li>{@code GET /api/v1/{{domain}}s/search} - Search with criteria</li>
 *   <li>{@code GET /api/v1/{{domain}}s/count} - Count all</li>
 *   <li>{@code GET /api/v1/{{domain}}s/{id}/exists} - Check existence</li>
 * </ul>
 *
 * <p><strong>All responses use standardized format:</strong>
 * <pre>
 * {
 *   "success": true,
 *   "data": { ... },
 *   "error": null,
 *   "metadata": {},
 *   "timestamp": "2024-01-15T10:30:00"
 * }
 * </pre>
 *
 * <p><strong>Add custom endpoints below!</strong>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@EnterpriseController("/api/v1/{{domain}}s")
public class {{domainTitleCase}}Controller extends AbstractEnterpriseController<
        {{domainTitleCase}}, Long, {{domainTitleCase}}Request, {{domainTitleCase}}Response> {

    private final {{domainTitleCase}}Service {{domain}}Service;

    public {{domainTitleCase}}Controller(
            {{domainTitleCase}}Service {{domain}}Service,
            {{domainTitleCase}}Mapper mapper) {
        super({{domain}}Service, mapper);
        this.{{domain}}Service = {{domain}}Service;
    }

    // ═══════════════════════════════════════════════════════
    // REQUIRED FRAMEWORK METHODS
    // These methods MUST be implemented for framework to work
    // ═══════════════════════════════════════════════════════

    /**
     * Builds JPA Specification for dynamic search.
     * Called by framework when /search endpoint is used.
     *
     * <p>Example search URLs:
     * <ul>
     *   <li>{@code /api/v1/{{domain}}s/search?name=Sample} - Find by name</li>
     *   <li>{@code /api/v1/{{domain}}s/search?status=ACTIVE} - Find by status</li>
     *   <li>{@code /api/v1/{{domain}}s/search?name=Sample&status=ACTIVE} - Combined</li>
     * </ul>
     *
     * @param criteria search criteria as key-value pairs
     * @return JPA Specification for the query
     */
    @Override
    protected Specification<{{domainTitleCase}}> buildSpecification(Map<String, String> criteria) {
        SpecificationBuilder<{{domainTitleCase}}> builder = new SpecificationBuilder<>();

        // Add search criteria based on query parameters
        if (criteria.containsKey("name")) {
            builder.withLike("name", criteria.get("name"));
        }

        if (criteria.containsKey("status")) {
            builder.withEqual("status", criteria.get("status"));
        }

        if (criteria.containsKey("description")) {
            builder.withLike("description", criteria.get("description"));
        }

        // Example: Date range filter
        if (criteria.containsKey("createdAfter")) {
            // builder.withGreaterThanOrEqual("createdAt", parseDate(criteria.get("createdAfter")));
        }

        return builder.build();
    }

    /**
     * Returns entity name for error messages and logging.
     *
     * @return the entity name
     */
    @Override
    protected String getEntityName() {
        return "{{domainTitleCase}}";
    }

    // ═══════════════════════════════════════════════════════
    // CUSTOM ENDPOINTS
    // Add your domain-specific REST endpoints here
    // ═══════════════════════════════════════════════════════

    /**
     * Activate a {{domain}}.
     *
     * <p><strong>Endpoint:</strong> {@code POST /api/v1/{{domain}}s/{id}/activate}
     *
     * <p><strong>Example:</strong>
     * <pre>
     * curl -X POST http://localhost:8080/api/v1/{{domain}}s/1/activate
     * </pre>
     *
     * @param id the {{domain}} ID
     * @return the activated {{domain}}
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<{{domainTitleCase}}Response>> activate(@PathVariable Long id) {
        log.debug("REST request to activate {{domain}}: {}", id);

        {{domainTitleCase}} activated = {{domain}}Service.activate(id);
        {{domainTitleCase}}Response response = mapper.toResponse(activated);

        return ResponseEntity.ok(
                ApiResponse.success(response, "{{domainTitleCase}} activated successfully")
        );
    }

    /**
     * Deactivate a {{domain}}.
     *
     * <p><strong>Endpoint:</strong> {@code POST /api/v1/{{domain}}s/{id}/deactivate}
     *
     * <p><strong>Example:</strong>
     * <pre>
     * curl -X POST http://localhost:8080/api/v1/{{domain}}s/1/deactivate
     * </pre>
     *
     * @param id the {{domain}} ID
     * @return the deactivated {{domain}}
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<{{domainTitleCase}}Response>> deactivate(@PathVariable Long id) {
        log.debug("REST request to deactivate {{domain}}: {}", id);

        {{domainTitleCase}} deactivated = {{domain}}Service.deactivate(id);
        {{domainTitleCase}}Response response = mapper.toResponse(deactivated);

        return ResponseEntity.ok(
                ApiResponse.success(response, "{{domainTitleCase}} deactivated successfully")
        );
    }

    /**
     * Find {{domain}}s by status.
     *
     * <p><strong>Endpoint:</strong> {@code GET /api/v1/{{domain}}s/by-status/{status}}
     *
     * <p><strong>Example:</strong>
     * <pre>
     * curl http://localhost:8080/api/v1/{{domain}}s/by-status/ACTIVE
     * </pre>
     *
     * @param status the status to filter by
     * @return list of {{domain}}s with given status
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<ApiResponse<List<{{domainTitleCase}}Response>>> findByStatus(
            @PathVariable String status) {
        log.debug("REST request to find {{domain}}s by status: {}", status);

        List<{{domainTitleCase}}> entities = {{domain}}Service.findByStatus(status);
        List<{{domainTitleCase}}Response> responses = entities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Search {{domain}}s by name pattern.
     *
     * <p><strong>Endpoint:</strong> {@code GET /api/v1/{{domain}}s/search-by-name}
     *
     * <p><strong>Example:</strong>
     * <pre>
     * curl http://localhost:8080/api/v1/{{domain}}s/search-by-name?pattern=sample
     * </pre>
     *
     * @param pattern the search pattern
     * @return list of matching {{domain}}s
     */
    @GetMapping("/search-by-name")
    public ResponseEntity<ApiResponse<List<{{domainTitleCase}}Response>>> searchByName(
            @RequestParam String pattern) {
        log.debug("REST request to search {{domain}}s by name pattern: {}", pattern);

        List<{{domainTitleCase}}> entities = {{domain}}Service.searchByName(pattern);
        List<{{domainTitleCase}}Response> responses = entities.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * Get count of {{domain}}s by status.
     *
     * <p><strong>Endpoint:</strong> {@code GET /api/v1/{{domain}}s/count-by-status/{status}}
     *
     * <p><strong>Example:</strong>
     * <pre>
     * curl http://localhost:8080/api/v1/{{domain}}s/count-by-status/ACTIVE
     * </pre>
     *
     * @param status the status
     * @return count of {{domain}}s
     */
    @GetMapping("/count-by-status/{status}")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@PathVariable String status) {
        log.debug("REST request to count {{domain}}s by status: {}", status);

        long count = {{domain}}Service.countByStatus(status);

        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
