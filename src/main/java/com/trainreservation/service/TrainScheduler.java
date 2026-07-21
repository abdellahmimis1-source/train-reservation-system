package com.trainreservation.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TrainScheduler {

    private final TrainService trainService;

    public TrainScheduler(TrainService trainService) {
        this.trainService = trainService;
    }

    @Scheduled(fixedRate = 60000)
    public void removeExpiredTrains() {
        trainService.deleteExpiredTrains();
    }
}