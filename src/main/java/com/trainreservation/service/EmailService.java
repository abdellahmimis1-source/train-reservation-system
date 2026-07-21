package com.trainreservation.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        System.out.println("=== TEST ENVOI EMAIL ===");
        System.out.println("TO = " + to);
        System.out.println("SUBJECT = " + subject);

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromEmail != null && !fromEmail.trim().isEmpty()) {
            message.setFrom(fromEmail);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);

        System.out.println("=== EMAIL ENVOYE AVEC SUCCES ===");
    }
}
