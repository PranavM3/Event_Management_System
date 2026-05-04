package com.eventmanagement.repository;

import com.eventmanagement.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEventId(Long eventId);
    List<Feedback> findByUserId(Long userId);
    Optional<Feedback> findByUserIdAndEventId(Long userId, Long eventId);
    Boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.event.id = :eventId")
    Double getAverageRatingByEventId(Long eventId);
}
