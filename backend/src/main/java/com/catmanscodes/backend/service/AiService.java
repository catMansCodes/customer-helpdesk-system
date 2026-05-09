package com.catmanscodes.backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private final ChatClient chatClient;

    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem("""
                        You are a helpful customer support assistant for a helpdesk system.
                        Respond clearly and empathetically to the customer's issue.
                        Keep your reply concise (2-4 sentences).
                        If the issue requires account-level access or a human decision, \
                        acknowledge it and let the customer know a support agent will follow up.
                        """)
                .build();
    }

    public String generateReply(String subject, String description) {
        String userMessage = "Ticket subject: " + subject + "\n\nCustomer message: " + description;
        return chatClient.prompt()
                .user(userMessage)
                .call()
                .content();
    }
}
