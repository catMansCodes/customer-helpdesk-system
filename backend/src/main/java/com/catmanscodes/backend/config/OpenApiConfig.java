package com.catmanscodes.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Customer Helpdesk API",
                version = "1.0",
                description = "REST API for the Customer Helpdesk System. " +
                        "Use POST /api/auth/login to obtain a JWT, then click 'Authorize' and paste the token.",
                contact = @Contact(name = "catmanscodes")
        ),
        servers = @Server(url = "http://localhost:8080", description = "Local dev server")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Paste the JWT token obtained from /api/auth/login"
)
public class OpenApiConfig {
}
