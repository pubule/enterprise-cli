/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}};

import {{packageName}}.enterprise.framework.EnterpriseFramework;
import {{packageName}}.enterprise.framework.config.EnterpriseFrameworkAutoConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Import;
import org.springframework.context.event.EventListener;

/**
 * {{domainTitleCase}} Microservice Application
 * Built with Enterprise Framework v{{frameworkVersion}}
 *
 * <p>This application provides a complete RESTful API for {{domain}} management
 * with enterprise-grade features:
 * <ul>
 *   <li>CRUD operations with validation</li>
 *   <li>Pagination and dynamic search</li>
 *   <li>Audit logging (createdBy, createdAt, etc.)</li>
 *   <li>Soft delete support</li>
 *   <li>Event-driven architecture</li>
 *   <li>Standardized error handling</li>
 *   <li>Business rules validation</li>
 * </ul>
 *
 * @author Enterprise CLI
 * @version 1.0.0
 */
@SpringBootApplication
@Import(EnterpriseFrameworkAutoConfiguration.class)
public class {{domainTitleCase}}Application {

    private static final Logger log = LoggerFactory.getLogger({{domainTitleCase}}Application.class);

    public static void main(String[] args) {
        SpringApplication.run({{domainTitleCase}}Application.class, args);
    }

    /**
     * Application ready event handler.
     * Prints framework information and confirms successful startup.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        EnterpriseFramework.printInfo();

        log.info("╔════════════════════════════════════════════════════════════════╗");
        log.info("║  {{domainTitleCase}} Microservice Started Successfully!                    ║");
        log.info("║                                                                ║");
        log.info("║  API Documentation: http://localhost:8080/swagger-ui.html     ║");
        log.info("║  Health Check:      http://localhost:8080/actuator/health     ║");
        log.info("║  Metrics:           http://localhost:8080/actuator/metrics    ║");
        log.info("╚════════════════════════════════════════════════════════════════╝");
    }
}
