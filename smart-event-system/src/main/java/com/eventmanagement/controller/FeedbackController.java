package com.eventmanagement.controller;

import com.eventmanagement.dto.request.FeedbackRequest;
import com.eventmanagement.dto.response.FeedbackResponse;
import com.eventmanagement.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        FeedbackResponse response = feedbackService.submitFeedback(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksByEvent(@PathVariable Long eventId) {
        List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByEvent(eventId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/my-feedbacks")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedbacks(Authentication authentication) {
        String email = authentication.getName();
        List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByUser(email);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/event/{eventId}/average-rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable Long eventId) {
        Double avgRating = feedbackService.getAverageRating(eventId);
        Map<String, Double> response = new HashMap<>();
        response.put("averageRating", avgRating);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        feedbackService.deleteFeedback(id, email);
        return ResponseEntity.ok().build();
    }
}
