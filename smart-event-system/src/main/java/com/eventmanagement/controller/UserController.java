package com.eventmanagement.controller;

import com.eventmanagement.dto.response.MessageResponse;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", userDetails.getId());
        response.put("email", userDetails.getEmail());
        response.put("firstName", userDetails.getFirstName());
        response.put("lastName", userDetails.getLastName());
        response.put("roles", userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> userList = users.stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("phone", user.getPhone());
            userMap.put("roles", user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toList()));
            return userMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(userList);
    }

    @GetMapping("/organizer/{id}")
    public ResponseEntity<?> getOrganizerById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFirstName() + " " + user.getLastName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("phone", user.getPhone());
        response.put("roles", user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList()));
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getUserCount() {
        long count = userRepository.count();
        Map<String, Long> response = new HashMap<>();
        response.put("totalUsers", count);
        return ResponseEntity.ok(response);
    }
}
