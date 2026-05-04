package com.eventmanagement.service;

import com.eventmanagement.dto.request.RegistrationRequest;
import com.eventmanagement.dto.response.RegistrationResponse;
import com.eventmanagement.exception.BadRequestException;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
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
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public RegistrationResponse registerForEvent(RegistrationRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (registrationRepository.existsByUserIdAndEventId(user.getId(), request.getEventId())) {
            throw new BadRequestException("You are already registered for this event");
        }

        Integer confirmedCount = registrationRepository.countByEventIdAndStatus(
                request.getEventId(), RegistrationStatus.CONFIRMED);

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setParticipantName(request.getParticipantName());
        registration.setParticipantClass(request.getParticipantClass());
        registration.setParticipantDept(request.getParticipantDept());
        registration.setParticipantMobile(request.getParticipantMobile());
        registration.setParticipantEmail(request.getParticipantEmail());

        if (confirmedCount >= event.getMaxParticipants()) {
            registration.setStatus(RegistrationStatus.WAITLISTED);
        } else {
            registration.setStatus(RegistrationStatus.CONFIRMED);
        }

        Registration savedRegistration = registrationRepository.save(registration);
        return mapToResponse(savedRegistration);
    }

    public void cancelRegistration(Long registrationId, String email) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!registration.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to cancel this registration");
        }

        registrationRepository.delete(registration);

        // Promote waitlisted user if available
        promoteWaitlistedUser(registration.getEvent().getId());
    }

    public RegistrationResponse markAttendance(Long registrationId, String organizerEmail) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!registration.getEvent().getOrganizer().getId().equals(organizer.getId())) {
            throw new BadRequestException("You are not authorized to mark attendance for this event");
        }

        registration.setAttended(true);
        registration.setCheckInTime(LocalDateTime.now());
        Registration updatedRegistration = registrationRepository.save(registration);
        return mapToResponse(updatedRegistration);
    }

    public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RegistrationResponse> getRegistrationsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return registrationRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RegistrationResponse getRegistrationById(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        return mapToResponse(registration);
    }

    private void promoteWaitlistedUser(Long eventId) {
        List<Registration> waitlisted = registrationRepository.findByEventId(eventId).stream()
                .filter(r -> r.getStatus() == RegistrationStatus.WAITLISTED)
                .collect(Collectors.toList());

        if (!waitlisted.isEmpty()) {
            Registration toPromote = waitlisted.get(0);
            toPromote.setStatus(RegistrationStatus.CONFIRMED);
            registrationRepository.save(toPromote);
        }
    }

    private RegistrationResponse mapToResponse(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getUser().getId(),
                registration.getUser().getFirstName() + " " + registration.getUser().getLastName(),
                registration.getEvent().getId(),
                registration.getEvent().getTitle(),
                registration.getRegistrationDate(),
                registration.getStatus(),
                registration.getAttended(),
                registration.getCheckInTime()
        );
    }
}
