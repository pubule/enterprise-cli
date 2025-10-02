/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.service;

import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.repository.{{domainTitleCase}}Repository;
import {{packageName}}.validation.{{domainTitleCase}}Validator;
import {{packageName}}.enterprise.framework.exception.BusinessException;
import {{packageName}}.enterprise.framework.exception.ResourceNotFoundException;
import {{packageName}}.enterprise.framework.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Service Tests for {{domainTitleCase}}Service
 *
 * Tests business logic, validation, and error handling.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("{{domainTitleCase}} Service Tests")
class {{domainTitleCase}}ServiceTest {

    @Mock
    private {{domainTitleCase}}Repository {{domain}}Repository;

    @Mock
    private {{domainTitleCase}}Validator validator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private {{domainTitleCase}}Service {{domain}}Service;

    private {{domainTitleCase}} sample{{domainTitleCase}};

    @BeforeEach
    void setUp() {
        sample{{domainTitleCase}} = new {{domainTitleCase}}();
        sample{{domainTitleCase}}.setId(1L);
        sample{{domainTitleCase}}.setName("Sample {{domainTitleCase}}");
        sample{{domainTitleCase}}.setDescription("Sample description");
        sample{{domainTitleCase}}.setStatus("ACTIVE");
    }

    // ═══════════════════════════════════════════════════════
    // CREATE TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("Should create {{domain}} successfully")
    void testCreate_Success() {
        // Given
        when({{domain}}Repository.save(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}});

        // When
        {{domainTitleCase}} created = {{domain}}Service.create(sample{{domainTitleCase}});

