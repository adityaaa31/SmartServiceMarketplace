package com.smartservice.service;

import com.smartservice.dto.response.DashboardResponse;
import com.smartservice.dto.response.ServiceResponse;
import com.smartservice.entity.Booking;
import com.smartservice.entity.Service;
import com.smartservice.entity.User;
import com.smartservice.repository.BookingRepository;
import com.smartservice.repository.ServiceRepository;
import com.smartservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final ServiceService serviceService;
    private final UserService userService;

    public DashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalProviders = userRepository.countByRole(User.Role.PROVIDER);
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalServices = serviceRepository.count();
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long completedBookings = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
        BigDecimal totalRevenue = bookingRepository.getTotalRevenue();

        List<Map<String, Object>> bookingsByMonth = buildMonthlyData(bookingRepository.getBookingsByMonth(), "count");
        List<Map<String, Object>> revenueByMonth = buildMonthlyData(bookingRepository.getRevenueByMonth(), "revenue");

        List<ServiceResponse> popularServices = serviceRepository
                .findTopServices(PageRequest.of(0, 5))
                .stream().map(serviceService::mapToResponse).collect(Collectors.toList());

        List<Map<String, Object>> usersByRole = List.of(
                Map.of("role", "CUSTOMER", "count", totalCustomers),
                Map.of("role", "PROVIDER", "count", totalProviders),
                Map.of("role", "ADMIN", "count", userRepository.countByRole(User.Role.ADMIN))
        );

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProviders(totalProviders)
                .totalCustomers(totalCustomers)
                .totalServices(totalServices)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .completedBookings(completedBookings)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .bookingsByMonth(bookingsByMonth)
                .revenueByMonth(revenueByMonth)
                .popularServices(popularServices)
                .usersByRole(usersByRole)
                .build();
    }

    public DashboardResponse getProviderDashboard() {
        User provider = userService.getCurrentUser();
        long totalServices = serviceRepository.countByProvider(provider);
        long totalBookings = bookingRepository.countByProvider(provider);
        BigDecimal totalRevenue = bookingRepository.getProviderRevenue(provider);

        List<ServiceResponse> popularServices = serviceRepository
                .findTopServices(PageRequest.of(0, 5))
                .stream()
                .filter(s -> s.getProvider().getId().equals(provider.getId()))
                .map(serviceService::mapToResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalServices(totalServices)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .popularServices(popularServices)
                .build();
    }

    private List<Map<String, Object>> buildMonthlyData(List<Object[]> rawData, String valueKey) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        Map<Integer, Object> dataMap = new HashMap<>();
        for (Object[] row : rawData) {
            dataMap.put(((Number) row[0]).intValue(), row[1]);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", months[i - 1]);
            entry.put(valueKey, dataMap.getOrDefault(i, 0));
            result.add(entry);
        }
        return result;
    }
}
