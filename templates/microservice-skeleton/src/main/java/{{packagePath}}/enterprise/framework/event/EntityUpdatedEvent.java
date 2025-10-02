/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Event published when an entity is updated.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntityUpdatedEvent<T> extends AbstractDomainEvent<T> {

    /**
     * Creates a new entity updated event.
     *
     * @param entity the updated entity
     */
    public EntityUpdatedEvent(T entity) {
        super("ENTITY_UPDATED", entity, entity.getClass().getSimpleName());
    }

    /**
     * Gets the updated entity.
     *
     * @return the entity
     */
    public T getEntity() {
        return getPayload();
    }
}
