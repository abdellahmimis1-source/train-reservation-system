package com.trainreservation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.trainreservation.entity.Train;
import com.trainreservation.service.TrainService;
import com.trainreservation.repository.AdminRepository;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TrainController {

    @Autowired
    private TrainService trainService;

    @Autowired
    private AdminRepository adminRepository;

    // GET (public)
    @GetMapping
    public List<Train> getAllTrains() {
        return trainService.getAllTrains();
    }

    // ADD (admin only)
    @PostMapping
    public Train addTrain(@RequestBody Train train, @RequestParam String adminEmail) {

        if (!adminRepository.existsByEmail(adminEmail)) {
            throw new RuntimeException("Access denied: admin only");
        }

        return trainService.addTrain(train);
    }

    // UPDATE (admin only)
    @PutMapping("/{id}")
    public Train updateTrain(@PathVariable Long id,
                             @RequestBody Train train,
                             @RequestParam String adminEmail) {

        if (!adminRepository.existsByEmail(adminEmail)) {
            throw new RuntimeException("Access denied: admin only");
        }

        return trainService.updateTrain(id, train);
    }

    // DELETE (admin only)
    @DeleteMapping("/{id}")
    public String deleteTrain(@PathVariable Long id,
                              @RequestParam String adminEmail) {

        if (!adminRepository.existsByEmail(adminEmail)) {
            throw new RuntimeException("Access denied: admin only");
        }

        trainService.deleteTrain(id);
        return "Train supprimé avec succès";
    }
}