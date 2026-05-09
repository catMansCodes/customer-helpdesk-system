package com.catmanscodes.backend.controller;

import com.catmanscodes.backend.dto.CreateTicketRequest;
import com.catmanscodes.backend.dto.TicketResponse;
import com.catmanscodes.backend.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a ticket — AI auto-responds immediately (CUSTOMER)")
    public ResponseEntity<TicketResponse> createTicket(@RequestBody CreateTicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get own tickets (CUSTOMER)")
    public ResponseEntity<List<TicketResponse>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all tickets, newest first (ADMIN)")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single ticket by ID (any authenticated user)")
    public ResponseEntity<TicketResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PatchMapping("/{id}/escalate")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Mark AI response as unresolved — escalates to admin (CUSTOMER)")
    public ResponseEntity<TicketResponse> escalate(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.escalate(id));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Close a ticket (ADMIN)")
    public ResponseEntity<TicketResponse> close(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.close(id));
    }

    @PatchMapping("/{id}/reopen")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reopen a closed ticket (ADMIN)")
    public ResponseEntity<TicketResponse> reopen(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.reopen(id));
    }
}
