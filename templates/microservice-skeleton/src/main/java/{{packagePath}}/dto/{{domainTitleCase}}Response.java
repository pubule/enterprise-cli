/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * {{domainTitleCase}} Response DTO
 *
 * <p>Used for GET operations and responses.
 * Contains all entity fields including audit information.
 *
 * <p><strong>Includes:</strong>
 * <ul>
 *   <li>Business fields (name, description, status)</li>
 *   <li>Audit fields (createdBy, createdAt, updatedBy, updatedAt)</li>
 *   <li>Soft delete information (deleted, deletedAt, deletedBy)</li>
 *   <li>Version for optimistic locking</li>
 * </ul>
 *
 * <p><strong>Example JSON:</strong>
 * <pre>
 * {
 *   "id": 1,
 *   "name": "Sample {{domainTitleCase}}",
 *   "description": "This is a sample {{domain}}",
 *   "status": "ACTIVE",
 *   "createdBy": "admin",
 *   "createdAt": "2024-01-15T10:30:00",
 *   "updatedBy": "admin",
 *   "updatedAt": "2024-01-15T11:00:00",
 *   "version": 1,
 *   "deleted": false,
 *   "deletedAt": null,
 *   "deletedBy": null
 * }
 * </pre>
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@Data
public class {{domainTitleCase}}Response {

    // ═══════════════════════════════════════════════════════
    // PRIMARY KEY
    // ═══════════════════════════════════════════════════════

    /**
     * Unique identifier.
     */
    private Long id;

    // ═══════════════════════════════════════════════════════
    // BUSINESS FIELDS
    // ═══════════════════════════════════════════════════════

    /**
     * Name of the {{domain}}.
     */
    private String name;

    /**
     * Description of the {{domain}}.
     */
    private String description;

    /**
     * Status of the {{domain}}.
     * Values: ACTIVE, INACTIVE, PENDING
     */
    private String status;

    // ═══════════════════════════════════════════════════════
    // AUDIT FIELDS (from AbstractAuditableEntity)
    // ═══════════════════════════════════════════════════════

    /**
     * Username of the user who created this {{domain}}.
     */
    private String createdBy;

    /**
     * Timestamp when this {{domain}} was created.
     */
    private LocalDateTime createdAt;

    /**
     * Username of the user who last updated this {{domain}}.
     */
    private String updatedBy;

    /**
     * Timestamp when this {{domain}} was last updated.
     */
    private LocalDateTime updatedAt;

    /**
     * Version number for optimistic locking.
     */
    private Long version;

    // ═══════════════════════════════════════════════════════
    // SOFT DELETE FIELDS (from SoftDeletable)
    // ═══════════════════════════════════════════════════════

    /**
     * Whether this {{domain}} is soft deleted.
     */
    private boolean deleted;

    /**
     * Timestamp when this {{domain}} was deleted.
     * Null if not deleted.
     */
    private LocalDateTime deletedAt;

    /**
     * Username of the user who deleted this {{domain}}.
     * Null if not deleted.
     */
    private String deletedBy;
}
