/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Builder for creating dynamic JPA Specifications.
 * Provides a fluent API for constructing complex queries programmatically.
 *
 * <p>Supports operations:</p>
 * <ul>
 *   <li>Equality (=)</li>
 *   <li>Like (LIKE %value%)</li>
 *   <li>Greater than (&gt;)</li>
 *   <li>Less than (&lt;)</li>
 *   <li>Greater than or equal (&gt;=)</li>
 *   <li>Less than or equal (&lt;=)</li>
 *   <li>Between (value BETWEEN start AND end)</li>
 *   <li>In (value IN (list))</li>
 * </ul>
 *
 * <p>Example usage:</p>
 * <pre>
 * {@code
 * Specification<User> spec = new SpecificationBuilder<User>()
 *     .with("firstName", "like", "John")
 *     .with("age", ">=", 18)
 *     .with("status", "=", UserStatus.ACTIVE)
 *     .build();
 *
 * Page<User> users = userRepository.findAll(spec, pageable);
 * }
 * </pre>
 *
 * @param <T> the entity type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public class SpecificationBuilder<T> {

    private final List<Specification<T>> specifications = new ArrayList<>();

    /**
     * Adds a criterion to the specification.
     *
     * @param field the entity field name
     * @param operation the comparison operation (=, like, >, <, >=, <=, between, in)
     * @param value the value to compare against
     * @return this builder for method chaining
     * @throws IllegalArgumentException if operation is unknown
     */
    public SpecificationBuilder<T> with(String field, String operation, Object value) {
        if (field == null || operation == null || value == null) {
            return this;
        }

        specifications.add((root, query, cb) -> createPredicate(root, cb, field, operation, value));
        return this;
    }

    /**
     * Adds a criterion with multiple values (for IN operation).
     *
     * @param field the entity field name
     * @param operation the comparison operation (should be "in")
     * @param values the list of values
     * @return this builder for method chaining
     */
    public SpecificationBuilder<T> withIn(String field, String operation, List<?> values) {
        if (field == null || values == null || values.isEmpty()) {
            return this;
        }

        specifications.add((root, query, cb) -> root.get(field).in(values));
        return this;
    }

    /**
     * Adds a BETWEEN criterion for date/time ranges.
     *
     * @param field the entity field name
     * @param start the start value
     * @param end the end value
     * @return this builder for method chaining
     */
    public SpecificationBuilder<T> withBetween(String field, Comparable start, Comparable end) {
        if (field == null || start == null || end == null) {
            return this;
        }

        specifications.add((root, query, cb) -> cb.between(root.get(field), start, end));
        return this;
    }

    /**
     * Adds a null check criterion.
     *
     * @param field the entity field name
     * @param isNull true to check IS NULL, false to check IS NOT NULL
     * @return this builder for method chaining
     */
    public SpecificationBuilder<T> withNull(String field, boolean isNull) {
        if (field == null) {
            return this;
        }

        specifications.add((root, query, cb) ->
                isNull ? cb.isNull(root.get(field)) : cb.isNotNull(root.get(field)));
        return this;
    }

    /**
     * Builds the final Specification by combining all added criteria with AND.
     *
     * @return the combined Specification, or null if no criteria were added
     */
    public Specification<T> build() {
        if (specifications.isEmpty()) {
            return null;
        }

        return specifications.stream().reduce(Specification::and).orElse(null);
    }

    /**
     * Builds the final Specification by combining all added criteria with OR.
     *
     * @return the combined Specification, or null if no criteria were added
     */
    public Specification<T> buildOr() {
        if (specifications.isEmpty()) {
            return null;
        }

        return specifications.stream().reduce(Specification::or).orElse(null);
    }

    /**
     * Creates a predicate based on the operation.
     *
     * @param root the root entity
     * @param cb the criteria builder
     * @param field the field name
     * @param operation the operation
     * @param value the value
     * @return the predicate
     */
    @SuppressWarnings("unchecked")
    private Predicate createPredicate(Root<T> root, CriteriaBuilder cb, String field, String operation, Object value) {
        switch (operation.toLowerCase()) {
            case "=":
            case "eq":
                return cb.equal(root.get(field), value);

            case "!=":
            case "ne":
                return cb.notEqual(root.get(field), value);

            case "like":
                return cb.like(cb.lower(root.get(field)), "%" + value.toString().toLowerCase() + "%");

            case "startswith":
                return cb.like(cb.lower(root.get(field)), value.toString().toLowerCase() + "%");

            case "endswith":
                return cb.like(cb.lower(root.get(field)), "%" + value.toString().toLowerCase());

            case ">":
            case "gt":
                return cb.greaterThan(root.get(field), (Comparable) value);

            case "<":
            case "lt":
                return cb.lessThan(root.get(field), (Comparable) value);

            case ">=":
            case "gte":
                return cb.greaterThanOrEqualTo(root.get(field), (Comparable) value);

            case "<=":
            case "lte":
                return cb.lessThanOrEqualTo(root.get(field), (Comparable) value);

            default:
                throw new IllegalArgumentException("Unknown operation: " + operation);
        }
    }
}
