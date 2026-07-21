package com.trainreservation.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trainreservation.entity.Notification;
import com.trainreservation.entity.Reservation;
import com.trainreservation.entity.Train;
import com.trainreservation.entity.User;
import com.trainreservation.repository.NotificationRepository;
import com.trainreservation.repository.ReservationRepository;
import com.trainreservation.repository.TrainRepository;
import com.trainreservation.repository.UserRepository;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class TrainService {

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsAppService whatsAppService;

    public Train addTrain(Train train) {
        return trainRepository.save(train);
    }

    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    public void deleteExpiredTrains() {
        List<Train> expiredTrains =
                trainRepository.findByDepartureTimeBefore(LocalDateTime.now());

        for (Train train : expiredTrains) {
            reservationRepository.deleteByTrainId(train.getId());
            trainRepository.deleteById(train.getId());
        }
    }

    @Transactional
    public void deleteTrain(Long id) {
        reservationRepository.deleteByTrainId(id);
        trainRepository.deleteById(id);
    }

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

    public Train updateTrain(Long id, Train newTrain) {

        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));

        String oldStatus = train.getStatus();

        train.setTrainNumber(newTrain.getTrainNumber());
        train.setDepartureStation(newTrain.getDepartureStation());
        train.setArrivalStation(newTrain.getArrivalStation());
        train.setDepartureTime(newTrain.getDepartureTime());
        train.setArrivalTime(newTrain.getArrivalTime());
        train.setAvailableSeats(newTrain.getAvailableSeats());
        train.setStatus(newTrain.getStatus());

        Train savedTrain = trainRepository.save(train);

        if ("DELAYED".equalsIgnoreCase(newTrain.getStatus())
                && !"DELAYED".equalsIgnoreCase(oldStatus)) {

            List<Reservation> confirmedReservations =
                    reservationRepository.findByTrainIdAndStatus(id, "CONFIRMED");

            for (Reservation reservation : confirmedReservations) {

                String message =
                        "Bonjour,\n\n" +
                                "Le train " + savedTrain.getTrainNumber() + " est en retard.\n" +
                                "Trajet : " + savedTrain.getDepartureStation() + " -> " + savedTrain.getArrivalStation() + "\n\n" +
                                "Merci d'utiliser notre plateforme.\n" +
                                "Train Reservation Team";

                notificationRepository.save(new Notification(
                        reservation.getUserId(),
                        "Train en retard",
                        "Le train " + savedTrain.getTrainNumber() + " est en retard.",
                        "DELAY"
                ));

                User user = userRepository.findById(reservation.getUserId()).orElse(null);

                if (user != null) {
                    sendUserNotification(
                            user,
                            "Train Reservation - Retard",
                            message
                    );
                }
            }
        }

        return savedTrain;
    }
}