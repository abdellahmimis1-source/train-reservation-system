package com.trainreservation.repository;

import com.trainreservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    void deleteByTrainId(Long trainId);

    Optional<Reservation> findFirstByTrainIdAndStatusOrderByIdAsc(Long trainId, String status);

    List<Reservation> findByTrainIdAndStatus(Long trainId, String status);

    List<Reservation> findByStatusAndPendingConfirmationAtBefore(
            String status,
            LocalDateTime dateTime
    );

    List<Reservation> findByStatusOrderByIdAsc(String status);

    List<Reservation> findByTrainIdAndStatusIn(Long trainId, List<String> statuses);
}