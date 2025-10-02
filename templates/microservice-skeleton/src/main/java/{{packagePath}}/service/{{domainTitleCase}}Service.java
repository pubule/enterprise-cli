/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.service;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.repository.{{domainTitleCase}}Repository;
import {{packageName}}.enterprise.framework.annotation.EnterpriseService;
import {{packageName}}.enterprise.framework.core.service.AbstractEnterpriseService;
import {{packageName}}.enterprise.framework.exception.BusinessException;
import {{packageName}}.enterprise.framework.validation.BusinessValidator;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;

/**
 * {{domainTitleCase}} Service
 *
 * <p>Extends AbstractEnterpriseService for comprehensive business operations.
 *
 * <p><strong>Inherited methods from framework (fully functional):</strong>
 * <ul>
 *   <li>{@code create(T)} - Create with validation, events, audit</li>
 *   <li>{@code update(ID, T)} - Update with validation, events, audit</li>
 *   <li>{@code findById(ID)} - Find by ID with ResourceNotFoundException</li>
 *   <li>{@code findAll(Pageable)} - Paginated list</li>
 *   <li>{@code delete(ID)} - Soft delete (or hard if not SoftDeletable)</li>
 *   <li>{@code hardDelete(ID)} - Permanent deletion</li>
 *   <li>{@code findWithCriteria(Specification, Pageable)} - Dynamic search</li>
 *   <li>{@code count()} - Count all</li>
 *   <li>{@code exists(ID)} - Check existence</li>
 * </ul>
 *
 * <p><strong>Events automatically published:</strong>
 * <ul>
 *   <li>EntityCreatedEvent - on successful create</li>
 *   <li>EntityUpdatedEvent - on successful update</li>
 *   <li>EntityDeletedEvent - on hard delete</li>
 *   <li>EntitySoftDeletedEvent - on soft delete</li>
 * </ul>
 *
 * <p><strong>Add custom business methods below!</strong>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@EnterpriseService
public class {{domainTitleCase}}Service extends AbstractEnterpriseService<{{domainTitleCase}}, Long> {

    private final {{domainTitleCase}}Repository {{domain}}Repository;

    public {{domainTitleCase}}Service(
            {{domainTitleCase}}Repository {{domain}}Repository,
            BusinessValidator<{{domainTitleCase}}> validator,
            ApplicationEventPublisher eventPublisher) {
        super({{domain}}Repository, validator, eventPublisher);
        this.{{domain}}Repository = {{domain}}Repository;
    }

    // ═══════════════════════════════════════════════════════
    // REQUIRED FRAMEWORK METHODS
    // These methods MUST be implemented for framework to work
    // ═══════════════════════════════════════════════════════

    /**
     * Merges update data into existing entity.
     * Called by framework during update operations.
     *
     * <p><strong>IMPORTANT:</strong> Only copy fields that should be updatable.
     * Do NOT copy: id, audit fields (createdBy, createdAt, etc.)
     *
     * @param existing the existing entity from database
     * @param updates  the entity with new data
     */
    @Override
    protected void mergeForUpdate({{domainTitleCase}} existing, {{domainTitleCase}} updates) {
        // Copy only updatable fields
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setStatus(updates.getStatus());

        // DO NOT copy:
        // - id (primary key never changes)
        // - createdBy, createdAt (set once, never updated)
        // - updatedBy, updatedAt (handled by framework)
        // - version (handled by JPA for optimistic locking)
        // - deleted, deletedAt, deletedBy (handled by soft delete logic)
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
    // CUSTOM BUSINESS METHODS
    // Add your domain-specific business logic here
    // ═══════════════════════════════════════════════════════

    /**
     * Activate a {{domain}}.
     * Changes status to ACTIVE and saves.
     *
     * @param id the {{domain}} ID
     * @return the activated {{domain}}
     * @throws {{packageName}}.enterprise.framework.exception.ResourceNotFoundException if not found
     * @throws BusinessException if already active
     */
    public {{domainTitleCase}} activate(Long id) {
        log.debug("Activating {{domain}} with id: {}", id);

        {{domainTitleCase}} entity = findById(id);

        if (entity.isActive()) {
            throw new BusinessException("{{domain.toUpperCase()}}_ALREADY_ACTIVE")
                    .withMessage("{{domainTitleCase}} is already active")
                    .withDetail("id", id)
                    .withDetail("currentStatus", entity.getStatus());
        }

        entity.activate();
        {{domainTitleCase}} updated = {{domain}}Repository.save(entity);

        log.info("{{domainTitleCase}} activated successfully: {}", id);

        // You could publish a custom event here:
        // publishEvent(new {{domainTitleCase}}ActivatedEvent(updated));

        return updated;
    }

    /**
     * Deactivate a {{domain}}.
     * Changes status to INACTIVE and saves.
     *
     * @param id the {{domain}} ID
     * @return the deactivated {{domain}}
     * @throws {{packageName}}.enterprise.framework.exception.ResourceNotFoundException if not found
     * @throws BusinessException if already inactive
     */
    public {{domainTitleCase}} deactivate(Long id) {
        log.debug("Deactivating {{domain}} with id: {}", id);

        {{domainTitleCase}} entity = findById(id);

        if (entity.isInactive()) {
            throw new BusinessException("{{domain.toUpperCase()}}_ALREADY_INACTIVE")
                    .withMessage("{{domainTitleCase}} is already inactive")
                    .withDetail("id", id)
                    .withDetail("currentStatus", entity.getStatus());
        }

        entity.deactivate();
        {{domainTitleCase}} updated = {{domain}}Repository.save(entity);

        log.info("{{domainTitleCase}} deactivated successfully: {}", id);

        return updated;
    }

    /**
     * Find {{domain}} by name.
     *
     * @param name the {{domain}} name
     * @return the {{domain}} if found
     * @throws {{packageName}}.enterprise.framework.exception.ResourceNotFoundException if not found
     */
    public {{domainTitleCase}} findByName(String name) {
        log.debug("Finding {{domain}} by name: {}", name);

        return {{domain}}Repository.findByName(name)
                .orElseThrow(() -> new {{packageName}}.enterprise.framework.exception.ResourceNotFoundException(
                        getEntityName(), "name", name));
    }

    /**
     * Find all {{domain}}s by status.
     *
     * @param status the status to filter by
     * @return list of {{domain}}s with given status
     */
    public List<{{domainTitleCase}}> findByStatus(String status) {
        log.debug("Finding all {{domain}}s with status: {}", status);
        return {{domain}}Repository.findByStatusAndDeletedFalse(status);
    }

    /**
     * Search {{domain}}s by name pattern.
     *
     * @param namePattern the search pattern
     * @return list of matching {{domain}}s
     */
    public List<{{domainTitleCase}}> searchByName(String namePattern) {
        log.debug("Searching {{domain}}s with name pattern: {}", namePattern);
        return {{domain}}Repository.searchByName(namePattern);
    }

    /**
     * Get count of {{domain}}s by status.
     *
     * @param status the status
     * @return count of {{domain}}s
     */
    public long countByStatus(String status) {
        log.debug("Counting {{domain}}s with status: {}", status);
        return {{domain}}Repository.countByStatusAndDeletedFalse(status);
    }
}
