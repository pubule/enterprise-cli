/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.entity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

/**
 * Interface for entities that support soft deletion.
 * Soft delete marks records as deleted without actually removing them
 * from the database, allowing for data recovery and audit trails.
 *
 * <p>Implementing entities should:</p>
 * <ul>
 *   <li>Add @Where(clause = "deleted = false") at class level to exclude deleted records</li>
 *   <li>Store deleted flag, timestamp, and user who performed the deletion</li>
 *   <li>Use softDelete() method instead of repository.delete()</li>
 * </ul>
 *
 * <p>Example usage:</p>
 * <pre>
 * {@code
 * @Entity
 * @Where(clause = "deleted = false")
 * public class User extends AbstractAuditableEntity<Long> implements SoftDeletable {
 *     @Column(name = "deleted")
 *     private boolean deleted = false;
 *
 *     @Column(name = "deleted_at")
 *     private LocalDateTime deletedAt;
 *
 *     @Column(name = "deleted_by")
 *     private String deletedBy;
 *
 *     // Getters and setters
 * }
 * }
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface SoftDeletable {

    /**
     * Checks if the entity is marked as deleted.
     *
     * @return true if the entity is soft deleted, false otherwise
     */
    boolean isDeleted();

    /**
     * Sets the deleted flag.
     *
     * @param deleted true to mark as deleted, false to mark as active
     */
    void setDeleted(boolean deleted);

    /**
     * Gets the timestamp when the entity was deleted.
     *
     * @return the deletion timestamp, or null if not deleted
     */
    LocalDateTime getDeletedAt();

    /**
     * Sets the timestamp when the entity was deleted.
     *
     * @param deletedAt the deletion timestamp
     */
    void setDeletedAt(LocalDateTime deletedAt);

    /**
     * Gets the username of the user who deleted this entity.
     *
     * @return the username, or null if not deleted
     */
    String getDeletedBy();

    /**
     * Sets the username of the user who deleted this entity.
     *
     * @param deletedBy the username
     */
    void setDeletedBy(String deletedBy);

    /**
     * Performs a soft delete operation on this entity.
     * Sets the deleted flag to true and records the deletion timestamp
     * and the user who performed the deletion.
     *
     * <p>This is a default method that automatically populates all
     * soft delete fields. Override if custom behavior is needed.</p>
     */
    default void softDelete() {
        setDeleted(true);
        setDeletedAt(LocalDateTime.now());
        setDeletedBy(getCurrentUsername());
    }

    /**
     * Restores a soft-deleted entity.
     * Sets the deleted flag to false and clears the deletion metadata.
     *
     * <p>This allows recovery of accidentally deleted records.</p>
     */
    default void restore() {
        setDeleted(false);
        setDeletedAt(null);
        setDeletedBy(null);
    }

    /**
     * Gets the current authenticated username from Spring Security context.
     * Falls back to "system" if no authentication is present.
     *
     * @return the current username or "system"
     */
    default String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                if (!"anonymousUser".equals(username)) {
                    return username;
                }
            }
        } catch (Exception e) {
            // Fallback to system if security context not available
        }
        return "system";
    }
}
