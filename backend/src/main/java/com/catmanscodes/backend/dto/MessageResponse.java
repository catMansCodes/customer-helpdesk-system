package com.catmanscodes.backend.dto;

import com.catmanscodes.backend.enums.SenderType;
import com.catmanscodes.backend.model.Message;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MessageResponse {

    private final Long id;
    private final SenderType senderType;
    private final String content;
    private final LocalDateTime createdAt;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.senderType = message.getSenderType();
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
    }
}
