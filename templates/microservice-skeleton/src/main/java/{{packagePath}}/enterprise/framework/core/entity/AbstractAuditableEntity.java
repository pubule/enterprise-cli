/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Abstract base entity providing audit fields and optimistic locking.
 * All enterprise entities should extend this class to automatically
 * get audit trail capabilities.
 *
 * <p>Provides:</p>
 * <ul>
 *   <li>Primary key with auto-generation</li>
 *   <li>Audit fields (createdBy, createdAt, updatedBy, updatedAt)</li>
 *   <li>Optimistic locking with @Version</li>
 *   <li>Automatic population of audit fields via JPA lifecycle hooks</li>
 * </ul>
 *
 * @param <ID> the type of the entity identifier
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AbstractAuditableEntity<ID> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * The primary key of the entity.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private ID id;

    /**
     * The username of the user who created this entity.
     */
    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;

    /**
     * The timestamp when this entity was created.
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * The username of the user who last updated this entity.
     */
    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * The timestamp when this entity was last updated.
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Version field for optimistic locking.
     * Automatically incremented by JPA on each update to prevent
     * concurrent modification conflicts.
     */
    @Version
    @Column(name = "version")
    private Long version;

    /**
     * JPA lifecycle callback executed before persisting the entity.
     * Automatically sets creation audit fields.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.createdBy = getCurrentUsername();
    }

    /**
     * JPA lifecycle callback executed before updating the entity.
     * Automatically updates modification audit fields.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = getCurrentUsername();
    }

    /**
     * Gets the current authenticated username from Spring Security context.
     * Falls back to "system" if no authentication is present.
     *
     * @return the current username or "system"
     */
    protected String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // Fallback to system if security context not available
        }
        return "system";
    }

    // Getters and Setters

    public ID getId() {
        return id;
    }

    public void setId(ID id) {
        this.id = id;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    // equals, hashCode, toString

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AbstractAuditableEntity<?> that = (AbstractAuditableEntity<?>) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "id=" + id +
                ", createdBy='" + createdBy + '\'' +
                ", createdAt=" + createdAt +
                ", updatedBy='" + updatedBy + '\'' +
                ", updatedAt=" + updatedAt +
                ", version=" + version +
                '}';
    }
}
