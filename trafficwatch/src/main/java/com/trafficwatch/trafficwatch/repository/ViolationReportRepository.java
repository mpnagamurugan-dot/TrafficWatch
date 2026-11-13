
package com.trafficwatch.trafficwatch.repository;

import com.trafficwatch.trafficwatch.entity.ViolationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ViolationReportRepository
        extends JpaRepository<ViolationReport, Long> {

    long countByStatus(String status);

    List<ViolationReport> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT v.violationType, COUNT(v) " +
            "FROM ViolationReport v " +
            "GROUP BY v.violationType " +
            "ORDER BY COUNT(v) DESC")
    List<Object[]> countReportsByViolationType();
}
