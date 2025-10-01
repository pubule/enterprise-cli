/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.repository;

import {{packageName}}.enterprise.framework.core.entity.AbstractAuditableEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Base repository interface for enterprise entities.
 * Provides common data access operations with support for:
 * <ul>
 *   <li>Soft delete filtering</li>
 *   <li>Audit trail queries</li>
 *   <li>Dynamic specifications</li>
 *   <li>Pagination and sorting</li>
 * </ul>
 *
 * <p>All entity repositories should extend this interface to inherit
 * standard CRUD operations and enterprise features.</p>
 *
 * <p>Example:</p>
 * <pre>
 * {@code
 * @Repository
 * public interface UserRepository extends AbstractEnterpriseRepository<User, Long> {
 *     Optional<User> findByEmail(String email);
 * }
 * }
 * </pre>
 *
 * @param <T> the entity type extending AbstractAuditableEntity
 * @param <ID> the type of the entity identifier
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@NoRepositoryBean
public interface AbstractEnterpriseRepository<T extends AbstractAuditableEntity<ID>, ID>
        extends JpaRepository<T, ID>, JpaSpecificationExecutor<T> {

    /**
     * Finds all entities, optionally including soft-deleted ones.
     *
     * @param includeDeleted if true, includes soft-deleted entities; if false, only active entities
     * @return list of entities
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(:includeDeleted = true OR " +
           "(TREAT(e AS {{packageName}}.enterprise.framework.core.entity.SoftDeletable).deleted = false OR " +
           "TYPE(e) NOT IN ({{packageName}}.enterprise.framework.core.entity.SoftDeletable)))")
    List<T> findAllActive(@Param("includeDeleted") boolean includeDeleted);

    /**
     * Finds an entity by ID, optionally including soft-deleted ones.
     *
     * @param id the entity ID
     * @param includeDeleted if true, includes soft-deleted entities
     * @return Optional containing the entity if found
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND " +
           "(:includeDeleted = true OR " +
           "(TREAT(e AS {{packageName}}.enterprise.framework.core.entity.SoftDeletable).deleted = false OR " +
           "TYPE(e) NOT IN ({{packageName}}.enterprise.framework.core.entity.SoftDeletable)))")
    Optional<T> findByIdActive(@Param("id") ID id, @Param("includeDeleted") boolean includeDeleted);

    /**
     * Performs a soft delete on an entity by ID.
     * Only works if the entity implements SoftDeletable interface.
     *
     * @param id the entity ID to soft delete
     */
    @Modifying
    @Query("UPDATE #{#entityName} e " +
           "SET TREAT(e AS {{packageName}}.enterprise.framework.core.entity.SoftDeletable).deleted = true, " +
           "TREAT(e AS {{packageName}}.enterprise.framework.core.entity.SoftDeletable).deletedAt = CURRENT_TIMESTAMP " +
           "WHERE e.id = :id")
    void softDelete(@Param("id") ID id);

    /**
     * Finds all entities created by a specific user.
     *
     * @param username the username who created the entities
     * @return list of entities created by the user
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdBy = :username")
    List<T> findByCreatedBy(@Param("username") String username);

    /**
     * Finds all entities created within a date range.
     *
     * @param start the start of the date range
     * @param end the end of the date range
     * @return list of entities created in the range
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdAt BETWEEN :start AND :end")
    List<T> findCreatedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Finds all entities updated by a specific user.
     *
     * @param username the username who updated the entities
     * @return list of entities updated by the user
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.updatedBy = :username")
    List<T> findByUpdatedBy(@Param("username") String username);

    /**
     * Finds entities using dynamic criteria (Specification pattern).
     * This method provides flexibility for complex queries.
     *
     * @param spec the specification defining the query criteria
     * @param pageable pagination information
     * @return page of entities matching the criteria
     */
    default Page<T> findWithCriteria(Specification<T> spec, Pageable pageable) {
        return findAll(spec, pageable);
    }

    /**
     * Counts all active (non-deleted) entities.
     *
     * @return the count of active entities
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE " +
           "(TREAT(e AS {{packageName}}.enterprise.framework.core.entity.SoftDeletable).deleted = false OR " +
           "TYPE(e) NOT IN ({{packageName}}.enterprise.framework.core.entity.SoftDeletable)))")
    long countActive();
}
