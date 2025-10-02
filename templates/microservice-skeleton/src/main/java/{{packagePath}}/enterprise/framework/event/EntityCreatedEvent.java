/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Event published when an entity is created.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class EntityCreatedEvent<T> extends AbstractDomainEvent<T> {

    /**
     * Creates a new entity created event.
     *
     * @param entity the created entity
     */
    public EntityCreatedEvent(T entity) {
        super("ENTITY_CREATED", entity, entity.getClass().getSimpleName());
    }

    /**
     * Gets the created entity.
     *
     * @return the entity
     */
    public T getEntity() {
        return getPayload();
    }
}
