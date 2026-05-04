package com.eventmanagement.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    private String description;

    @NotNull(message = "Start date and time is required")
    @FutureOrPresent(message = "Start date must be in the future or present")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date and time is required")
    private LocalDateTime endDateTime;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @NotNull(message = "Maximum participants is required")
    @Min(value = 1, message = "Maximum participants must be at least 1")
    private Integer maxParticipants;
    
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;
}
