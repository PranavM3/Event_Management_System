package com.eventmanagement.service;

import com.eventmanagement.dto.request.FeedbackRequest;
import com.eventmanagement.dto.response.FeedbackResponse;
import com.eventmanagement.exception.BadRequestException;
import com.eventmanagement.exception.ResourceNotFoundException;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Feedback;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.FeedbackRepository;
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
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    public FeedbackResponse submitFeedback(FeedbackRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Check if user is registered for the event
        registrationRepository.findByUserIdAndEventId(user.getId(), request.getEventId())
                .orElseThrow(() -> new BadRequestException("You must register for the event to submit feedback"));

        if (feedbackRepository.existsByUserIdAndEventId(user.getId(), request.getEventId())) {
            throw new BadRequestException("You have already submitted feedback for this event");
        }

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setEvent(event);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToResponse(savedFeedback);
    }

    public List<FeedbackResponse> getFeedbacksByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event not found");
        }

        return feedbackRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbacksByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return feedbackRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Double getAverageRating(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event not found");
        }

        Double avgRating = feedbackRepository.getAverageRatingByEventId(eventId);
        return avgRating != null ? avgRating : 0.0;
    }

    public void deleteFeedback(Long feedbackId, String email) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!feedback.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this feedback");
        }

        feedbackRepository.delete(feedback);
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getUser().getId(),
                feedback.getUser().getFirstName() + " " + feedback.getUser().getLastName(),
                feedback.getEvent().getId(),
                feedback.getEvent().getTitle(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
}
