/*
 * Copyright (c) {{year}} Enterprise CLI
 * All rights reserved.
 */
package {{packageName}}.enterprise.framework.core.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface defining CRUD service operations.
 *
 * @param <T> the entity type
 * @param <ID> the entity ID type
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 * @since 1.0.0
 */
public interface CrudService<T, ID> {

    /**
     * Creates a new entity.
     *
     * @param entity the entity to create
     * @return the created entity
     */
    T create(T entity);

    /**
     * Updates an existing entity.
     *
     * @param id the entity ID
     * @param entity the updated entity data
     * @return the updated entity
     */
    T update(ID id, T entity);

    /**
     * Finds an entity by ID.
     *
     * @param id the entity ID
     * @return the entity
     */
    T findById(ID id);

    /**
     * Finds all entities with pagination.
     *
     * @param pageable pagination information
     * @return page of entities
     */
    Page<T> findAll(Pageable pageable);

    /**
     * Deletes an entity by ID.
     *
     * @param id the entity ID
     */
    void delete(ID id);
}
