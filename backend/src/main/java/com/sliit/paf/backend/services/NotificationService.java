package com.sliit.paf.backend.services;

import com.sliit.paf.backend.dto.NotificationDTO;
import com.sliit.paf.backend.models.Notification;
import com.sliit.paf.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Called by other services (Booking, Incident) to create notifications
    public void createNotification(String userId, String type, String title,
                                   String message, String referenceId, String referenceType) {
        Notification notification = new Notification(userId, type, title, message, referenceId, referenceType);
        notificationRepository.save(notification);
    }

    // Convenience overloads for common notification types
    public void notifyBookingApproved(String userId, String bookingId, String resourceName) {
        createNotification(userId, "BOOKING_APPROVED",
                "Booking Approved",
                "Your booking for " + resourceName + " has been approved.",
                bookingId, "BOOKING");
    }

    public void notifyBookingRejected(String userId, String bookingId, String resourceName, String reason) {
        createNotification(userId, "BOOKING_REJECTED",
                "Booking Rejected",
                "Your booking for " + resourceName + " was rejected. Reason: " + reason,
                bookingId, "BOOKING");
    }

    public void notifyTicketStatusChanged(String userId, String ticketId, String newStatus) {
        createNotification(userId, "TICKET_STATUS_CHANGED",
                "Ticket Status Updated",
                "Your incident ticket status has changed to: " + newStatus,
                ticketId, "TICKET");
    }

    public void notifyNewComment(String userId, String ticketId) {
        createNotification(userId, "NEW_COMMENT",
                "New Comment on Your Ticket",
                "Someone added a comment to your incident ticket.",
                ticketId, "TICKET");
    }

    public List<NotificationDTO> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public NotificationDTO markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        notificationRepository.delete(notification);
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getReferenceId(), n.getReferenceType(), n.isRead(), n.getCreatedAt()
        );
    }
}