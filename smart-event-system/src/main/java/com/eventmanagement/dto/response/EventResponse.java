package com.eventmanagement.dto.response;

import com.eventmanagement.model.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String location;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String category;
    private EventStatus status;
    private String organizerName;
    private Long organizerId;
    private LocalDateTime createdAt;
}
