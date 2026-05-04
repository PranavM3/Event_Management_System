package com.eventmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
