/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.dto;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Interface for mapping between entities and DTOs.
 * Provides bidirectional conversion between entity and DTO representations.
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
     * Converts a list of entities to a list of response DTOs.
     * Default implementation uses stream mapping.
     *
     * @param entities the list of entities
     * @return the list of response DTOs
     */
    default List<RESPONSE> toResponseList(List<ENTITY> entities) {
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing entity from a request DTO.
     * Used for partial updates (PATCH operations).
     *
     * @param entity the entity to update
     * @param request the request DTO with updated values
     */
    void updateEntity(ENTITY entity, REQUEST request);
}
