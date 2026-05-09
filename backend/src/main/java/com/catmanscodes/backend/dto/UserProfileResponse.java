package com.catmanscodes.backend.dto;

import com.catmanscodes.backend.model.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String role;
    private final LocalDateTime createdAt;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.createdAt = user.getCreatedAt();
    }
}
