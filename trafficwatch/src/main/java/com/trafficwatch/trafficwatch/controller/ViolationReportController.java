
package com.trafficwatch.trafficwatch.controller;

import com.trafficwatch.trafficwatch.dto.DashboardStats;
import com.trafficwatch.trafficwatch.entity.ViolationReport;
import com.trafficwatch.trafficwatch.service.ViolationReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ViolationReportController {

    private final ViolationReportService service;

    public ViolationReportController(ViolationReportService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ViolationReport> createReport(
            @RequestBody ViolationReport report) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createReport(report));
    }

    @GetMapping
    public List<ViolationReport> getAllReports() {
        return service.getAllReports();
    }

    @GetMapping("/{id}")
    public ViolationReport getReportById(@PathVariable Long id) {
        return service.getReportById(id);
    }

    @PatchMapping("/{id}/status")
    public ViolationReport updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        service.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public DashboardStats getDashboardStats() {
        return service.getDashboardStats();
    }

    @GetMapping("/analytics/violations")
    public List<Map<String, Object>> getViolationAnalytics() {
        return service.getViolationAnalytics().stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("violationType", row[0]);
            item.put("count", row[1]);
            return item;
        }).collect(Collectors.toList());
    }
}
