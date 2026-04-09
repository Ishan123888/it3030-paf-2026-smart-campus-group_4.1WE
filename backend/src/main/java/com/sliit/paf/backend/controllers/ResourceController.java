package com.sliit.paf.backend.controllers;

import com.sliit.paf.backend.dto.ResourceDTO;
import com.sliit.paf.backend.models.Resource;
import com.sliit.paf.backend.services.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Resource Controller — Member 1
 *
 * GET    /api/resources              → list all (with filters) — PUBLIC
 * GET    /api/resources/{id}         → get one resource        — PUBLIC
 * GET    /api/resources/types        → list all resource types — PUBLIC
 * POST   /api/resources              → create resource         — ADMIN
 * PUT    /api/resources/{id}         → update resource         — ADMIN
 * PATCH  /api/resources/{id}/status  → toggle ACTIVE/OUT_OF_SERVICE — ADMIN
 * DELETE /api/resources/{id}         → delete resource         — ADMIN
 */
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // ── GET /api/resources ─────────────────────────────────────────────────────
    // Supports query params: type, brand, location, minCapacity, status, search
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        List<ResourceDTO> resources = resourceService.getResources(
                type, brand, location, minCapacity, status, search);
        return ResponseEntity.ok(resources);
    }

    // ── GET /api/resources/types ───────────────────────────────────────────────
    @GetMapping("/types")
    public ResponseEntity<List<String>> getResourceTypes() {
        List<String> types = Arrays.stream(Resource.ResourceType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(types);
    }

    // ── GET /api/resources/{id} ────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // ── POST /api/resources ────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO dto) {
        ResourceDTO created = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── PUT /api/resources/{id} ────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // ── PATCH /api/resources/{id}/status ──────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> toggleStatus(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.toggleStatus(id));
    }

    // ── DELETE /api/resources/{id} ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }
}
