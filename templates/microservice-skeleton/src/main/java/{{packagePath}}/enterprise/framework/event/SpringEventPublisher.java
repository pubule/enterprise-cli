/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Spring-based implementation of EventPublisher.
 * Delegates to Spring's ApplicationEventPublisher for event distribution.
 * Requires @EnableAsync configuration for asynchronous publishing.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@Component
public class SpringEventPublisher implements EventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    public SpringEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Publishes an event synchronously using Spring's event mechanism.
     *
     * @param event the event to publish
     * @param <T> the payload type
     */
    @Override
    public <T> void publish(DomainEvent<T> event) {
        applicationEventPublisher.publishEvent(event);
    }

    /**
     * Publishes an event asynchronously using Spring's @Async mechanism.
     * Requires @EnableAsync in application configuration.
     *
     * @param event the event to publish
     * @param <T> the payload type
     */
    @Override
    @Async
    public <T> void publishAsync(DomainEvent<T> event) {
        applicationEventPublisher.publishEvent(event);
    }
}
