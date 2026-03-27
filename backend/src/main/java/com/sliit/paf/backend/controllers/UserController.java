package com.sliit.paf.backend.controllers;

import com.sliit.paf.backend.dto.UserDTO;
import com.sliit.paf.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ FIXED: Handled Null Principal to prevent 500 Error
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Principal principal) {
        if (principal == null) {
            // Return a safe response for unauthenticated users
            return ResponseEntity.ok().body(Map.of(
                "authenticated", false,
                "name", "Guest User",
                "roles", List.of("ROLE_GUEST")
            ));
        }
        
        UserDTO user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateRoles(
            @PathVariable String id,
            @RequestBody Map<String, Set<String>> body) {
        Set<String> roles = body.get("roles");
        if (roles == null || roles.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.updateUserRoles(id, roles));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(userService.toggleUserActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}