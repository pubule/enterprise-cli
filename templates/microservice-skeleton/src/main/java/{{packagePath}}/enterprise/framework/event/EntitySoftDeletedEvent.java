/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Event published when an entity is soft deleted (marked as deleted).
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntitySoftDeletedEvent<T> extends AbstractDomainEvent<T> {

    /**
     * Creates a new entity soft deleted event.
     *
     * @param entity the soft deleted entity
     */
    public EntitySoftDeletedEvent(T entity) {
        super("ENTITY_SOFT_DELETED", entity, entity.getClass().getSimpleName());
    }

    /**
     * Gets the soft deleted entity.
     *
     * @return the entity
     */
    public T getEntity() {
        return getPayload();
    }
}
