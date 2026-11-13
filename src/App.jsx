 
import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "http://localhost:8080";

const VIOLATION_TYPES = [
  { value: "NO_HELMET", label: "No Helmet" },
  { value: "NO_SEAT_BELT", label: "No Seat Belt" },
  { value: "SIGNAL_JUMP", label: "Signal Jump" },
  { value: "WRONG_PARKING", label: "Wrong Parking" },
  { value: "OTHER", label: "Other" },
];

function App() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
  totalReports: 0,
  pendingReports: 0,
  approvedReports: 0,
  rejectedReports: 0,
});
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [violationType, setViolationType] = useState("NO_HELMET");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  
const loadReports = useCallback(async () => {
  setLoading(true);

  try {
    const [reportsResponse, statsResponse] = await Promise.all([
      fetch(`${API}/api/reports`),
      fetch(`${API}/api/reports/stats`),
    ]);

    if (!reportsResponse.ok) {
      throw new Error("Could not load reports.");
    }

    if (!statsResponse.ok) {
      throw new Error("Could not load dashboard statistics.");
    }

    const reportsData = await reportsResponse.json();
    const statsData = await statsResponse.json();

    setReports(Array.isArray(reportsData) ? reportsData : []);
    setStats(statsData);
    setMessage("");
  } catch (error) {
    setMessage(error.message || "Could not connect to the backend.");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadReports();
  }, [loadReports]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      let imageFileName = "";

      // Upload the photo first, if one was selected.
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await fetch(`${API}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Photo upload failed.");
        }

        const uploadData = await uploadResponse.json();
        imageFileName = uploadData.fileName;

        if (!imageFileName) {
          throw new Error("The server did not return a photo filename.");
        }
      }

      // Submit the report to Spring Boot.
      const reportResponse = await fetch(`${API}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          violationType,
          location: location.trim(),
          description: description.trim(),
          imageFileName,
        }),
      });

      if (!reportResponse.ok) {
        throw new Error("Report submission failed.");
      }

      const savedReport = await reportResponse.json();

      setMessage(
        `Report #${savedReport.id} submitted successfully!`
      );

      setVehicleNumber("");
      setViolationType("NO_HELMET");
      setLocation("");
      setDescription("");
      setImage(null);

      event.target.reset();

      await loadReports();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateReportStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/api/reports/${id}/status?status=${status}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error("Could not update report status.");
      }

      setMessage(`Report #${id} updated to ${status}.`);
      await loadReports();
    } catch (error) {
      setMessage(error.message || "Status update failed.");
    }
  }

 async function deleteReport(id) {
  const confirmed = window.confirm(
    `Are you sure you want to delete report #${id}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`${API}/api/reports/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    setReports((previousReports) =>
      previousReports.filter((report) => report.id !== id)
    );

    setMessage(`Report #${id} deleted successfully.`);
    await loadReports();
  } catch (error) {
    setMessage(error.message || "Delete failed.");
  }
}
  function statusClass(status) {
    switch ((status || "PENDING").toUpperCase()) {
      case "APPROVED":
        return "status-approved";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-pending";
    }
  }
  
