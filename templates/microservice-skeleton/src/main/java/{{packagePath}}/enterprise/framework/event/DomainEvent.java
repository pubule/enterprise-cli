/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import java.time.LocalDateTime;

/**
 * Base interface for domain events.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface DomainEvent {

    /**
     * Gets the event type identifier.
     *
     * @return the event type
     */
    String getEventType();

    /**
     * Gets when the event occurred.
     *
     * @return the occurrence timestamp
     */
    LocalDateTime getOccurredAt();

    /**
     * Gets the ID of the entity related to this event.
     *
     * @return the entity ID
     */
    Object getEntityId();
}
