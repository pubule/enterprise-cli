/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.annotation;

import org.springframework.core.annotation.AliasFor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.annotation.*;

/**
 * Meta-annotation for enterprise REST controllers.
 * Combines @RestController with common controller configurations.
 *
 * <p>This annotation is equivalent to:
 * <pre>
 * &#64;RestController
 * &#64;RequestMapping
 * </pre>
 *
 * <p>Example usage:
 * <pre>
 * &#64;EnterpriseController("/api/v1/products")
 * public class ProductController extends AbstractEnterpriseController&lt;
 *         Product, Long, ProductRequest, ProductResponse&gt; {
 *
 *     private final ProductService productService;
 *
 *     public ProductController(
 *         ProductService productService,
 *         ProductMapper mapper
 *     ) {
 *         super(productService, mapper);
 *         this.productService = productService;
 *     }
 *
 *     &#64;Override
 *     protected Specification&lt;Product&gt; buildSpecification(Map&lt;String, String&gt; criteria) {
 *         SpecificationBuilder&lt;Product&gt; builder = new SpecificationBuilder&lt;&gt;();
 *
 *         if (criteria.containsKey("name")) {
 *             builder.withLike("name", criteria.get("name"));
 *         }
 *         if (criteria.containsKey("category")) {
 *             builder.withEqual("category", criteria.get("category"));
 *         }
 *
 *         return builder.build();
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
@RestController
@RequestMapping
public @interface EnterpriseController {

    /**
     * The base path for all endpoints in this controller.
     * Alias for {@link RequestMapping#value()}.
     *
     * @return the base request mapping path
     */
    @AliasFor(annotation = RequestMapping.class, attribute = "value")
    String[] value() default {};

    /**
     * Alternative to {@link #value()}.
     * Alias for {@link RequestMapping#path()}.
     *
     * @return the base request mapping path
     */
    @AliasFor(annotation = RequestMapping.class, attribute = "path")
    String[] path() default {};

    /**
     * The media types this controller produces.
     * Default is "application/json".
     *
     * @return the produces media types
     */
    @AliasFor(annotation = RequestMapping.class, attribute = "produces")
    String[] produces() default {"application/json"};

    /**
     * The media types this controller consumes.
     * Default is "application/json".
     *
     * @return the consumes media types
     */
    @AliasFor(annotation = RequestMapping.class, attribute = "consumes")
    String[] consumes() default {"application/json"};
}
