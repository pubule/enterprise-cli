/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.validation;

/**
 * Result of a business rule evaluation.
 * Contains rule name, pass/fail status, message, and severity.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class RuleResult {

    /**
     * Severity level of rule violations.
     */
    public enum RuleSeverity {
        /** Informational message */
        INFO,
        /** Warning that should be addressed */
        WARNING,
        /** Error that prevents operation */
        ERROR,
        /** Critical error requiring immediate attention */
        CRITICAL
    }

    private final String ruleName;
    private final boolean passed;
    private final String message;
    private final RuleSeverity severity;

    private RuleResult(String ruleName, boolean passed, String message, RuleSeverity severity) {
        this.ruleName = ruleName;
        this.passed = passed;
        this.message = message;
        this.severity = severity;
    }

    /**
     * Creates a passing rule result.
     *
     * @param ruleName the rule name
     * @return passing rule result
     */
    public static RuleResult pass(String ruleName) {
        return new RuleResult(ruleName, true, null, RuleSeverity.INFO);
    }

    /**
     * Creates a passing rule result with message.
     *
     * @param ruleName the rule name
     * @param message informational message
     * @return passing rule result
     */
    public static RuleResult pass(String ruleName, String message) {
        return new RuleResult(ruleName, true, message, RuleSeverity.INFO);
    }

    /**
     * Creates a failing rule result.
     *
     * @param ruleName the rule name
     * @param message the failure message
     * @param severity the severity level
     * @return failing rule result
     */
    public static RuleResult fail(String ruleName, String message, RuleSeverity severity) {
        return new RuleResult(ruleName, false, message, severity);
    }

    /**
     * Creates a failing rule result with ERROR severity.
     *
     * @param ruleName the rule name
     * @param message the failure message
     * @return failing rule result with ERROR severity
     */
    public static RuleResult fail(String ruleName, String message) {
        return new RuleResult(ruleName, false, message, RuleSeverity.ERROR);
    }

    /**
     * Creates a warning rule result.
     *
     * @param ruleName the rule name
     * @param message the warning message
     * @return warning rule result
     */
    public static RuleResult warning(String ruleName, String message) {
        return new RuleResult(ruleName, true, message, RuleSeverity.WARNING);
    }

    /**
     * Creates a critical failure rule result.
     *
     * @param ruleName the rule name
     * @param message the failure message
     * @return critical failure rule result
     */
    public static RuleResult critical(String ruleName, String message) {
        return new RuleResult(ruleName, false, message, RuleSeverity.CRITICAL);
    }

    // Getters

    public String getRuleName() {
        return ruleName;
    }

    public boolean isPassed() {
        return passed;
    }

    public boolean isFailed() {
        return !passed;
    }

    public String getMessage() {
        return message;
    }

    public RuleSeverity getSeverity() {
        return severity;
    }

    public boolean isCritical() {
        return severity == RuleSeverity.CRITICAL;
    }

    public boolean isError() {
        return severity == RuleSeverity.ERROR;
    }

    public boolean isWarning() {
        return severity == RuleSeverity.WARNING;
    }

    public boolean isInfo() {
        return severity == RuleSeverity.INFO;
    }

    @Override
    public String toString() {
        return String.format("RuleResult{rule='%s', passed=%s, severity=%s, message='%s'}",
                ruleName, passed, severity, message);
    }
}
