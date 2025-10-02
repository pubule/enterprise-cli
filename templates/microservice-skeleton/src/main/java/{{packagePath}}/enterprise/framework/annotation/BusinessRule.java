/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.annotation;

import org.springframework.stereotype.Component;

import java.lang.annotation.*;

/**
 * Annotation for business rule classes and methods.
 * Marks a class or method as implementing a business rule with metadata.
 *
 * <p>When applied to a class, it should implement the
 * {@code BusinessRule<T>} interface.
 *
 * <p>Example usage:
 * <pre>
 * &#64;BusinessRule(
 *     name = "product-price-validation",
 *     priority = 10,
 *     description = "Validates that product price is within allowed range"
 * )
 * public class ProductPriceRule implements BusinessRule&lt;Product&gt; {
 *
 *     private static final BigDecimal MIN_PRICE = BigDecimal.valueOf(0.01);
 *     private static final BigDecimal MAX_PRICE = BigDecimal.valueOf(100000);
 *
 *     &#64;Override
 *     public String getRuleName() {
 *         return "product-price-validation";
 *     }
 *
 *     &#64;Override
 *     public RuleResult evaluate(Product product, RuleContext context) {
 *         BigDecimal price = product.getPrice();
 *
 *         if (price == null) {
 *             return RuleResult.fail(
 *                 getRuleName(),
 *                 "Price is required",
 *                 RuleResult.RuleSeverity.ERROR
 *             );
 *         }
 *
 *         if (price.compareTo(MIN_PRICE) &lt; 0) {
 *             return RuleResult.fail(
 *                 getRuleName(),
 *                 "Price must be at least " + MIN_PRICE,
 *                 RuleResult.RuleSeverity.ERROR
 *             );
 *         }
 *
 *         if (price.compareTo(MAX_PRICE) &gt; 0) {
 *             return RuleResult.fail(
 *                 getRuleName(),
 *                 "Price must not exceed " + MAX_PRICE,
 *                 RuleResult.RuleSeverity.ERROR
 *             );
 *         }
 *
 *         return RuleResult.pass(getRuleName());
 *     }
 *
 *     &#64;Override
 *     public int getPriority() {
 *         return 10;
 *     }
 *
 *     &#64;Override
 *     public boolean applies(Product product, RuleContext context) {
 *         return true; // Always apply this rule
 *     }
 * }
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface BusinessRule {

    /**
     * The unique name of the business rule.
     * Should be descriptive and use kebab-case convention.
     *
     * @return the rule name
     */
    String name();

    /**
     * The priority of this rule (lower number = higher priority).
     * Rules are executed in priority order.
     * Default is 100 (medium priority).
     *
     * @return the priority
     */
    int priority() default 100;

    /**
     * A human-readable description of what this rule validates.
     *
     * @return the rule description
     */
    String description() default "";

    /**
     * The entity types this rule applies to.
     * If empty, the rule must explicitly check entity types.
     *
     * @return the applicable entity types
     */
    Class<?>[] appliesTo() default {};

    /**
     * Whether this rule is enabled by default.
     * Default is true.
     *
     * @return true if enabled
     */
    boolean enabled() default true;

    /**
     * Tags for categorizing rules (e.g., "financial", "security", "data-quality").
     *
     * @return the rule tags
     */
    String[] tags() default {};
}