const filteredReports = reports.filter((report) => {
  const query = searchTerm.trim().toLowerCase();

  const matchesSearch =
    (report.vehicleNumber || "").toLowerCase().includes(query) ||
    (report.location || "").toLowerCase().includes(query) ||
    String(report.id).includes(query);

  const matchesStatus =
    statusFilter === "ALL" || report.status === statusFilter;

  return matchesSearch && matchesStatus;
});


  const totalReports = reports.length;
  const pendingReports = reports.filter(
    (report) => report.status === "PENDING"
  ).length;
  const approvedReports = reports.filter(
    (report) => report.status === "APPROVED"
  ).length;
  const rejectedReports = reports.filter(
    (report) => report.status === "REJECTED"
  ).length;

  return (
    <main className="app-container">
      <header className="app-header">
        <div>
          <h1>TrafficWatch</h1>
          <p>Traffic Violation Reporting and Monitoring System</p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadReports}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </header>

      {message && (
        <div className="message" role="status">
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="form-section">
        <h2>Report a Traffic Violation</h2>

        <form onSubmit={handleSubmit} className="report-form">
          <label htmlFor="vehicleNumber">Vehicle Number *</label>
          <input
            id="vehicleNumber"
            type="text"
            placeholder="e.g. TN58AB1234"
            value={vehicleNumber}
            onChange={(event) =>
              setVehicleNumber(event.target.value.toUpperCase())
            }
            required
            maxLength={20}
          />

          <label htmlFor="violationType">Violation Type *</label>
          <select
            id="violationType"
            value={violationType}
            onChange={(event) => setViolationType(event.target.value)}
            required
          >
            {VIOLATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Madurai"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            maxLength={150}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Describe the violation..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={1000}
          />

          <label htmlFor="image">Violation Photo (optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setImage(event.target.files?.[0] || null)
            }
          />

          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </section>

      <section className="dashboard">
        <h2>Reports Dashboard</h2>
        
<div className="report-filters">
  <input
    type="search"
    placeholder="Search vehicle number, location or report ID..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    aria-label="Search reports"
  />

  <select
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
    aria-label="Filter reports by status"
  >
    <option value="ALL">All Reports</option>
    <option value="PENDING">Pending</option>
    <option value="APPROVED">Approved</option>
    <option value="REJECTED">Rejected</option>
  </select>
</div>


<div className="stats-grid">
  <div className="stat-card">
    <h3>Total Reports</h3>
    <p>{stats.totalReports}</p>
  </div>

  <div className="stat-card">
    <h3>Pending</h3>
    <p>{stats.pendingReports}</p>
  </div>

  <div className="stat-card">
    <h3>Approved</h3>
    <p>{stats.approvedReports}</p>
  </div>

  <div className="stat-card">
    <h3>Rejected</h3>
    <p>{stats.rejectedReports}</p>
  </div>
</div>

       

        {loading && reports.length === 0 ? (
          <p>Loading reports...</p>
        ) : filteredReports.length === 0 ? (
          <p>No reports found. Submit your first report above.</p>
        ) : (
           <div className="reports-grid">
  {filteredReports.map((report) => (
              <article className="report-item" key={report.id}>
                {report.imageFileName && (
                  <img
                    className="report-image"
                    src={`${API}/uploads/${encodeURIComponent(
                      report.imageFileName
                    )}`}
                    alt={`Evidence for report ${report.id}`}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div className="report-item-body">
                  <div className="report-heading">
                    <h3>Report #{report.id}</h3>

                    <span
                      className={`status-badge ${statusClass(
                        report.status
                      )}`}
                    >
                      {report.status || "PENDING"}
                    </span>
                  </div>

                  <p>
                    <strong>Vehicle:</strong>{" "}
                    {report.vehicleNumber}
                  </p>

                  <p>
                    <strong>Violation:</strong>{" "}
                    {(
                      VIOLATION_TYPES.find(
                        (type) => type.value === report.violationType
                      ) || { label: report.violationType }
                    ).label}
                  </p>

                  <p>
                    <strong>Location:</strong> {report.location}
                  </p>

                  <p className="report-description">
                    <strong>Description:</strong>{" "}
                    {report.description || "No description provided."}
                  </p>

                  <div className="report-actions">
                    {report.status !== "APPROVED" && (
                      <button
                        type="button"
                        className="approve-button"
                        onClick={() =>
                          updateReportStatus(report.id, "APPROVED")
                        }
                      >
                        Approve
                      </button>
                    )}

                    {report.status !== "REJECTED" && (
                      <button
                        type="button"
                        className="reject-button"
                        onClick={() =>
                          updateReportStatus(report.id, "REJECTED")
                        }
                      >
                        Reject
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="app-footer">
        <p>TrafficWatch | Project Demonstration</p>
      </footer>
    </main>
  );
}

export default App;
