/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.entity;

/**
 * Interface for entities that support multi-tenancy.
 * Multi-tenant architecture allows a single application instance
 * to serve multiple tenants (customers, organizations) while keeping
 * their data logically separated.
 *
 * <p>Implementing entities should:</p>
 * <ul>
 *   <li>Store a tenant identifier to segregate data</li>
 *   <li>Apply tenant filters in queries to ensure data isolation</li>
 *   <li>Use Hibernate @Filter or custom repository methods for automatic filtering</li>
 * </ul>
 *
 * <p>Example usage:</p>
 * <pre>
 * {@code
 * @Entity
 * @FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
 * @Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
 * public class Order extends AbstractAuditableEntity<Long> implements TenantAware {
 *     @Column(name = "tenant_id", nullable = false)
 *     private String tenantId;
 *
 *     @Override
 *     public String getTenantId() {
 *         return tenantId;
 *     }
 *
 *     @Override
 *     public void setTenantId(String tenantId) {
 *         this.tenantId = tenantId;
 *     }
 * }
 * }
 * </pre>
 *
 * <p>Best practices:</p>
 * <ul>
 *   <li>Always validate tenant ID before operations</li>
 *   <li>Index the tenant_id column for query performance</li>
 *   <li>Consider using UUID or external tenant identifiers</li>
 *   <li>Implement tenant context holder for thread-safe tenant tracking</li>
 * </ul>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface TenantAware {

    /**
     * Gets the tenant identifier for this entity.
     * The tenant ID is used to segregate data between different tenants
     * in a multi-tenant application.
     *
     * @return the tenant identifier, never null for tenant-aware entities
     */
    String getTenantId();

    /**
     * Sets the tenant identifier for this entity.
     * Should be set when creating new entities and must not be changed
     * after persistence to maintain data integrity.
     *
     * @param tenantId the tenant identifier to set, must not be null
     * @throws IllegalArgumentException if tenantId is null or empty
     */
    void setTenantId(String tenantId);
}
