/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Interface for publishing domain events.
 * Provides both synchronous and asynchronous event publishing.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface EventPublisher {

    /**
     * Publishes a domain event synchronously.
     * The event will be processed in the current thread.
     *
     * @param event the event to publish
     * @param <T> the payload type
     */
    <T> void publish(DomainEvent<T> event);

    /**
     * Publishes a domain event asynchronously.
     * The event will be processed in a separate thread.
     *
     * @param event the event to publish
     * @param <T> the payload type
     */
    <T> void publishAsync(DomainEvent<T> event);
}
