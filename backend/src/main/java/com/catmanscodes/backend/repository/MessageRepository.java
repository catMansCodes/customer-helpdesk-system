package com.catmanscodes.backend.repository;

import com.catmanscodes.backend.model.Message;
import com.catmanscodes.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
