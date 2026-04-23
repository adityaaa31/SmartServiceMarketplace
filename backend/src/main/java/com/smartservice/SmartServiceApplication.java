package com.smartservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartServiceApplication.class, args);
    }
}
