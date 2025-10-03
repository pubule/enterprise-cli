/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.business;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.repository.{{domainTitleCase}}Repository;
import {{packageName}}.enterprise.framework.annotation.BusinessRule;
import {{packageName}}.enterprise.framework.constants.FrameworkConstants.EntityStatus;
import {{packageName}}.enterprise.framework.validation.RuleContext;
import {{packageName}}.enterprise.framework.validation.RuleResult;
import org.springframework.stereotype.Component;

/**
 * {{domainTitleCase}} Business Rules
 *
 * <p>Implements BusinessRule interface for complex business logic validation.
 * Business rules are evaluated AFTER basic validation passes.
 *
 * <p><strong>Priority System:</strong>
 * <ul>
 *   <li>1-10: Critical rules (executed first)</li>
 *   <li>11-50: High priority rules</li>
 *   <li>51-100: Medium priority rules (default)</li>
 *   <li>101+: Low priority rules</li>
 * </ul>
 *
 * <p><strong>Severity Levels:</strong>
 * <ul>
 *   <li>CRITICAL - Blocks operation, critical business violation</li>
 *   <li>ERROR - Blocks operation, business rule violation</li>
 *   <li>WARNING - Allows operation, but notifies user</li>
 *   <li>INFO - Informational only</li>
 * </ul>
 *
 * <p><strong>Return Types:</strong>
 * <ul>
 *   <li>{@code RuleResult.pass()} - Rule passed</li>
 *   <li>{@code RuleResult.fail()} - Rule failed (ERROR)</li>
 *   <li>{@code RuleResult.critical()} - Critical failure</li>
 *   <li>{@code RuleResult.warning()} - Warning only</li>
 * </ul>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@Component
@BusinessRule(
        name = "{{domain}}-business-rules",
        priority = 100, // Medium priority
        description = "Core business rules for {{domain}} management",
        appliesTo = {{domainTitleCase}}.class
)
public class {{domainTitleCase}}BusinessRules implements {{packageName}}.enterprise.framework.validation.BusinessRule<{{domainTitleCase}}> {

    private final {{domainTitleCase}}Repository {{domain}}Repository;

    public {{domainTitleCase}}BusinessRules({{domainTitleCase}}Repository {{domain}}Repository) {
        this.{{domain}}Repository = {{domain}}Repository;
    }

    /**
     * Returns the rule name.
     *
     * @return the rule name
     */
    @Override
    public String getRuleName() {
        return "{{domain}}-business-rules";
    }

    /**
     * Evaluates all business rules for the {{domain}}.
     *
     * @param entity  the {{domain}} entity
     * @param context the rule context (operation type, existing entity, etc.)
     * @return rule evaluation result
     */
    @Override
    public RuleResult evaluate({{domainTitleCase}} entity, RuleContext context) {
        // Rule 1: Status consistency check
        RuleResult statusCheck = checkStatusConsistency(entity, context);
        if (!statusCheck.isPassed()) {
            return statusCheck;
        }

        // Rule 2: Data quality check
        RuleResult dataQualityCheck = checkDataQuality(entity, context);
        if (!dataQualityCheck.isPassed()) {
            return dataQualityCheck;
        }

        // Rule 3: Business logic constraints
        RuleResult businessCheck = checkBusinessConstraints(entity, context);
        if (!businessCheck.isPassed()) {
            return businessCheck;
        }

        // All rules passed
        return RuleResult.pass(getRuleName());
    }

    /**
     * Returns the priority of this rule.
     * Lower number = higher priority.
     *
     * @return priority (100 = medium)
     */
    @Override
    public int getPriority() {
        return 100;
    }

    /**
     * Checks if this rule applies to the given entity and context.
     *
     * @param entity  the entity
     * @param context the context
     * @return true if rule should be evaluated
     */
    @Override
    public boolean applies({{domainTitleCase}} entity, RuleContext context) {
        // This rule applies to all {{domain}} entities
        return true;
    }

    // ═══════════════════════════════════════════════════════
    // INDIVIDUAL BUSINESS RULE CHECKS
    // ═══════════════════════════════════════════════════════

    /**
     * Rule 1: Status Consistency Check
     * Ensures status transitions are valid.
     */
    private RuleResult checkStatusConsistency({{domainTitleCase}} entity, RuleContext context) {
        String status = entity.getStatus();

        // Check if status is valid
        if (status == null) {
            return RuleResult.fail(
                    getRuleName(),
                    "Status cannot be null",
                    RuleResult.RuleSeverity.ERROR
            );
        }

        // For UPDATE operations, check status transitions
        if (context.getOperationType() == {{packageName}}.enterprise.framework.validation.ValidationContext.OperationType.UPDATE) {
            Object existingObj = context.getExistingEntity();
            if (existingObj instanceof {{domainTitleCase}}) {
                {{domainTitleCase}} existing = ({{domainTitleCase}}) existingObj;
                String oldStatus = existing.getStatus();
                String newStatus = entity.getStatus();

                // Example: Cannot go from PENDING to INACTIVE directly
                if (EntityStatus.PENDING.equals(oldStatus) && EntityStatus.INACTIVE.equals(newStatus)) {
                    return RuleResult.fail(
                            getRuleName(),
                            "Cannot transition from PENDING to INACTIVE. Must go through ACTIVE first.",
                            RuleResult.RuleSeverity.ERROR
                    );
                }
            }
        }

        return RuleResult.pass(getRuleName());
    }

    /**
     * Rule 2: Data Quality Check
     * Ensures data meets quality standards.
     */
    private RuleResult checkDataQuality({{domainTitleCase}} entity, RuleContext context) {
        String name = entity.getName();
        String description = entity.getDescription();

        // Check name quality
        if (name != null && name.matches(".*\\d{3,}.*")) {
            return RuleResult.warning(
                    getRuleName(),
                    "Name contains multiple consecutive numbers. Consider using a more descriptive name."
            );
        }

        // Check description quality
        if (description != null && description.length() < 10) {
            return RuleResult.warning(
                    getRuleName(),
                    "Description is very short. Consider providing more details."
            );
        }

        return RuleResult.pass(getRuleName());
    }

    /**
     * Rule 3: Business Constraints Check
     * Enforces complex business rules.
     */
    private RuleResult checkBusinessConstraints({{domainTitleCase}} entity, RuleContext context) {
        // Example: Cannot create more than 1000 active {{domain}}s
        if (context.getOperationType() == {{packageName}}.enterprise.framework.validation.ValidationContext.OperationType.CREATE) {
            long activeCount = {{domain}}Repository.countByStatusAndDeletedFalse(EntityStatus.ACTIVE);

            if (activeCount >= 1000) {
                return RuleResult.fail(
                        getRuleName(),
                        "Maximum number of active {{domain}}s (1000) reached. Please deactivate some before creating new ones.",
                        RuleResult.RuleSeverity.CRITICAL
                );
            }

            if (activeCount >= 900) {
                return RuleResult.warning(
                        getRuleName(),
                        "Approaching maximum number of active {{domain}}s. Currently at " + activeCount + " out of 1000."
                );
            }
        }

        // Example: Cannot delete if entity has specific status
        if (context.getOperationType() == {{packageName}}.enterprise.framework.validation.ValidationContext.OperationType.DELETE) {
            if (EntityStatus.PENDING.equals(entity.getStatus())) {
                return RuleResult.warning(
                        getRuleName(),
                        "Deleting a {{domain}} with PENDING status. Consider completing or canceling it first."
                );
            }
        }

        return RuleResult.pass(getRuleName());
    }
}
