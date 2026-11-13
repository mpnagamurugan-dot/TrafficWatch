
package com.trafficwatch.trafficwatch.dto;

public class DashboardStats {

    private long totalReports;
    private long pendingReports;
    private long approvedReports;
    private long rejectedReports;

    public DashboardStats() {
    }

    public DashboardStats(
            long totalReports,
            long pendingReports,
            long approvedReports,
            long rejectedReports) {
        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
        this.approvedReports = approvedReports;
        this.rejectedReports = rejectedReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getApprovedReports() {
        return approvedReports;
    }

    public void setApprovedReports(long approvedReports) {
        this.approvedReports = approvedReports;
    }

    public long getRejectedReports() {
        return rejectedReports;
    }

    public void setRejectedReports(long rejectedReports) {
        this.rejectedReports = rejectedReports;
    }
}