        // Then
        assertThat(created).isNotNull();
        assertThat(created.getName()).isEqualTo("Sample {{domainTitleCase}}");
        verify({{domain}}Repository, times(1)).save(any({{domainTitleCase}}.class));
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    // ═══════════════════════════════════════════════════════
    // READ TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("Should find {{domain}} by ID")
    void testFindById_Success() {
        // Given
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));

        // When
        {{domainTitleCase}} found = {{domain}}Service.findById(1L);

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(1L);
        assertThat(found.getName()).isEqualTo("Sample {{domainTitleCase}}");
        verify({{domain}}Repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when {{domain}} not found")
    void testFindById_NotFound() {
        // Given
        when({{domain}}Repository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> {{domain}}Service.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("{{domainTitleCase}}")
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Should find all {{domain}}s with pagination")
    void testFindAll_Paginated() {
        // Given
        List<{{domainTitleCase}}> {{domain}}List = Arrays.asList(sample{{domainTitleCase}}, new {{domainTitleCase}}());
        Page<{{domainTitleCase}}> {{domain}}Page = new PageImpl<>({{domain}}List);
        Pageable pageable = PageRequest.of(0, 20);

        when({{domain}}Repository.findAll(pageable)).thenReturn({{domain}}Page);

        // When
        Page<{{domainTitleCase}}> result = {{domain}}Service.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        verify({{domain}}Repository, times(1)).findAll(pageable);
    }

    // ═══════════════════════════════════════════════════════
    // UPDATE TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("Should update {{domain}} successfully")
    void testUpdate_Success() {
        // Given
        {{domainTitleCase}} updated = new {{domainTitleCase}}();
        updated.setName("Updated Name");
        updated.setDescription("Updated description");
        updated.setStatus("INACTIVE");

        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));
        when({{domain}}Repository.save(any({{domainTitleCase}}.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        {{domainTitleCase}} result = {{domain}}Service.update(1L, updated);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Name");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        verify({{domain}}Repository, times(1)).save(any({{domainTitleCase}}.class));
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    // ═══════════════════════════════════════════════════════
    // DELETE TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("Should soft delete {{domain}}")
    void testDelete_SoftDelete() {
        // Given
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));
        when({{domain}}Repository.save(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}});

        // When
        {{domain}}Service.delete(1L);

        // Then
        verify({{domain}}Repository, times(1)).save(any({{domainTitleCase}}.class));
        verify(eventPublisher, times(1)).publishEvent(any());
    }

    // ═══════════════════════════════════════════════════════
    // CUSTOM BUSINESS METHOD TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("Should activate {{domain}}")
    void testActivate_Success() {
        // Given
        sample{{domainTitleCase}}.setStatus("INACTIVE");
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));
        when({{domain}}Repository.save(any({{domainTitleCase}}.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        {{domainTitleCase}} activated = {{domain}}Service.activate(1L);

        // Then
        assertThat(activated).isNotNull();
        assertThat(activated.getStatus()).isEqualTo("ACTIVE");
        assertThat(activated.isActive()).isTrue();
        verify({{domain}}Repository, times(1)).save(any({{domainTitleCase}}.class));
    }

    @Test
    @DisplayName("Should throw exception when activating already active {{domain}}")
    void testActivate_AlreadyActive() {
        // Given
        sample{{domainTitleCase}}.setStatus("ACTIVE");
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));

        // When/Then
        assertThatThrownBy(() -> {{domain}}Service.activate(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already active");
    }

    @Test
    @DisplayName("Should deactivate {{domain}}")
    void testDeactivate_Success() {
        // Given
        sample{{domainTitleCase}}.setStatus("ACTIVE");
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));
        when({{domain}}Repository.save(any({{domainTitleCase}}.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        {{domainTitleCase}} deactivated = {{domain}}Service.deactivate(1L);

        // Then
        assertThat(deactivated).isNotNull();
        assertThat(deactivated.getStatus()).isEqualTo("INACTIVE");
        assertThat(deactivated.isInactive()).isTrue();
        verify({{domain}}Repository, times(1)).save(any({{domainTitleCase}}.class));
    }

    @Test
    @DisplayName("Should throw exception when deactivating already inactive {{domain}}")
    void testDeactivate_AlreadyInactive() {
        // Given
        sample{{domainTitleCase}}.setStatus("INACTIVE");
        when({{domain}}Repository.findById(1L)).thenReturn(Optional.of(sample{{domainTitleCase}}));

        // When/Then
        assertThatThrownBy(() -> {{domain}}Service.deactivate(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already inactive");
    }

    @Test
    @DisplayName("Should find {{domain}} by name")
    void testFindByName_Success() {
        // Given
        when({{domain}}Repository.findByName("Sample {{domainTitleCase}}")).thenReturn(Optional.of(sample{{domainTitleCase}}));

        // When
        {{domainTitleCase}} found = {{domain}}Service.findByName("Sample {{domainTitleCase}}");

        // Then
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("Sample {{domainTitleCase}}");
    }

    @Test
    @DisplayName("Should throw exception when {{domain}} not found by name")
    void testFindByName_NotFound() {
        // Given
        when({{domain}}Repository.findByName("Nonexistent")).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> {{domain}}Service.findByName("Nonexistent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("{{domainTitleCase}}")
                .hasMessageContaining("name");
    }

    @Test
    @DisplayName("Should find {{domain}}s by status")
    void testFindByStatus_Success() {
        // Given
        List<{{domainTitleCase}}> activeList = Arrays.asList(sample{{domainTitleCase}}, new {{domainTitleCase}}());
        when({{domain}}Repository.findByStatusAndDeletedFalse("ACTIVE")).thenReturn(activeList);

        // When
        List<{{domainTitleCase}}> result = {{domain}}Service.findByStatus("ACTIVE");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should count {{domain}}s by status")
    void testCountByStatus_Success() {
        // Given
        when({{domain}}Repository.countByStatusAndDeletedFalse("ACTIVE")).thenReturn(5L);

        // When
        long count = {{domain}}Service.countByStatus("ACTIVE");

        // Then
        assertThat(count).isEqualTo(5L);
    }
}
