/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.service;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.repository.{{domainTitleCase}}Repository;
import {{packageName}}.business.{{domainTitleCase}}BusinessRules;
import {{packageName}}.enterprise.framework.annotation.EnterpriseService;
import {{packageName}}.enterprise.framework.core.service.AbstractEnterpriseService;
import {{packageName}}.enterprise.framework.exception.BusinessException;
import {{packageName}}.enterprise.framework.validation.BusinessValidator;
import {{packageName}}.enterprise.framework.validation.RuleContext;
import {{packageName}}.enterprise.framework.validation.RuleResult;
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
    private final {{domainTitleCase}}BusinessRules businessRules;

    public {{domainTitleCase}}Service(
            {{domainTitleCase}}Repository {{domain}}Repository,
            BusinessValidator<{{domainTitleCase}}> validator,
            ApplicationEventPublisher eventPublisher,
            {{domainTitleCase}}BusinessRules businessRules) {
        super({{domain}}Repository, validator, eventPublisher);
        this.{{domain}}Repository = {{domain}}Repository;
        this.businessRules = businessRules;
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

    /**
     * Executes business rules for the entity.
     * Called by framework after validation passes, before save.
     *
     * <p><strong>Rule Execution Flow:</strong>
     * <ol>
     *   <li>Basic validation (field-level) via BusinessValidator</li>
     *   <li>Business rules (complex logic) via BusinessRules - YOU ARE HERE</li>
     *   <li>Save to database</li>
     *   <li>Publish events</li>
     * </ol>
     *
     * @param entity  the entity to validate
     * @param context the rule context (operation type, existing entity)
     * @throws BusinessException if business rules fail with ERROR or CRITICAL severity
     */
    @Override
    protected void executeBusinessRules({{domainTitleCase}} entity, RuleContext context) {
        log.debug("Executing business rules for {{domain}}: {}", entity.getId());

        RuleResult result = businessRules.evaluate(entity, context);

        if (!result.isPassed()) {
            log.warn("Business rule failed: {} - {}", result.getRuleName(), result.getMessage());

            // For CRITICAL and ERROR severity, throw exception to block operation
            if (result.getSeverity() == RuleResult.RuleSeverity.CRITICAL ||
                result.getSeverity() == RuleResult.RuleSeverity.ERROR) {
                throw new BusinessException("BUSINESS_RULE_VIOLATION")
                        .withMessage(result.getMessage())
                        .withDetail("ruleName", result.getRuleName())
                        .withDetail("severity", result.getSeverity().toString());
            }

            // For WARNING and INFO, log but allow operation to continue
            if (result.getSeverity() == RuleResult.RuleSeverity.WARNING) {
                log.warn("Business rule warning: {}", result.getMessage());
            }
        }
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
