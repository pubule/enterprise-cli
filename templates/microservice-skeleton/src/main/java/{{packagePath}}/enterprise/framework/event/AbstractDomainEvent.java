/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Abstract base implementation of DomainEvent.
 * Provides common event functionality with unique ID, timestamp, and metadata.
 *
 * @param <T> the payload type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public abstract class AbstractDomainEvent<T> implements DomainEvent<T> {

    private final String eventId;
    private final String eventType;
    private final T payload;
    private final LocalDateTime occurredAt;
    private final String source;
    private final Map<String, Object> metadata;

    /**
     * Creates a new domain event.
     *
     * @param eventType the event type identifier
     * @param payload the event payload
     * @param source the source identifier
     */
    protected AbstractDomainEvent(String eventType, T payload, String source) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.payload = payload;
        this.occurredAt = LocalDateTime.now();
        this.source = source;
        this.metadata = new HashMap<>();
    }

    /**
     * Adds metadata to the event.
     *
     * @param key the metadata key
     * @param value the metadata value
     */
    public void addMetadata(String key, Object value) {
        this.metadata.put(key, value);
    }

    /**
     * Adds multiple metadata entries.
     *
     * @param metadata the metadata map
     */
    public void addMetadata(Map<String, Object> metadata) {
        this.metadata.putAll(metadata);
    }

    @Override
    public String getEventId() {
        return eventId;
    }

    @Override
    public String getEventType() {
        return eventType;
    }

    @Override
    public T getPayload() {
        return payload;
    }

    @Override
    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    @Override
    public String getSource() {
        return source;
    }

    @Override
    public Map<String, Object> getMetadata() {
        return metadata;
    }

    @Override
    public String toString() {
        return String.format("%s{eventId='%s', eventType='%s', source='%s', occurredAt=%s}",
                getClass().getSimpleName(), eventId, eventType, source, occurredAt);
    }
}
