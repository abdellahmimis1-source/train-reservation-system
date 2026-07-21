package com.trainreservation.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    private final String ACCOUNT_SID = " System.getenv(\"TWILIO_ACCOUNT_SID\")";
    private final String AUTH_TOKEN = "System.getenv(\"TWILIO_AUTH_TOKEN\")";
    private final String FROM_WHATSAPP = "whatsapp:+14155238886"; // sandbox Twilio

    public void sendWhatsApp(String phoneNumber, String messageBody) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        Message.creator(
                new com.twilio.type.PhoneNumber("whatsapp:" + formatPhone(phoneNumber)),
                new com.twilio.type.PhoneNumber(FROM_WHATSAPP),
                messageBody
        ).create();
    }

    private String formatPhone(String phone) {
        phone = phone.replace(" ", "");

        if (phone.startsWith("0")) {
            return "+212" + phone.substring(1);
        }

        if (!phone.startsWith("+")) {
            return "+" + phone;
        }

        return phone;
    }
}