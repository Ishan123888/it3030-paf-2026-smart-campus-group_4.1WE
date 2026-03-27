package com.sliit.paf.backend.services;

import com.sliit.paf.backend.dto.UserDTO;
import com.sliit.paf.backend.models.User;
import com.sliit.paf.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return toDTO(user);
    }

    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUserRoles(String userId, Set<String> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Validate roles
        Set<String> validRoles = Set.of("ROLE_USER", "ROLE_ADMIN", "ROLE_TECHNICIAN", "ROLE_MANAGER");
        Set<String> sanitizedRoles = new HashSet<>(roles);
        sanitizedRoles.retainAll(validRoles);
        if (sanitizedRoles.isEmpty()) sanitizedRoles.add("ROLE_USER");

        user.setRoles(sanitizedRoles);
        return toDTO(userRepository.save(user));
    }

    public UserDTO toggleUserActive(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setActive(!user.isActive());
        return toDTO(userRepository.save(user));
    }

    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(), user.getEmail(), user.getName(),
                user.getPicture(), user.getRoles(), user.isActive()
        );
    }
}