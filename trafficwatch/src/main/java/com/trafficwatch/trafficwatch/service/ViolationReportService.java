
package com.trafficwatch.trafficwatch.service;

import com.trafficwatch.trafficwatch.dto.DashboardStats;
import com.trafficwatch.trafficwatch.entity.ViolationReport;
import com.trafficwatch.trafficwatch.repository.ViolationReportRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ViolationReportService {

    private final ViolationReportRepository repository;

    public ViolationReportService(ViolationReportRepository repository) {
        this.repository = repository;
    }

    public ViolationReport createReport(ViolationReport report) {
        if (report.getId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New reports must not contain an ID"
            );
        }

        if (report.getVehicleNumber() == null
                || report.getVehicleNumber().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vehicle number is required"
            );
        }

        if (report.getViolationType() == null
                || report.getViolationType().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Violation type is required"
            );
        }

        report.setVehicleNumber(
                report.getVehicleNumber().trim().toUpperCase()
        );
        report.setStatus("PENDING");

        return repository.save(report);
    }

    public List<ViolationReport> getAllReports() {
        return repository.findAll();
    }

    public ViolationReport getReportById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Violation report not found with id: " + id
                ));
    }

    public ViolationReport updateStatus(Long id, String status) {
        if (status == null
                || !(status.equalsIgnoreCase("PENDING")
                || status.equalsIgnoreCase("APPROVED")
                || status.equalsIgnoreCase("REJECTED"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be PENDING, APPROVED or REJECTED"
            );
        }

        ViolationReport report = getReportById(id);
        report.setStatus(status.toUpperCase());

        return repository.save(report);
    }

    @Transactional
    public void deleteReport(Long id) {
        ViolationReport report = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Violation report not found with id: " + id
                ));

        repository.delete(report);
    }

    public DashboardStats getDashboardStats() {
        return new DashboardStats(
                repository.count(),
                repository.countByStatus("PENDING"),
                repository.countByStatus("APPROVED"),
                repository.countByStatus("REJECTED")
        );
    }

    public List<Object[]> getViolationAnalytics() {
        return repository.countReportsByViolationType();
    }
}
