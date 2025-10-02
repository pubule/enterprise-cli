/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Interface for business rules.
 * Business rules are evaluated during entity operations to enforce domain logic.
 * Rules can have priorities - lower numbers execute first.
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface BusinessRule<T> {

    /**
     * Gets the rule name for identification and logging.
     *
     * @return the rule name
     */
    String getRuleName();

    /**
     * Evaluates the business rule against an entity.
     *
     * @param entity the entity to evaluate
     * @param context the rule context
     * @return the rule result
     */
    RuleResult evaluate(T entity, RuleContext context);

    /**
     * Gets the rule priority.
     * Lower numbers = higher priority (execute first).
     * Default priority is 100.
     *
     * @return the priority value
     */
    default int getPriority() {
        return 100;
    }

    /**
     * Checks if this rule applies to the given entity and context.
     * Default implementation returns true (always applies).
     *
     * @param entity the entity
     * @param context the rule context
     * @return true if rule should be evaluated
     */
    default boolean applies(T entity, RuleContext context) {
        return true;
    }

    /**
     * Gets the rule description for documentation.
     *
     * @return the rule description
     */
    default String getDescription() {
        return getRuleName();
    }
}
