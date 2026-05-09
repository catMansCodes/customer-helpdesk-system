package com.catmanscodes.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTicketRequest {
    private String subject;
    private String description;
}
