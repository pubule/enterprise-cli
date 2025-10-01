/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

/**
 * Interface for publishing domain events.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface EventPublisher {

    /**
     * Publishes a domain event.
     *
     * @param event the event to publish
     */
    void publish(DomainEvent event);
}
