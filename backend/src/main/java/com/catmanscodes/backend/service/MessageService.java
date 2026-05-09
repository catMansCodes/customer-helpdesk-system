package com.catmanscodes.backend.service;

import com.catmanscodes.backend.dto.MessageResponse;
import com.catmanscodes.backend.dto.SendMessageRequest;
import com.catmanscodes.backend.enums.SenderType;
import com.catmanscodes.backend.enums.TicketStatus;
import com.catmanscodes.backend.exception.ResourceNotFoundException;
import com.catmanscodes.backend.model.Message;
import com.catmanscodes.backend.model.Ticket;
import com.catmanscodes.backend.repository.MessageRepository;
import com.catmanscodes.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public MessageResponse addMessage(Long ticketId, SenderType senderType, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        Message message = new Message();
        message.setTicket(ticket);
        message.setSenderType(senderType);
        message.setContent(content);

        MessageResponse response = new MessageResponse(messageRepository.save(message));

        if (senderType == SenderType.ADMIN && ticket.getStatus() == TicketStatus.ESCALATED) {
            ticket.setStatus(TicketStatus.HUMAN_RESPONDED);
            ticketRepository.save(ticket);
        }

        return response;
    }

    public MessageResponse addMessage(Long ticketId, SenderType senderType, SendMessageRequest request) {
        return addMessage(ticketId, senderType, request.getContent());
    }

    public List<MessageResponse> getMessagesForTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return messageRepository.findByTicketOrderByCreatedAtAsc(ticket)
                .stream().map(MessageResponse::new).toList();
    }
}
