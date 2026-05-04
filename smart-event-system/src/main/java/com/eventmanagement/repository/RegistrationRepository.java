package com.eventmanagement.repository;

import com.eventmanagement.model.Registration;
import com.eventmanagement.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByUserId(Long userId);
    Integer countByEventIdAndStatus(Long eventId, RegistrationStatus status);
    Boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
