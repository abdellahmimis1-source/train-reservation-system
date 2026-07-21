package com.trainreservation.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trainreservation.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}