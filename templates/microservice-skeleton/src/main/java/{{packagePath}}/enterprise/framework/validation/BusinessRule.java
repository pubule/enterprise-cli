/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Interface for business rules.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface BusinessRule<T> {

    /**
     * Checks if this rule applies to the given entity and context.
     *
     * @param entity the entity
     * @param context the rule context
     * @return true if rule should be executed
     */
    boolean applies(T entity, RuleContext context);

    /**
     * Executes the business rule.
     *
     * @param entity the entity
     * @param context the rule context
     * @throws {{packageName}}.enterprise.framework.exception.BusinessException if rule fails
     */
    void execute(T entity, RuleContext context);
}
