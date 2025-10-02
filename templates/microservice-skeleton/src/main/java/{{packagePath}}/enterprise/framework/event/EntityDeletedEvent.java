/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Event published when an entity is hard deleted (permanently removed).
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntityDeletedEvent<T> extends AbstractDomainEvent<T> {

    /**
     * Creates a new entity deleted event.
     *
     * @param entity the deleted entity
     */
    public EntityDeletedEvent(T entity) {
        super("ENTITY_DELETED", entity, entity.getClass().getSimpleName());
    }

    /**
     * Gets the deleted entity.
     *
     * @return the entity
     */
    public T getEntity() {
        return getPayload();
    }
}
