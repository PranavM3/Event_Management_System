package com.eventmanagement.dto.response;

import com.eventmanagement.model.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime registrationDate;
    private RegistrationStatus status;
    private Boolean attended;
    private LocalDateTime checkInTime;
}
