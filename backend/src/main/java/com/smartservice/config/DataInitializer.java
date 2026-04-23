package com.smartservice.config;

import com.smartservice.entity.Category;
import com.smartservice.entity.User;
import com.smartservice.repository.CategoryRepository;
import com.smartservice.repository.ServiceRepository;
import com.smartservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Create admin
        User admin = User.builder()
                .name("Admin User")
                .email("admin@smartservice.com")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .build();
        userRepository.save(admin);

        // Create provider
        User provider = User.builder()
                .name("John Provider")
                .email("provider@smartservice.com")
                .password(passwordEncoder.encode("provider123"))
                .role(User.Role.PROVIDER)
                .bio("Professional service provider with 5+ years experience")
                .phone("+1-555-0100")
                .build();
        userRepository.save(provider);

        // Create customer
        User customer = User.builder()
                .name("Jane Customer")
                .email("customer@smartservice.com")
                .password(passwordEncoder.encode("customer123"))
                .role(User.Role.CUSTOMER)
                .phone("+1-555-0200")
                .build();
        userRepository.save(customer);

        // Create categories
        List<Category> categories = List.of(
            Category.builder().name("Home Cleaning").description("Professional home cleaning services").icon("🏠").build(),
            Category.builder().name("Plumbing").description("Expert plumbing repairs and installations").icon("🔧").build(),
            Category.builder().name("Electrical").description("Licensed electrical services").icon("⚡").build(),
            Category.builder().name("Painting").description("Interior and exterior painting").icon("🎨").build(),
            Category.builder().name("Carpentry").description("Custom woodwork and furniture").icon("🪚").build(),
            Category.builder().name("Gardening").description("Lawn care and landscaping").icon("🌿").build(),
            Category.builder().name("AC Repair").description("Air conditioning service and repair").icon("❄️").build(),
            Category.builder().name("Pest Control").description("Safe and effective pest elimination").icon("🐛").build()
        );
        categoryRepository.saveAll(categories);
    }
}
