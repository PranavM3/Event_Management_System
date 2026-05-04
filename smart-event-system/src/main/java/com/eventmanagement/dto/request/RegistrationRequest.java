package com.eventmanagement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    // Optional participant details
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String participantName;
    
    @Size(max = 50, message = "Class must not exceed 50 characters")
    private String participantClass;
    
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String participantDept;
    
    @Size(max = 15, message = "Mobile number must not exceed 15 characters")
    private String participantMobile;
    
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String participantEmail;
}
