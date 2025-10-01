/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.controller;

import {{packageName}}.enterprise.framework.core.entity.AbstractAuditableEntity;
import {{packageName}}.enterprise.framework.core.service.AbstractEnterpriseService;
import {{packageName}}.enterprise.framework.dto.ApiResponse;
import {{packageName}}.enterprise.framework.dto.EntityMapper;
import {{packageName}}.enterprise.framework.dto.PageResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Abstract base controller for enterprise REST endpoints.
 * Provides standard CRUD operations with pagination and search.
 *
 * @param <T> the entity type
 * @param <ID> the entity ID type
 * @param <REQ> the request DTO type
 * @param <RES> the response DTO type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public abstract class AbstractEnterpriseController<
        T extends AbstractAuditableEntity<ID>,
        ID,
        REQ,
        RES> {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    protected final AbstractEnterpriseService<T, ID> service;
    protected final EntityMapper<T, REQ, RES> mapper;

    protected AbstractEnterpriseController(
            AbstractEnterpriseService<T, ID> service,
            EntityMapper<T, REQ, RES> mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    /**
     * Creates a new entity.
     *
     * @param request the request DTO
     * @return the created entity response
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RES>> create(@Valid @RequestBody REQ request) {
        log.debug("Creating new entity from request: {}", request.getClass().getSimpleName());

        T entity = mapper.toEntity(request);
        T created = service.create(entity);
        RES response = mapper.toResponse(created);

        log.info("Entity created with id: {}", created.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Entity created successfully"));
    }

    /**
     * Finds an entity by ID.
     *
     * @param id the entity ID
     * @return the entity response
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RES>> findById(@PathVariable ID id) {
        log.debug("Finding entity by id: {}", id);

        T entity = service.findById(id);
        RES response = mapper.toResponse(entity);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Finds all entities with pagination and sorting.
     *
     * @param page the page number (0-indexed)
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDir the sort direction (asc/desc)
     * @return page of entity responses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RES>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        log.debug("Finding all entities - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<T> entityPage = service.findAll(pageable);
        Page<RES> responsePage = entityPage.map(mapper::toResponse);

        PageResponse<RES> pageResponse = PageResponse.from(responsePage);

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    /**
     * Updates an existing entity.
     *
     * @param id the entity ID
     * @param request the update request DTO
     * @return the updated entity response
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RES>> update(
            @PathVariable ID id,
            @Valid @RequestBody REQ request) {

        log.debug("Updating entity with id: {}", id);

        T entity = mapper.toEntity(request);
        T updated = service.update(id, entity);
        RES response = mapper.toResponse(updated);

        log.info("Entity updated with id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(response, "Entity updated successfully"));
    }

    /**
     * Partially updates an existing entity.
     *
     * @param id the entity ID
     * @param request the partial update request DTO
     * @return the updated entity response
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RES>> partialUpdate(
            @PathVariable ID id,
            @RequestBody REQ request) {

        log.debug("Partially updating entity with id: {}", id);

        T existing = service.findById(id);
        mapper.updateEntity(existing, request);
        T updated = service.update(id, existing);
        RES response = mapper.toResponse(updated);

        log.info("Entity partially updated with id: {}", id);
        return ResponseEntity.ok(ApiResponse.success(response, "Entity updated successfully"));
    }

    /**
     * Deletes an entity by ID.
     *
     * @param id the entity ID
     * @return no content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable ID id) {
        log.debug("Deleting entity with id: {}", id);

        service.delete(id);

        log.info("Entity deleted with id: {}", id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Entity deleted successfully"));
    }

    /**
     * Searches for entities using dynamic criteria.
     *
     * @param criteria search criteria as key-value pairs
     * @param page the page number (0-indexed)
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDir the sort direction (asc/desc)
     * @return page of matching entity responses
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<RES>>> search(
            @RequestParam Map<String, String> criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        log.debug("Searching entities with criteria: {}", criteria);

        // Remove pagination params from criteria
        criteria.remove("page");
        criteria.remove("size");
        criteria.remove("sortBy");
        criteria.remove("sortDir");

        Specification<T> spec = buildSpecification(criteria);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<T> entityPage = service.findWithCriteria(spec, pageable);
        Page<RES> responsePage = entityPage.map(mapper::toResponse);

        PageResponse<RES> pageResponse = PageResponse.from(responsePage);

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    /**
     * Counts all entities.
     *
     * @return the total count
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> count() {
        log.debug("Counting all entities");

        long count = service.count();

        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * Checks if an entity exists by ID.
     *
     * @param id the entity ID
     * @return true if exists
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<ApiResponse<Boolean>> exists(@PathVariable ID id) {
        log.debug("Checking if entity exists with id: {}", id);

        boolean exists = service.exists(id);

        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    /**
     * Builds a JPA Specification from search criteria.
     * Subclasses must implement this to define their search logic.
     *
     * @param criteria the search criteria as key-value pairs
     * @return the JPA Specification
     */
    protected abstract Specification<T> buildSpecification(Map<String, String> criteria);

    /**
     * Gets the entity name for logging and messages.
     *
     * @return the entity name
     */
    protected String getEntityName() {
        return "Entity";
    }
}
