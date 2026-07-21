package com.trainreservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableScheduling;
@EnableScheduling

@SpringBootApplication
public class TrainReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainReservationApplication.class, args);
    }
}