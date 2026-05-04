package com.eventmanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "event_id"})
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(nullable = false)
    private Boolean attended = false;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;
    
    // Participant details
    @Column(name = "participant_name")
    private String participantName;
    
    @Column(name = "participant_class")
    private String participantClass;
    
    @Column(name = "participant_dept")
    private String participantDept;
    
    @Column(name = "participant_mobile")
    private String participantMobile;
    
    @Column(name = "participant_email")
    private String participantEmail;
}
