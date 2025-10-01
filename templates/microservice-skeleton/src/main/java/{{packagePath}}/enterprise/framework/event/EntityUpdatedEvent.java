/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import {{packageName}}.enterprise.framework.core.entity.AbstractAuditableEntity;

import java.time.LocalDateTime;

/**
 * Event published when an entity is updated.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntityUpdatedEvent<T extends AbstractAuditableEntity<?>> implements DomainEvent {

    private final T entity;
    private final LocalDateTime occurredAt;

    public EntityUpdatedEvent(T entity) {
        this.entity = entity;
        this.occurredAt = LocalDateTime.now();
    }

    @Override
    public String getEventType() {
        return "ENTITY_UPDATED";
    }

    @Override
    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    @Override
    public Object getEntityId() {
        return entity.getId();
    }

    public T getEntity() {
        return entity;
    }

    public String getEntityType() {
        return entity.getClass().getSimpleName();
    }
}
