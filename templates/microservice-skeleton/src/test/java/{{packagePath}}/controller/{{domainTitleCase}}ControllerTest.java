/*
 * Copyright (c) {{year}} {{packageName}}
 * All rights reserved.
 */
package {{packageName}}.controller;

import {{packageName}}.dto.{{domainTitleCase}}Request;
import {{packageName}}.dto.{{domainTitleCase}}Response;
import {{packageName}}.entity.{{domainTitleCase}};
import {{packageName}}.mapper.{{domainTitleCase}}Mapper;
import {{packageName}}.service.{{domainTitleCase}}Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Controller Integration Tests for {{domainTitleCase}}Controller
 *
 * Tests REST endpoints, request/response mapping, and HTTP status codes.
 *
 * @author Enterprise CLI
 * @version {{frameworkVersion}}
 */
@WebMvcTest({{domainTitleCase}}Controller.class)
@DisplayName("{{domainTitleCase}} Controller Tests")
class {{domainTitleCase}}ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private {{domainTitleCase}}Service {{domain}}Service;

    @MockBean
    private {{domainTitleCase}}Mapper mapper;

    private {{domainTitleCase}} sample{{domainTitleCase}};
    private {{domainTitleCase}}Request sample{{domainTitleCase}}Request;
    private {{domainTitleCase}}Response sample{{domainTitleCase}}Response;

    @BeforeEach
    void setUp() {
        // Setup entity
        sample{{domainTitleCase}} = new {{domainTitleCase}}();
        sample{{domainTitleCase}}.setId(1L);
        sample{{domainTitleCase}}.setName("Sample {{domainTitleCase}}");
        sample{{domainTitleCase}}.setDescription("Sample description");
        sample{{domainTitleCase}}.setStatus("ACTIVE");

        // Setup request DTO
        sample{{domainTitleCase}}Request = new {{domainTitleCase}}Request();
        sample{{domainTitleCase}}Request.setName("Sample {{domainTitleCase}}");
        sample{{domainTitleCase}}Request.setDescription("Sample description");
        sample{{domainTitleCase}}Request.setStatus("ACTIVE");

        // Setup response DTO
        sample{{domainTitleCase}}Response = new {{domainTitleCase}}Response();
        sample{{domainTitleCase}}Response.setId(1L);
        sample{{domainTitleCase}}Response.setName("Sample {{domainTitleCase}}");
        sample{{domainTitleCase}}Response.setDescription("Sample description");
        sample{{domainTitleCase}}Response.setStatus("ACTIVE");
    }

    // ═══════════════════════════════════════════════════════
    // CREATE ENDPOINT TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("POST /api/v1/{{domain}}s - Should create {{domain}}")
    void testCreate_Success() throws Exception {
        // Given
        when(mapper.toEntity(any({{domainTitleCase}}Request.class))).thenReturn(sample{{domainTitleCase}});
        when({{domain}}Service.create(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}});
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(post("/api/v1/{{domain}}s")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sample{{domainTitleCase}}Request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Sample {{domainTitleCase}}"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        verify({{domain}}Service, times(1)).create(any({{domainTitleCase}}.class));
    }

    @Test
    @DisplayName("POST /api/v1/{{domain}}s - Should fail with invalid request")
    void testCreate_InvalidRequest() throws Exception {
        // Given - Request with missing required field
        {{domainTitleCase}}Request invalidRequest = new {{domainTitleCase}}Request();
        invalidRequest.setName(""); // Empty name (invalid)

        // When/Then
        mockMvc.perform(post("/api/v1/{{domain}}s")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    // ═══════════════════════════════════════════════════════
    // READ ENDPOINT TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("GET /api/v1/{{domain}}s/{id} - Should return {{domain}} by ID")
    void testGetById_Success() throws Exception {
        // Given
        when({{domain}}Service.findById(1L)).thenReturn(sample{{domainTitleCase}});
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(get("/api/v1/{{domain}}s/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Sample {{domainTitleCase}}"));

        verify({{domain}}Service, times(1)).findById(1L);
    }

    @Test
    @DisplayName("GET /api/v1/{{domain}}s - Should return paginated list")
    void testGetAll_Paginated() throws Exception {
        // Given
        List<{{domainTitleCase}}> {{domain}}List = Arrays.asList(sample{{domainTitleCase}}, new {{domainTitleCase}}());
        Page<{{domainTitleCase}}> {{domain}}Page = new PageImpl<>({{domain}}List, PageRequest.of(0, 20), 2);

        when({{domain}}Service.findAll(any(PageRequest.class))).thenReturn({{domain}}Page);
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(get("/api/v1/{{domain}}s")
                        .param("page", "0")
                        .param("size", "20")
                        .param("sortBy", "id")
                        .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.pageNumber").value(0));

        verify({{domain}}Service, times(1)).findAll(any(PageRequest.class));
    }

    // ═══════════════════════════════════════════════════════
    // UPDATE ENDPOINT TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("PUT /api/v1/{{domain}}s/{id} - Should update {{domain}}")
    void testUpdate_Success() throws Exception {
        // Given
        when(mapper.toEntity(any({{domainTitleCase}}Request.class))).thenReturn(sample{{domainTitleCase}});
        when({{domain}}Service.update(eq(1L), any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}});
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(put("/api/v1/{{domain}}s/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sample{{domainTitleCase}}Request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Sample {{domainTitleCase}}"));

        verify({{domain}}Service, times(1)).update(eq(1L), any({{domainTitleCase}}.class));
    }

    // ═══════════════════════════════════════════════════════
    // DELETE ENDPOINT TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("DELETE /api/v1/{{domain}}s/{id} - Should delete {{domain}}")
    void testDelete_Success() throws Exception {
        // Given
        doNothing().when({{domain}}Service).delete(1L);

        // When/Then
        mockMvc.perform(delete("/api/v1/{{domain}}s/1"))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify({{domain}}Service, times(1)).delete(1L);
    }

    // ═══════════════════════════════════════════════════════
    // CUSTOM ENDPOINT TESTS
    // ═══════════════════════════════════════════════════════

    @Test
    @DisplayName("POST /api/v1/{{domain}}s/{id}/activate - Should activate {{domain}}")
    void testActivate_Success() throws Exception {
        // Given
        when({{domain}}Service.activate(1L)).thenReturn(sample{{domainTitleCase}});
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(post("/api/v1/{{domain}}s/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        verify({{domain}}Service, times(1)).activate(1L);
    }

    @Test
    @DisplayName("POST /api/v1/{{domain}}s/{id}/deactivate - Should deactivate {{domain}}")
    void testDeactivate_Success() throws Exception {
        // Given
        sample{{domainTitleCase}}Response.setStatus("INACTIVE");
        when({{domain}}Service.deactivate(1L)).thenReturn(sample{{domainTitleCase}});
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(post("/api/v1/{{domain}}s/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));

        verify({{domain}}Service, times(1)).deactivate(1L);
    }

    @Test
    @DisplayName("GET /api/v1/{{domain}}s/by-status/{status} - Should find by status")
    void testFindByStatus_Success() throws Exception {
        // Given
        List<{{domainTitleCase}}> activeList = Arrays.asList(sample{{domainTitleCase}}, new {{domainTitleCase}}());
        when({{domain}}Service.findByStatus("ACTIVE")).thenReturn(activeList);
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(get("/api/v1/{{domain}}s/by-status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(2)));

        verify({{domain}}Service, times(1)).findByStatus("ACTIVE");
    }

    @Test
    @DisplayName("GET /api/v1/{{domain}}s/search-by-name - Should search by name pattern")
    void testSearchByName_Success() throws Exception {
        // Given
        List<{{domainTitleCase}}> searchResults = Arrays.asList(sample{{domainTitleCase}});
        when({{domain}}Service.searchByName("Sample")).thenReturn(searchResults);
        when(mapper.toResponse(any({{domainTitleCase}}.class))).thenReturn(sample{{domainTitleCase}}Response);

        // When/Then
        mockMvc.perform(get("/api/v1/{{domain}}s/search-by-name")
                        .param("pattern", "Sample"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Sample {{domainTitleCase}}"));

        verify({{domain}}Service, times(1)).searchByName("Sample");
    }

    @Test
    @DisplayName("GET /api/v1/{{domain}}s/count-by-status/{status} - Should count by status")
    void testCountByStatus_Success() throws Exception {
        // Given
        when({{domain}}Service.countByStatus("ACTIVE")).thenReturn(5L);

        // When/Then
        mockMvc.perform(get("/api/v1/{{domain}}s/count-by-status/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(5));

        verify({{domain}}Service, times(1)).countByStatus("ACTIVE");
    }
}
