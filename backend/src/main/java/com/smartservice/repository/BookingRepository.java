package com.smartservice.repository;

import com.smartservice.entity.Booking;
import com.smartservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByCustomer(User customer, Pageable pageable);

    Page<Booking> findByProvider(User provider, Pageable pageable);

    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);

    long countByStatus(Booking.BookingStatus status);

    long countByCustomer(User customer);

    long countByProvider(User provider);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.provider = :provider AND b.status = 'COMPLETED'")
    BigDecimal getProviderRevenue(@Param("provider") User provider);

    @Query("SELECT MONTH(b.createdAt) as month, COUNT(b) as count FROM Booking b " +
           "WHERE YEAR(b.createdAt) = YEAR(CURRENT_DATE) GROUP BY MONTH(b.createdAt)")
    List<Object[]> getBookingsByMonth();

    @Query("SELECT MONTH(b.createdAt) as month, COALESCE(SUM(b.amount), 0) as revenue FROM Booking b " +
           "WHERE b.status = 'COMPLETED' AND YEAR(b.createdAt) = YEAR(CURRENT_DATE) " +
           "GROUP BY MONTH(b.createdAt)")
    List<Object[]> getRevenueByMonth();

    boolean existsByCustomerAndServiceIdAndStatus(User customer, Long serviceId, Booking.BookingStatus status);
}
