package com.sliit.paf.backend.controllers;

import com.sliit.paf.backend.dto.NotificationDTO;
import com.sliit.paf.backend.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * NotificationController — Member 4
 *
 * GET    /api/notifications              → Get all notifications for logged-in user
 * GET    /api/notifications/unread       → Get only unread notifications
 * GET    /api/notifications/count        → Get unread count (badge)
 * PATCH  /api/notifications/{id}/read   → Mark a single notification as read
 * PATCH  /api/notifications/read-all    → Mark all notifications as read
 * DELETE /api/notifications/{id}        → Delete a notification
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(notificationService.getUserNotifications(email));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(email));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        String email = principal.getName();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable String id,
            Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(notificationService.markAsRead(id, email));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable String id,
            Principal principal) {
        notificationService.deleteNotification(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}