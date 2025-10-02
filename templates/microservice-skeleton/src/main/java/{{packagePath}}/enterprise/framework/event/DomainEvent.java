/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Base interface for domain events.
 * Domain events represent significant occurrences in the business domain.
 *
 * @param <T> the payload type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface DomainEvent<T> {

    /**
     * Gets the unique event identifier.
     *
     * @return the event ID
     */
    String getEventId();

    /**
     * Gets the event type identifier.
     *
     * @return the event type
     */
    String getEventType();

    /**
     * Gets the event payload (the domain object).
     *
     * @return the payload
     */
    T getPayload();

    /**
     * Gets when the event occurred.
     *
     * @return the occurrence timestamp
     */
    LocalDateTime getOccurredAt();

    /**
     * Gets the event source (typically the entity class name).
     *
     * @return the source identifier
     */
    String getSource();

    /**
     * Gets additional event metadata.
     *
     * @return metadata map
     */
    Map<String, Object> getMetadata();
}
