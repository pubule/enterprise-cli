/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import {{packageName}}.enterprise.framework.core.entity.AbstractAuditableEntity;

import java.time.LocalDateTime;

/**
 * Event published when an entity is soft deleted.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntitySoftDeletedEvent<T extends AbstractAuditableEntity<?>> implements DomainEvent {

    private final T entity;
    private final LocalDateTime occurredAt;

    public EntitySoftDeletedEvent(T entity) {
        this.entity = entity;
        this.occurredAt = LocalDateTime.now();
    }

    @Override
    public String getEventType() {
        return "ENTITY_SOFT_DELETED";
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
