package com.smartservice.dto.response;

import com.smartservice.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private User.Role role;
    private String phone;
    private String address;
    private String profileImage;
    private String bio;
    private boolean active;
    private boolean banned;
    private LocalDateTime createdAt;
}
