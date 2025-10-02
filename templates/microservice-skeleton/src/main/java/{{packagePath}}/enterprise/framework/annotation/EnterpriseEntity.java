/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.annotation;

import java.lang.annotation.*;

/**
 * Meta-annotation for Enterprise entities.
 * Marks a class as an enterprise domain entity with configurable features.
 *
 * <p>Example usage:
 * <pre>
 * &#64;EnterpriseEntity(auditable = true, softDeletable = true)
 * &#64;Entity
 * &#64;Table(name = "products")
 * public class Product extends AbstractAuditableEntity&lt;Long&gt; {
 *     // Entity fields and methods
 * }
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface EnterpriseEntity {

    /**
     * The logical name of the entity.
     * If not specified, defaults to the simple class name.
     *
     * @return the entity name
     */
    String value() default "";

    /**
     * Whether this entity supports audit fields (createdBy, createdAt, updatedBy, updatedAt).
     * Default is true.
     *
     * @return true if auditable
     */
    boolean auditable() default true;

    /**
     * Whether this entity supports soft delete (deleted flag, deletedAt, deletedBy).
     * Default is true.
     *
     * @return true if soft deletable
     */
    boolean softDeletable() default true;

    /**
     * Whether this entity supports multi-tenancy (tenantId field).
     * Default is false.
     *
     * @return true if tenant-aware
     */
    boolean tenantAware() default false;

    /**
     * Whether this entity supports optimistic locking (version field).
     * Default is true.
     *
     * @return true if versioned
     */
    boolean versioned() default true;

    /**
     * Description of the entity for documentation purposes.
     *
     * @return the entity description
     */
    String description() default "";
}
