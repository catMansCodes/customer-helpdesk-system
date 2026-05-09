package com.catmanscodes.backend.service;

import com.catmanscodes.backend.dto.CreateTicketRequest;
import com.catmanscodes.backend.dto.TicketResponse;
import com.catmanscodes.backend.enums.SenderType;
import com.catmanscodes.backend.enums.TicketStatus;
import com.catmanscodes.backend.model.Message;
import com.catmanscodes.backend.model.Ticket;
import com.catmanscodes.backend.model.User;
import com.catmanscodes.backend.repository.MessageRepository;
import com.catmanscodes.backend.repository.TicketRepository;
import com.catmanscodes.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final AiService aiService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        User customer = currentUser();

        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCustomer(customer);
        ticket = ticketRepository.save(ticket);

        String aiReply = aiService.generateReply(ticket.getSubject(), ticket.getDescription());

        Message aiMessage = new Message();
        aiMessage.setTicket(ticket);
        aiMessage.setSenderType(SenderType.AI);
        aiMessage.setContent(aiReply);
        messageRepository.save(aiMessage);

        ticket.setStatus(TicketStatus.AI_RESPONDED);
        return new TicketResponse(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getMyTickets() {
        return ticketRepository.findByCustomer(currentUser())
                .stream().map(TicketResponse::new).toList();
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByUpdatedAtDesc()
                .stream().map(TicketResponse::new).toList();
    }

    public TicketResponse getById(Long id) {
        return new TicketResponse(findTicket(id));
    }

    @Transactional
    public TicketResponse escalate(Long id) {
        Ticket ticket = findTicket(id);
        if (ticket.getStatus() != TicketStatus.AI_RESPONDED) {
            throw new IllegalStateException("Ticket can only be escalated when status is AI_RESPONDED");
        }
        ticket.setStatus(TicketStatus.ESCALATED);
        return new TicketResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse close(Long id) {
        Ticket ticket = findTicket(id);
        ticket.setStatus(TicketStatus.CLOSED);
        return new TicketResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse reopen(Long id) {
        Ticket ticket = findTicket(id);
        if (ticket.getStatus() != TicketStatus.CLOSED) {
            throw new IllegalStateException("Only closed tickets can be reopened");
        }
        ticket.setStatus(TicketStatus.OPEN);
        return new TicketResponse(ticketRepository.save(ticket));
    }

    public Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
