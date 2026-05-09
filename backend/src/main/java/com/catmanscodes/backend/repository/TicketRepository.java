package com.catmanscodes.backend.repository;

import com.catmanscodes.backend.model.Ticket;
import com.catmanscodes.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomer(User customer);
    List<Ticket> findAllByOrderByUpdatedAtDesc();
}
