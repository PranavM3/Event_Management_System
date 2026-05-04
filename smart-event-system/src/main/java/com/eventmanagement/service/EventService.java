package com.eventmanagement.service;

import com.eventmanagement.dto.request.EventRequest;
import com.eventmanagement.dto.response.EventResponse;
import com.eventmanagement.exception.BadRequestException;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.EventStatus;
import com.eventmanagement.model.RegistrationStatus;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public EventResponse createEvent(EventRequest request, String email) {
        User organizer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getEndDateTime().isBefore(request.getStartDateTime())) {
            throw new BadRequestException("End date must be after start date");
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDateTime(request.getStartDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setCategory(request.getCategory());
        event.setOrganizer(organizer);
        event.setStatus(EventStatus.UPCOMING);
        event.setCreatedAt(LocalDateTime.now());

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    public EventResponse updateEvent(Long eventId, EventRequest request, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Allow admins to edit any event, organizers can only edit their own
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"));
        if (!isAdmin && !event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to update this event");
        }

        if (request.getEndDateTime().isBefore(request.getStartDateTime())) {
            throw new BadRequestException("End date must be after start date");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDateTime(request.getStartDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setCategory(request.getCategory());
        event.setUpdatedAt(LocalDateTime.now());

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    public void deleteEvent(Long eventId, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Allow admins to delete any event, organizers can only delete their own
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"));
        if (!isAdmin && !event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this event");
        }

        eventRepository.delete(event);
    }

    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return mapToResponse(event);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateTimeDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByOrganizer(String email) {
        User organizer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return eventRepository.findByOrganizerId(organizer.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByStatus(EventStatus status) {
        return eventRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse updateEventStatus(Long eventId, EventStatus status, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Allow admins to update status of any event, organizers can only update their own
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"));
        if (!isAdmin && !event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to update this event");
        }

        event.setStatus(status);
        event.setUpdatedAt(LocalDateTime.now());
        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    private EventResponse mapToResponse(Event event) {
        Integer currentParticipants = registrationRepository.countByEventIdAndStatus(
                event.getId(), RegistrationStatus.CONFIRMED);

        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getLocation(),
                event.getMaxParticipants(),
                currentParticipants,
                event.getCategory(),
                event.getStatus(),
                event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName(),
                event.getOrganizer().getId(),
                event.getCreatedAt()
        );
    }
}
