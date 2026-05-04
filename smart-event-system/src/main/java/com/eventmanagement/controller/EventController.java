package com.eventmanagement.controller;

import com.eventmanagement.dto.request.EventRequest;
import com.eventmanagement.dto.response.EventResponse;
import com.eventmanagement.model.EventStatus;
import com.eventmanagement.service.EventService;
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
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        EventResponse response = eventService.createEvent(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        EventResponse response = eventService.updateEvent(id, request, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteEvent(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        eventService.deleteEvent(id, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        EventResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents(Authentication authentication) {
        String email = authentication.getName();
        List<EventResponse> events = eventService.getEventsByOrganizer(email);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EventResponse>> getEventsByStatus(@PathVariable EventStatus status) {
        List<EventResponse> events = eventService.getEventsByStatus(status);
        return ResponseEntity.ok(events);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEventStatus(
            @PathVariable Long id,
            @RequestParam EventStatus status,
            Authentication authentication) {
        String email = authentication.getName();
        EventResponse response = eventService.updateEventStatus(id, status, email);
        return ResponseEntity.ok(response);
    }
}
