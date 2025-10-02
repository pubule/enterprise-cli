/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.annotation;

import org.springframework.core.annotation.AliasFor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.annotation.*;

/**
 * Meta-annotation combining @Service and @Transactional for enterprise services.
 * Reduces boilerplate by applying common service layer annotations.
 *
 * <p>This annotation is equivalent to:
 * <pre>
 * &#64;Service
 * &#64;Transactional
 * </pre>
 *
 * <p>Example usage:
 * <pre>
 * &#64;EnterpriseService
 * public class ProductService extends AbstractEnterpriseService&lt;Product, Long&gt; {
 *
 *     public ProductService(
 *         ProductRepository repository,
 *         BusinessValidator&lt;Product&gt; validator,
 *         ApplicationEventPublisher eventPublisher
 *     ) {
 *         super(repository, validator, eventPublisher);
 *     }
 *
 *     &#64;Override
 *     protected void mergeForUpdate(Product existing, Product updates) {
 *         existing.setName(updates.getName());
 *         existing.setPrice(updates.getPrice());
 *     }
 *
 *     &#64;Override
 *     protected String getEntityName() {
 *         return "Product";
 *     }
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
@Service
@Transactional
public @interface EnterpriseService {

    /**
     * The value may indicate a suggestion for a logical component name.
     * Alias for {@link Service#value()}.
     *
     * @return the suggested component name
     */
    @AliasFor(annotation = Service.class)
    String value() default "";

    /**
     * Whether read-only transactions should be used by default.
     * Default is false (read-write transactions).
     *
     * @return true for read-only transactions
     */
    boolean readOnly() default false;
}
