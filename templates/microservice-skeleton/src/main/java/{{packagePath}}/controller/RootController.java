package {{packageName}}.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Root Controller for basic service operations
 *
 * This controller handles the root path and provides basic service information.
 */
@RestController
@RequestMapping("/")
@Tag(name = "Service", description = "Basic service operations")
public class RootController {

    /**
     * Root endpoint - provides service information
     */
    @GetMapping
    @Operation(summary = "Service information", description = "Returns basic information about the {{domainTitleCase}} service")
    public ResponseEntity<ServiceInfo> getServiceInfo() {
        ServiceInfo info = new ServiceInfo();
        info.setServiceName("{{domainTitleCase}} Service");
        info.setVersion("1.0.0");
        info.setDescription("Enterprise microservice for {{domain}} management");
        info.setSwaggerUrl("/swagger-ui/index.html");
        info.setHealthUrl("/actuator/health");
        info.setApiUrl("/{{domain}}s");
        return ResponseEntity.ok(info);
    }

    /**
     * Service information DTO
     */
    public static class ServiceInfo {
        private String serviceName;
        private String version;
        private String description;
        private String swaggerUrl;
        private String healthUrl;
        private String apiUrl;

        // Getters and Setters
        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSwaggerUrl() {
            return swaggerUrl;
        }

        public void setSwaggerUrl(String swaggerUrl) {
            this.swaggerUrl = swaggerUrl;
        }

        public String getHealthUrl() {
            return healthUrl;
        }

        public void setHealthUrl(String healthUrl) {
            this.healthUrl = healthUrl;
        }

        public String getApiUrl() {
            return apiUrl;
        }

        public void setApiUrl(String apiUrl) {
            this.apiUrl = apiUrl;
        }
    }
}