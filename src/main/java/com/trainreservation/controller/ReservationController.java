package com.trainreservation.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.trainreservation.entity.Reservation;
import com.trainreservation.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return reservationService.createReservation(reservation);
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/user/{userId}")
    public List<Reservation> getReservationsByUserId(@PathVariable Long userId) {
        return reservationService.getReservationsByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public String cancelReservation(@PathVariable Long id) {
        return reservationService.cancelReservation(id);
    }

    @PutMapping("/{id}/confirm-waiting")
    public String confirmWaitingReservation(@PathVariable Long id) {
        return reservationService.confirmWaitingReservation(id);
    }

    @PutMapping("/{id}/reject-waiting")
    public String rejectWaitingReservation(@PathVariable Long id) {
        return reservationService.rejectWaitingReservation(id);
    }

    @GetMapping("/waiting-list-details")
    public List<Map<String, Object>> getWaitingListDetails() {
        return reservationService.getWaitingListDetails();
    }
    
}