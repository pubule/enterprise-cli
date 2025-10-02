/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.config;

import {{packageName}}.enterprise.framework.event.EventPublisher;
import {{packageName}}.enterprise.framework.event.SpringEventPublisher;
import {{packageName}}.enterprise.framework.exception.GlobalExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Auto-configuration for Enterprise Framework.
 * Automatically configures all framework components when present on the classpath.
 *
 * <p>This configuration:
 * <ul>
 *   <li>Enables JPA auditing with Spring Security integration</li>
 *   <li>Enables async event publishing</li>
 *   <li>Registers the global exception handler</li>
 *   <li>Registers the event publisher</li>
 *   <li>Scans for framework components</li>
 * </ul>
 *
 * <p>Configuration can be customized via application.yml:
 * <pre>
 * enterprise:
 *   framework:
 *     enabled: true
 *     jpa:
 *       auditing-enabled: true
 *     events:
 *       async-enabled: true
 *     pagination:
 *       default-page-size: 20
 *       max-page-size: 100
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
@Configuration
@EnableConfigurationProperties(FrameworkProperties.class)
@ComponentScan(basePackages = "{{packageName}}.enterprise.framework")
@ConditionalOnProperty(
        prefix = "enterprise.framework",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class EnterpriseFrameworkAutoConfiguration {

    private static final Logger log = LoggerFactory.getLogger(EnterpriseFrameworkAutoConfiguration.class);

    private final FrameworkProperties properties;

    public EnterpriseFrameworkAutoConfiguration(FrameworkProperties properties) {
        this.properties = properties;
        log.info("Initializing Enterprise Framework v{}", "{{frameworkVersion}}");
        logConfiguration();
    }

    /**
     * Enables JPA auditing if configured.
     */
    @Configuration
    @EnableJpaAuditing(auditorAwareRef = "auditorProvider")
    @ConditionalOnProperty(
            prefix = "enterprise.framework.jpa",
            name = "auditing-enabled",
            havingValue = "true",
            matchIfMissing = true
    )
    static class JpaAuditingConfiguration {
        public JpaAuditingConfiguration() {
            log.info("JPA Auditing enabled");
        }
    }

    /**
     * Enables async event publishing if configured.
     */
    @Configuration
    @EnableAsync
    @ConditionalOnProperty(
            prefix = "enterprise.framework.events",
            name = "async-enabled",
            havingValue = "true",
            matchIfMissing = true
    )
    static class AsyncEventsConfiguration {
        public AsyncEventsConfiguration() {
            log.info("Async event publishing enabled");
        }
    }

    /**
     * Provides the current auditor (username) from Spring Security context.
     * Falls back to "system" if no authentication is present.
     *
     * @return the auditor aware bean
     */
    @Bean
    @ConditionalOnMissingBean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("system");
            }

            String username = authentication.getName();
            return Optional.of(username != null ? username : "system");
        };
    }

    /**
     * Registers the global exception handler for standardized error responses.
     *
     * @return the global exception handler
     */
    @Bean
    @ConditionalOnMissingBean
    public GlobalExceptionHandler globalExceptionHandler() {
        log.info("Registering GlobalExceptionHandler");
        return new GlobalExceptionHandler();
    }

    /**
     * Registers the event publisher for domain events.
     *
     * @param applicationEventPublisher the Spring application event publisher
     * @return the event publisher
     */
    @Bean
    @ConditionalOnMissingBean
    public EventPublisher eventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        log.info("Registering SpringEventPublisher");
        return new SpringEventPublisher(applicationEventPublisher);
    }

    /**
     * Logs the current framework configuration.
     */
    private void logConfiguration() {
        log.info("Enterprise Framework Configuration:");
        log.info("  - JPA Auditing: {}", properties.getJpa().isAuditingEnabled());
        log.info("  - Async Events: {}", properties.getEvents().isAsyncEnabled());
        log.info("  - Default Page Size: {}", properties.getPagination().getDefaultPageSize());
        log.info("  - Max Page Size: {}", properties.getPagination().getMaxPageSize());
        log.info("  - Soft Delete Enabled: {}", properties.getEntity().isSoftDeleteEnabled());
        log.info("  - Validation Enabled: {}", properties.getValidation().isEnabled());
    }
}
