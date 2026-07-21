package com.trainreservation.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservationScheduler {

    private final ReservationService reservationService;

    public ReservationScheduler(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Scheduled(fixedRate = 60000)
    public void checkExpiredPendingReservations() {
        reservationService.expirePendingConfirmations();
    }

    @Scheduled(fixedRate = 60000)
    public void cleanExpiredWaitingReservations() {
        reservationService.deleteExpiredWaitingReservations();
    }
}