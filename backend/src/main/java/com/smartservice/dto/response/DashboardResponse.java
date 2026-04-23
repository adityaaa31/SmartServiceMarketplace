package com.smartservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long totalProviders;
    private long totalCustomers;
    private long totalServices;
    private long totalBookings;
    private long pendingBookings;
    private long completedBookings;
    private BigDecimal totalRevenue;
    private List<Map<String, Object>> bookingsByMonth;
    private List<Map<String, Object>> revenueByMonth;
    private List<ServiceResponse> popularServices;
    private List<Map<String, Object>> usersByRole;
}
