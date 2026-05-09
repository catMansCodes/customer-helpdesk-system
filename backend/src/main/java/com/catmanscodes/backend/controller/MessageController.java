package com.catmanscodes.backend.controller;

import com.catmanscodes.backend.dto.MessageResponse;
import com.catmanscodes.backend.dto.SendMessageRequest;
import com.catmanscodes.backend.enums.SenderType;
import com.catmanscodes.backend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Thread messages for a ticket")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(summary = "Send a message — senderType is derived from your JWT role")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long ticketId,
            @RequestBody SendMessageRequest request,
            Authentication authentication) {

        SenderType senderType = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                ? SenderType.ADMIN
                : SenderType.CUSTOMER;

        return ResponseEntity.ok(messageService.addMessage(ticketId, senderType, request));
    }

    @GetMapping
    @Operation(summary = "Get all messages for a ticket in chronological order")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long ticketId) {
        return ResponseEntity.ok(messageService.getMessagesForTicket(ticketId));
    }
}
