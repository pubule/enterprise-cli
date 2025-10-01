/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.dto;

/**
 * Interface for mapping between entities and DTOs.
 *
 * @param <ENTITY> the entity type
 * @param <REQUEST> the request DTO type
 * @param <RESPONSE> the response DTO type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface EntityMapper<ENTITY, REQUEST, RESPONSE> {

    /**
     * Converts a request DTO to an entity.
     *
     * @param request the request DTO
     * @return the entity
     */
    ENTITY toEntity(REQUEST request);

    /**
     * Converts an entity to a response DTO.
     *
     * @param entity the entity
     * @return the response DTO
     */
    RESPONSE toResponse(ENTITY entity);

    /**
     * Updates an existing entity from a request DTO.
     *
     * @param entity the entity to update
     * @param request the request DTO
     */
    void updateEntity(ENTITY entity, REQUEST request);
}
