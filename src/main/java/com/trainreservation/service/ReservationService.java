package com.trainreservation.service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trainreservation.entity.Notification;
import com.trainreservation.entity.Reservation;
import com.trainreservation.entity.Train;
import com.trainreservation.entity.User;
import com.trainreservation.repository.NotificationRepository;
import com.trainreservation.repository.ReservationRepository;
import com.trainreservation.repository.TrainRepository;
import com.trainreservation.repository.UserRepository;

import java.util.Map;
import java.util.HashMap;

@Service
public class ReservationService {

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private void sendUserNotification(User user, String subject, String message) {
        String contact = user.getNotificationContact();

        if (contact == null || contact.trim().isEmpty()) {
            contact = user.getEmail();
        }

        if (contact.contains("@")) {
            emailService.sendEmail(contact, subject, message);
        } else {
            whatsAppService.sendWhatsApp(contact, message);
        }
    }

    public Reservation createReservation(Reservation reservation) {

        Train train = trainRepository.findById(reservation.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        if (train.getAvailableSeats() >= reservation.getNumberOfSeats()) {

            train.setAvailableSeats(train.getAvailableSeats() - reservation.getNumberOfSeats());
            reservation.setStatus("CONFIRMED");
            trainRepository.save(train);

            notificationRepository.save(new Notification(
                    reservation.getUserId(),
                    "Réservation confirmée",
                    "Votre réservation pour le train " + train.getTrainNumber() + " est confirmée.",
                    "CONFIRMATION"
            ));

            User user = userRepository.findById(reservation.getUserId()).orElse(null);
            if (user != null) {
                sendUserNotification(
                        user,
                        "Train Reservation - Confirmation",
                        "Bonjour " + user.getName() + ",\n\n" +
                                "Votre réservation a été confirmée avec succès.\n" +
                                "Train : " + train.getTrainNumber() + "\n\n" +
                                "Merci d'utiliser notre plateforme.\n" +
                                "Train Reservation Team"
                );
            }

        } else {

            reservation.setStatus("WAITING");

            notificationRepository.save(new Notification(
                    reservation.getUserId(),
                    "Liste d’attente",
                    "Le train " + train.getTrainNumber() + " est complet. Vous êtes en liste d’attente.",
                    "WAITING"
            ));

            User user = userRepository.findById(reservation.getUserId()).orElse(null);
            if (user != null) {
                sendUserNotification(
                        user,
                        "Train Reservation - Liste d'attente",
                        "Bonjour " + user.getName() + ",\n\n" +
                                "Le train " + train.getTrainNumber() + " est actuellement complet.\n" +
                                "Votre demande a été placée en liste d'attente.\n\n" +
                                "Train Reservation Team"
                );
            }
        }

        return reservationRepository.save(reservation);
    }

    public String cancelReservation(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Train train = trainRepository.findById(reservation.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        if (reservation.getStatus().equals("CONFIRMED")) {
            train.setAvailableSeats(train.getAvailableSeats() + reservation.getNumberOfSeats());
            trainRepository.save(train);
        }

        reservationRepository.deleteById(reservationId);

        processWaitingListFIFO(train.getId());

        return "Reservation annulée avec succès";
    }

    public void processWaitingListFIFO(Long trainId) {

        Train train = trainRepository.findById(trainId)
                .orElseThrow(() -> new RuntimeException("Train not found"));

        Reservation waitingReservation = reservationRepository
                .findFirstByTrainIdAndStatusOrderByIdAsc(trainId, "WAITING")
                .orElse(null);

        if (waitingReservation != null &&
                train.getAvailableSeats() >= waitingReservation.getNumberOfSeats()) {

            waitingReservation.setStatus("PENDING_CONFIRMATION");
            waitingReservation.setPendingConfirmationAt(LocalDateTime.now());
            reservationRepository.save(waitingReservation);

            notificationRepository.save(new Notification(
                    waitingReservation.getUserId(),
                    "Confirmation demandée",
                    "Une place est disponible pour le train " + train.getTrainNumber()
                            + ". Voulez-vous confirmer votre réservation ?",
                    "PENDING_CONFIRMATION"
            ));

            User user = userRepository.findById(waitingReservation.getUserId()).orElse(null);

            if (user != null) {
                sendUserNotification(
                        user,
                        "Train Reservation - Confirmation demandée",
                        "Bonjour " + user.getName() + ",\n\n" +
                                "Une place est disponible pour le train " + train.getTrainNumber() + ".\n" +
                                "Veuillez confirmer ou refuser votre réservation depuis votre espace utilisateur.\n\n" +
                                "Train Reservation Team"
                );
            }
        }
    }

    public String confirmWaitingReservation(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Train train = trainRepository.findById(reservation.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        if (!reservation.getStatus().equals("PENDING_CONFIRMATION")) {
            throw new RuntimeException("Cette réservation n'attend pas de confirmation");
        }

        if (train.getAvailableSeats() < reservation.getNumberOfSeats()) {
            throw new RuntimeException("Places insuffisantes");
        }

        train.setAvailableSeats(train.getAvailableSeats() - reservation.getNumberOfSeats());
        reservation.setStatus("CONFIRMED");

        trainRepository.save(train);
        reservationRepository.save(reservation);

        notificationRepository.save(new Notification(
                reservation.getUserId(),
                "Réservation confirmée",
                "Votre réservation pour le train " + train.getTrainNumber() + " est confirmée.",
                "CONFIRMATION"
        ));

        User user = userRepository.findById(reservation.getUserId()).orElse(null);
        if (user != null) {
            sendUserNotification(
                    user,
                    "Train Reservation - Confirmation liste d'attente",
                    "Bonjour " + user.getName() + ",\n\n" +
                            "Votre reservation depuis la liste d'attente a ete confirmee avec succes.\n" +
                            "Train : " + train.getTrainNumber() + "\n" +
                            "Nombre de places : " + reservation.getNumberOfSeats() + "\n\n" +
                            "Merci d'utiliser notre plateforme.\n" +
                            "Train Reservation Team"
            );
        }

        return "Réservation confirmée";
    }

    public List<Map<String, Object>> getWaitingListDetails() {

        deleteExpiredWaitingReservations();

        List<Reservation> waitingReservations =
                reservationRepository.findByStatusOrderByIdAsc("WAITING");

        return waitingReservations.stream()
                .filter(reservation -> {
                    Train train = trainRepository.findById(reservation.getTrainId()).orElse(null);
                    return train != null && train.getDepartureTime().isAfter(LocalDateTime.now());
                })
                .map(reservation -> {

                    User user = userRepository.findById(reservation.getUserId()).orElse(null);
                    Train train = trainRepository.findById(reservation.getTrainId()).orElse(null);

                    Map<String, Object> row = new HashMap<>();

                    row.put("reservationId", reservation.getId());
                    row.put("userName", user != null ? user.getName() : "Utilisateur inconnu");
                    row.put("userEmail", user != null ? user.getEmail() : "");
                    row.put("trainId", reservation.getTrainId());
                    row.put("trainNumber", train != null ? train.getTrainNumber() : "");
                    row.put("departureTime", train != null ? train.getDepartureTime() : "");
                    row.put("numberOfSeats", reservation.getNumberOfSeats());
                    row.put("status", reservation.getStatus());

                    return row;

                }).toList();
    }
    public String rejectWaitingReservation(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Long trainId = reservation.getTrainId();
        Long userId = reservation.getUserId();

        if (!reservation.getStatus().equals("PENDING_CONFIRMATION")) {
            throw new RuntimeException("Cette réservation n'attend pas de réponse");
        }

        reservationRepository.deleteById(reservationId);

        notificationRepository.save(new Notification(
                userId,
                "Réservation refusée",
                "Vous avez refusé la réservation proposée.",
                "REJECTED"
        ));

        processWaitingListFIFO(trainId);

        return "Réservation refusée, passage au suivant";
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public void expirePendingConfirmations() {
        LocalDateTime limit = LocalDateTime.now().minusMinutes(10);

        List<Reservation> expiredReservations =
                reservationRepository.findByStatusAndPendingConfirmationAtBefore(
                        "PENDING_CONFIRMATION",
                        limit
                );

        for (Reservation reservation : expiredReservations) {
            Long trainId = reservation.getTrainId();
            Long userId = reservation.getUserId();

            reservationRepository.deleteById(reservation.getId());

            notificationRepository.save(new Notification(
                    userId,
                    "Réservation expirée",
                    "Vous avez dépassé le délai de 10 minutes. Votre réservation a été annulée.",
                    "EXPIRED"
            ));

            processWaitingListFIFO(trainId);
        }
    }

    public void deleteExpiredWaitingReservations() {
        LocalDateTime now = LocalDateTime.now();

        List<Train> expiredTrains =
                trainRepository.findByDepartureTimeBefore(now);

        for (Train train : expiredTrains) {
            List<Reservation> expiredReservations =
                    reservationRepository.findByTrainIdAndStatusIn(
                            train.getId(),
                            List.of("WAITING", "PENDING_CONFIRMATION")
                    );

            for (Reservation reservation : expiredReservations) {
                notificationRepository.save(new Notification(
                        reservation.getUserId(),
                        "Liste d’attente expirée",
                        "Le départ du train " + train.getTrainNumber()
                                + " est déjà passé. Votre demande a été supprimée.",
                        "EXPIRED"
                ));

                reservationRepository.deleteById(reservation.getId());
            }
        }
    }

}
