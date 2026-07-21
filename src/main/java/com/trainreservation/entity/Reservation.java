package com.trainreservation.entity;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime pendingConfirmationAt;
    private Long userId;
    private Long trainId;

    private int numberOfSeats;
    private String status;

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getTrainId() {
        return trainId;
    }

    public int getNumberOfSeats() {
        return numberOfSeats;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setTrainId(Long trainId) {
        this.trainId = trainId;
    }

    public void setNumberOfSeats(int numberOfSeats) {
        this.numberOfSeats = numberOfSeats;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getPendingConfirmationAt() {
        return pendingConfirmationAt;
    }

    public void setPendingConfirmationAt(LocalDateTime pendingConfirmationAt) {
        this.pendingConfirmationAt = pendingConfirmationAt;
    }
}