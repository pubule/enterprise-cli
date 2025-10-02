/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.service;

import {{packageName}}.enterprise.framework.constants.FrameworkConstants;
import {{packageName}}.enterprise.framework.core.entity.AbstractAuditableEntity;
import {{packageName}}.enterprise.framework.core.entity.SoftDeletable;
import {{packageName}}.enterprise.framework.core.repository.AbstractEnterpriseRepository;
import {{packageName}}.enterprise.framework.event.*;
import {{packageName}}.enterprise.framework.exception.ResourceNotFoundException;
import {{packageName}}.enterprise.framework.exception.ValidationException;
import {{packageName}}.enterprise.framework.validation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

/**
 * Abstract base service for enterprise entities.
 * Provides CRUD operations with validation, business rules, and event publishing.
 *
 * @param <T> the entity type
 * @param <ID> the entity ID type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@Transactional
public abstract class AbstractEnterpriseService<T extends AbstractAuditableEntity<ID>, ID>
        implements CrudService<T, ID> {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    protected final AbstractEnterpriseRepository<T, ID> repository;
    protected final BusinessValidator<T> validator;
    protected final ApplicationEventPublisher eventPublisher;

    protected AbstractEnterpriseService(
            AbstractEnterpriseRepository<T, ID> repository,
            BusinessValidator<T> validator,
            ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.validator = validator != null ? validator : new DefaultValidator<>();
        this.eventPublisher = eventPublisher;
    }

    protected AbstractEnterpriseService(
            AbstractEnterpriseRepository<T, ID> repository,
            ApplicationEventPublisher eventPublisher) {
        this(repository, new DefaultValidator<>(), eventPublisher);
    }

    /**
     * Creates a new entity with validation and event publishing.
     *
     * @param entity the entity to create
     * @return the created entity
     * @throws ValidationException if validation fails
     */
    @Override
    public T create(T entity) {
        log.debug("Creating entity: {}", entity.getClass().getSimpleName());

        // Validation
        ValidationResult validationResult = validator.validate(entity, ValidationContext.forCreate());
        if (!validationResult.isValid()) {
            log.warn("Validation failed for create: {}", validationResult.getErrors());
            throw ValidationException.fromValidationResult(validationResult);
        }

        // Business rules
        executeBusinessRules(entity, RuleContext.forCreate());

        // Save
        T saved = repository.save(entity);
        log.info("Entity created with id: {}", saved.getId());

        // Publish event
        publishEvent(new EntityCreatedEvent<>(saved));

        return saved;
    }

    /**
     * Updates an existing entity with validation and event publishing.
     *
     * @param id the entity ID
     * @param entity the updated entity data
     * @return the updated entity
     * @throws ResourceNotFoundException if entity not found
     * @throws ValidationException if validation fails
     */
    @Override
    public T update(ID id, T entity) {
        log.debug("Updating entity with id: {}", id);

        T existing = findById(id);

        // Validation
        ValidationResult validationResult = validator.validate(entity, ValidationContext.forUpdate(existing));
        if (!validationResult.isValid()) {
            log.warn("Validation failed for update: {}", validationResult.getErrors());
            throw ValidationException.fromValidationResult(validationResult);
        }

        // Business rules
        executeBusinessRules(entity, RuleContext.forUpdate(existing));

        // Merge changes
        mergeForUpdate(existing, entity);

        // Save
        T updated = repository.save(existing);
        log.info("Entity updated with id: {}", updated.getId());

        // Publish event
        publishEvent(new EntityUpdatedEvent<>(updated));

        return updated;
    }

    /**
     * Finds an entity by ID.
     *
     * @param id the entity ID
     * @return the entity
     * @throws ResourceNotFoundException if not found
     */
    @Override
    @Transactional(readOnly = true)
    public T findById(ID id) {
        log.debug("Finding entity by id: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        getEntityName(), id));
    }

    /**
     * Finds all entities with pagination.
     *
     * @param pageable pagination information
     * @return page of entities
     */
    @Override
    @Transactional(readOnly = true)
    public Page<T> findAll(Pageable pageable) {
        log.debug("Finding all entities with pagination: {}", pageable);
        return repository.findAll(pageable);
    }

    /**
     * Deletes an entity by ID (soft delete if supported).
     *
     * @param id the entity ID
     * @throws ResourceNotFoundException if not found
     */
    @Override
    public void delete(ID id) {
        log.debug("Deleting entity with id: {}", id);

        T entity = findById(id);

        // Soft delete if supported
        if (entity instanceof SoftDeletable) {
            ((SoftDeletable) entity).softDelete();
            repository.save(entity);
            log.info("Entity soft deleted with id: {}", id);
            publishEvent(new EntitySoftDeletedEvent<>(entity));
        } else {
            repository.delete(entity);
            log.info("Entity hard deleted with id: {}", id);
            publishEvent(new EntityDeletedEvent<>(entity));
        }
    }

    /**
     * Hard deletes an entity (permanent deletion).
     *
     * @param id the entity ID
     * @throws ResourceNotFoundException if not found
     */
    public void hardDelete(ID id) {
        log.debug("Hard deleting entity with id: {}", id);

        T entity = findById(id);
        repository.delete(entity);

        log.info("Entity permanently deleted with id: {}", id);
        publishEvent(new EntityDeletedEvent<>(entity));
    }

    /**
     * Finds entities using dynamic criteria.
     *
     * @param spec the specification
     * @param pageable pagination information
     * @return page of entities matching criteria
     */
    @Transactional(readOnly = true)
    public Page<T> findWithCriteria(Specification<T> spec, Pageable pageable) {
        log.debug("Finding entities with criteria and pagination");
        return repository.findWithCriteria(spec, pageable);
    }

    /**
     * Counts all entities.
     *
     * @return the total count
     */
    @Transactional(readOnly = true)
    public long count() {
        return repository.count();
    }

    /**
     * Checks if an entity exists by ID.
     *
     * @param id the entity ID
     * @return true if exists
     */
    @Transactional(readOnly = true)
    public boolean exists(ID id) {
        return repository.existsById(id);
    }

    /**
     * Publishes a domain event.
     *
     * @param event the event to publish
     */
    protected void publishEvent(DomainEvent event) {
        if (eventPublisher != null) {
            log.debug("Publishing event: {}", event.getEventType());
            eventPublisher.publishEvent(event);
        }
    }

    /**
     * Gets the entity class name for error messages.
     *
     * @return the entity name
     */
    protected String getEntityName() {
        return FrameworkConstants.EntityDefaults.ENTITY_NAME;
    }

    /**
     * Merges updated data into existing entity.
     * Subclasses must implement this to copy fields from updates to existing.
     *
     * @param existing the existing entity
     * @param updates the updated data
     */
    protected abstract void mergeForUpdate(T existing, T updates);

    /**
     * Executes business rules for the entity.
     * Subclasses can override to add custom business rules.
     *
     * @param entity the entity
     * @param context the rule context
     */
    protected void executeBusinessRules(T entity, RuleContext context) {
        // Default: no business rules
        // Override in subclasses to add rules
    }
}
