/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.annotation;

import java.lang.annotation.*;

/**
 * Annotation for business validation methods.
 * Marks a method in a validator class as performing business validation.
 *
 * <p>Methods annotated with @BusinessValidation should have the signature:
 * <pre>
 * ValidationResult methodName(EntityType entity, ValidationContext context)
 * </pre>
 *
 * <p>Example usage:
 * <pre>
 * &#64;Component
 * public class ProductValidator implements BusinessValidator&lt;Product&gt; {
 *
 *     &#64;BusinessValidation(value = "basic-validation", groups = {"create", "update"})
 *     public ValidationResult validateBasicFields(Product product, ValidationContext context) {
 *         ValidationResult result = new ValidationResult();
 *
 *         if (product.getName() == null || product.getName().trim().isEmpty()) {
 *             result.addError("name", "Product name is required", "PRODUCT_NAME_REQUIRED");
 *         }
 *
 *         if (product.getName() != null &amp;&amp; product.getName().length() &gt; 200) {
 *             result.addError("name", "Product name must not exceed 200 characters", "PRODUCT_NAME_TOO_LONG");
 *         }
 *
 *         if (product.getPrice() == null) {
 *             result.addError("price", "Price is required", "PRODUCT_PRICE_REQUIRED");
 *         }
 *
 *         return result;
 *     }
 *
 *     &#64;BusinessValidation(value = "price-validation", groups = {"create", "update"})
 *     public ValidationResult validatePrice(Product product, ValidationContext context) {
 *         ValidationResult result = new ValidationResult();
 *
 *         if (product.getPrice() != null) {
 *             if (product.getPrice().compareTo(BigDecimal.ZERO) &lt;= 0) {
 *                 result.addError("price", "Price must be greater than zero", "PRODUCT_PRICE_INVALID");
 *             }
 *
 *             if (product.getPrice().compareTo(BigDecimal.valueOf(100000)) &gt; 0) {
 *                 result.addWarning("price", "Price is unusually high");
 *             }
 *         }
 *
 *         return result;
 *     }
 *
 *     &#64;BusinessValidation(value = "stock-validation", groups = {"create"})
 *     public ValidationResult validateStock(Product product, ValidationContext context) {
 *         ValidationResult result = new ValidationResult();
 *
 *         if (product.getStockQuantity() != null &amp;&amp; product.getStockQuantity() &lt; 0) {
 *             result.addError("stockQuantity", "Stock quantity cannot be negative", "PRODUCT_STOCK_INVALID");
 *         }
 *
 *         if (product.getStockQuantity() != null &amp;&amp; product.getStockQuantity() == 0) {
 *             result.addWarning("stockQuantity", "Product will be out of stock");
 *         }
 *
 *         return result;
 *     }
 *
 *     &#64;Override
 *     public ValidationResult validate(Product product, ValidationContext context) {
 *         ValidationResult combinedResult = new ValidationResult();
 *
 *         // Execute all validation methods based on context
 *         ValidationResult basicResult = validateBasicFields(product, context);
 *         combinedResult.merge(basicResult);
 *
 *         ValidationResult priceResult = validatePrice(product, context);
 *         combinedResult.merge(priceResult);
 *
 *         if (context.getOperationType() == ValidationContext.OperationType.CREATE) {
 *             ValidationResult stockResult = validateStock(product, context);
 *             combinedResult.merge(stockResult);
 *         }
 *
 *         return combinedResult;
 *     }
 * }
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 2.0.0
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface BusinessValidation {

    /**
     * The name of this validation method.
     * Should be descriptive (e.g., "basic-validation", "price-validation").
     *
     * @return the validation name
     */
    String value() default "";

    /**
     * The validation groups this method applies to.
     * Common groups: "create", "update", "delete".
     * If empty, applies to all operations.
     *
     * @return the validation groups
     */
    String[] groups() default {};

    /**
     * The order in which this validation should run.
     * Lower numbers run first.
     * Default is 0.
     *
     * @return the execution order
     */
    int order() default 0;

    /**
     * Whether this validation is required for the operation to proceed.
     * If true and validation fails, the operation will be rejected.
     * If false, validation failures are logged as warnings.
     * Default is true.
     *
     * @return true if required
     */
    boolean required() default true;

    /**
     * Description of what this validation method checks.
     *
     * @return the validation description
     */
    String description() default "";
}
