package com.eventmanagement.controller;

import com.eventmanagement.dto.request.RegistrationRequest;
import com.eventmanagement.dto.response.RegistrationResponse;
import com.eventmanagement.exception.BadRequestException;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private EventRepository eventRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> registerForEvent(
            @Valid @RequestBody RegistrationRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        RegistrationResponse response = registrationService.registerForEvent(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelRegistration(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        registrationService.cancelRegistration(id, email);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/attendance")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> markAttendance(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        RegistrationResponse response = registrationService.markAttendance(id, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByEvent(@PathVariable Long eventId, Authentication authentication) {
        String email = authentication.getName();
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!event.getOrganizer().getEmail().equals(email) && !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You are not authorized to view registrations for this event");
        }
        List<RegistrationResponse> registrations = registrationService.getRegistrationsByEvent(eventId);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations(Authentication authentication) {
        String email = authentication.getName();
        List<RegistrationResponse> registrations = registrationService.getRegistrationsByUser(email);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistrationResponse> getRegistrationById(@PathVariable Long id) {
        RegistrationResponse response = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(response);
    }
}
