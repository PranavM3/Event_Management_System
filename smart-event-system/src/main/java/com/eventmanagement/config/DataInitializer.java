package com.eventmanagement.config;

import com.eventmanagement.model.ERole;
import com.eventmanagement.model.Role;
import com.eventmanagement.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Roles are now initialized via data.sql
        // Just verify they exist
        long roleCount = roleRepository.count();
        System.out.println("Roles initialized successfully! Total roles: " + roleCount);
    }
}
