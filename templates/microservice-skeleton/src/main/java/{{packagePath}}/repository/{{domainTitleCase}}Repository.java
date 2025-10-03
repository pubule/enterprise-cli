/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.repository;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.enterprise.framework.constants.FrameworkConstants.EntityStatus;
import {{packageName}}.enterprise.framework.constants.FrameworkConstants.QueryParams;
import {{packageName}}.enterprise.framework.core.repository.AbstractEnterpriseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * {{domainTitleCase}} Repository
 *
 * <p>Extends AbstractEnterpriseRepository for comprehensive CRUD operations.
 *
 * <p><strong>Available methods from framework (no need to implement):</strong>
 * <ul>
 *   <li>{@code findAll()} - Get all entities</li>
 *   <li>{@code findAll(Pageable)} - Get paginated entities</li>
 *   <li>{@code findById(ID)} - Find by ID</li>
 *   <li>{@code save(T)} - Create or update entity</li>
 *   <li>{@code delete(T)} - Delete entity</li>
 *   <li>{@code deleteById(ID)} - Delete by ID</li>
 *   <li>{@code count()} - Count all entities</li>
 *   <li>{@code existsById(ID)} - Check existence</li>
 *   <li>{@code findAllActive()} - Find all non-deleted entities</li>
 *   <li>{@code findAllActive(Pageable)} - Paginated non-deleted entities</li>
 *   <li>{@code findByIdActive(ID)} - Find non-deleted by ID</li>
 *   <li>{@code findWithCriteria(Specification, Pageable)} - Dynamic search</li>
 *   <li>{@code findByCreatedBy(String)} - Find by creator</li>
 * </ul>
 *
 * <p><strong>Add only custom business queries below!</strong>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@Repository
public interface {{domainTitleCase}}Repository extends AbstractEnterpriseRepository<{{domainTitleCase}}, Long> {

    // ═══════════════════════════════════════════════════════
    // CUSTOM BUSINESS QUERIES
    // Add domain-specific query methods here
    // ═══════════════════════════════════════════════════════

    /**
     * Find {{domain}} by name (case-sensitive).
     *
     * @param name the {{domain}} name
     * @return optional {{domain}}
     */
    Optional<{{domainTitleCase}}> findByName(String name);

    /**
     * Find {{domain}} by name ignoring case.
     *
     * @param name the {{domain}} name
     * @return optional {{domain}}
     */
    Optional<{{domainTitleCase}}> findByNameIgnoreCase(String name);

    /**
     * Find all active (non-deleted) {{domain}}s by status.
     *
     * @param status the status to filter by
     * @return list of {{domain}}s with given status
     */
    List<{{domainTitleCase}}> findByStatusAndDeletedFalse(String status);

    /**
     * Check if {{domain}} with given name exists.
     *
     * @param name the {{domain}} name
     * @return true if exists
     */
    boolean existsByName(String name);

    /**
     * Check if {{domain}} with given name exists (excluding specific ID).
     * Useful for uniqueness validation during updates.
     *
     * @param name the {{domain}} name
     * @param id   the ID to exclude
     * @return true if exists
     */
    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * Find all {{domain}}s with name containing the given substring (case-insensitive).
     *
     * @param namePattern the search pattern
     * @return list of matching {{domain}}s
     */
    @Query("SELECT t FROM {{domainTitleCase}} t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :namePattern, '%')) AND t.deleted = false")
    List<{{domainTitleCase}}> searchByName(@Param(QueryParams.NAME_PATTERN) String namePattern);

    /**
     * Count {{domain}}s by status.
     *
     * @param status the status
     * @return count of {{domain}}s with given status
     */
    long countByStatusAndDeletedFalse(String status);

    /**
     * Find all active {{domain}}s (non-deleted, status = ACTIVE).
     * Uses EntityStatus.ACTIVE constant.
     *
     * @return list of active {{domain}}s ordered by creation date descending
     */
    @Query("SELECT t FROM {{domainTitleCase}} t WHERE t.status = :status AND t.deleted = false ORDER BY t.createdAt DESC")
    List<{{domainTitleCase}}> findByStatusOrderByCreatedAtDesc(@Param(QueryParams.STATUS) String status);

    /**
     * Find all active {{domain}}s (convenience method using EntityStatus.ACTIVE).
     *
     * @return list of active {{domain}}s
     */
    default List<{{domainTitleCase}}> findAllActive() {
        return findByStatusOrderByCreatedAtDesc(EntityStatus.ACTIVE);
    }
}
