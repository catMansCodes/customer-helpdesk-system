package com.catmanscodes.backend.dto;

import com.catmanscodes.backend.enums.TicketStatus;
import com.catmanscodes.backend.model.Ticket;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class TicketResponse {

    private final Long id;
    private final String subject;
    private final String description;
    private final TicketStatus status;
    private final String customerName;
    private final String customerEmail;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public TicketResponse(Ticket ticket) {
        this.id = ticket.getId();
        this.subject = ticket.getSubject();
        this.description = ticket.getDescription();
        this.status = ticket.getStatus();
        this.customerName = ticket.getCustomer().getName();
        this.customerEmail = ticket.getCustomer().getEmail();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();
    }
}
