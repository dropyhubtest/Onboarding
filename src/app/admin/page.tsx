'use client';

import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { DeliveryPartnerApplication, AdminApplicationDetail, ApplicationStatus, KotakAccountStatus } from '@/types';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>('dropyhub_admin_secure_key_2026');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [applications, setApplications] = useState<DeliveryPartnerApplication[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Selected detail modal
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AdminApplicationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Status controls
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('Under Review');
  const [selectedKotakStatus, setSelectedKotakStatus] = useState<KotakAccountStatus>('Completed');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '50',
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/applications?${params.toString()}`, {
        headers: {
          'x-admin-key': adminKey,
          'x-admin-name': 'Recruiter',
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        throw new Error('Invalid or missing admin security passkey.');
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch applicants.');
      }

      setApplications(json.applications || []);
      setTotalCount(json.total || 0);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Error loading applicant data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenDetail = async (id: string) => {
    setSelectedAppId(id);
    setIsDetailLoading(true);
    setActionMessage('');

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        headers: { 'x-admin-key': adminKey },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load candidate.');

      setDetailData(json.application);
      setSelectedStatus(json.application.application_status);
      setSelectedKotakStatus(json.application.kotak_account_status);
    } catch (err: any) {
      alert(err.message || 'Error loading details.');
      setSelectedAppId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppId) return;

    try {
      const res = await fetch(`/api/admin/applications/${selectedAppId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
          'x-admin-name': 'Recruitment Lead',
        },
        body: JSON.stringify({
          status: selectedStatus,
          reason: selectedStatus === 'Rejected' ? (rejectionReason || 'Profile does not meet criteria') : '',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status.');

      setDetailData(json.application);
      setActionMessage(`Application status updated to "${selectedStatus}".`);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleUpdateKotak = async () => {
    if (!selectedAppId) return;

    try {
      const res = await fetch(`/api/admin/applications/${selectedAppId}/kotak-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
          'x-admin-name': 'Recruitment Lead',
        },
        body: JSON.stringify({
          status: selectedKotakStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update Kotak status.');

      setDetailData(json.application);
      setActionMessage(`Kotak banking status updated to "${selectedKotakStatus}".`);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Kotak status update failed.');
    }
  };

  const handleViewDoc = (docId: string) => {
    window.open(`/api/admin/documents/${docId}?adminKey=${encodeURIComponent(adminKey)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return `${styles.badge} ${styles.badgeApproved}`;
      case 'Rejected':
        return `${styles.badge} ${styles.badgeRejected}`;
      case 'Under Review':
        return `${styles.badge} ${styles.badgeReview}`;
      default:
        return `${styles.badge} ${styles.badgePending}`;
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Delivery Partner Applicants</h1>
          <p className={styles.subtitle}>
            Total registered candidates: <strong>{totalCount}</strong>
          </p>
        </div>

        <div className={styles.authGroup}>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin Secret Passkey"
            className={styles.authInput}
          />
          <button type="button" onClick={fetchApplications} className={styles.refreshBtn}>
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
          placeholder="Search applicants by name, mobile number, reference, or city..."
          className={styles.searchInput}
        />
        <button type="button" onClick={fetchApplications} className={styles.searchBtn}>
          Search
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Simplified Applicants Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ref ID</th>
              <th>Applicant Name</th>
              <th>Mobile</th>
              <th>City</th>
              <th>Stream</th>
              <th>Work Type</th>
              <th>Vehicle</th>
              <th>Kotak Mahindra</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className={styles.emptyState}>
                  Loading candidate records...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={11} className={styles.emptyState}>
                  No candidate applications found.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <span className={styles.refTag}>{app.application_reference}</span>
                  </td>
                  <td>
                    <div className={styles.nameCell}>{app.full_name}</div>
                    <div className={styles.emailSub}>{app.email}</div>
                  </td>
                  <td>
                    <strong>{app.mobile_number}</strong>
                  </td>
                  <td>{app.city}</td>
                  <td>
                    {app.delivery_categories.includes('food_quick_commerce') && 'Food '}
                    {app.delivery_categories.includes('logistics_ecommerce') && 'Logistics'}
                  </td>
                  <td>{app.work_type}</td>
                  <td>
                    <span style={{ color: app.owns_two_wheeler ? '#15803d' : '#b45309', fontWeight: 600 }}>
                      {app.owns_two_wheeler ? 'Owns Bike' : 'Needs Rental'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: app.kotak_account_status === 'Completed' ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {app.kotak_account_status}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(app.application_status)}>{app.application_status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(app.submitted_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(app.id)}
                      className={styles.viewBtn}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Applicant Detail Modal */}
      {selectedAppId && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAppId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {isDetailLoading || !detailData ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading applicant details...
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div>
                    <h2 className={styles.modalTitle}>{detailData.full_name}</h2>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Reference ID: <strong>{detailData.application_reference}</strong> &bull; Submitted:{' '}
                      {new Date(detailData.submitted_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAppId(null)}
                    className={styles.modalClose}
                  >
                    &times;
                  </button>
                </div>

                {actionMessage && (
                  <div style={{ padding: '16px 28px 0' }}>
                    <div className={styles.alertSuccess}>{actionMessage}</div>
                  </div>
                )}

                <div className={styles.modalBody}>
                  {/* 1. Contact & Personal Details */}
                  <div className={styles.cardSection}>
                    <h3 className={styles.sectionHeading}>Contact &amp; Personal Information</h3>
                    <div className={styles.infoGrid}>
                      <div>
                        <div className={styles.infoLabel}>Primary Mobile</div>
                        <div className={styles.infoValue}>{detailData.mobile_number}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Alternate Mobile</div>
                        <div className={styles.infoValue}>{detailData.alternate_mobile_number || 'None'}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Email Address</div>
                        <div className={styles.infoValue}>{detailData.email}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Date of Birth</div>
                        <div className={styles.infoValue}>{detailData.date_of_birth}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Gender</div>
                        <div className={styles.infoValue}>{detailData.gender || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>PIN Code</div>
                        <div className={styles.infoValue}>{detailData.pincode}</div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div className={styles.infoLabel}>Residential Address</div>
                        <div className={styles.infoValue}>
                          {detailData.address}, {detailData.city}, {detailData.state}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Work & Vehicle Readiness */}
                  <div className={styles.cardSection}>
                    <h3 className={styles.sectionHeading}>Work Preferences &amp; Vehicle</h3>
                    <div className={styles.infoGrid}>
                      <div>
                        <div className={styles.infoLabel}>Working Type</div>
                        <div className={styles.infoValue}>{detailData.work_type}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Shift Hours</div>
                        <div className={styles.infoValue}>{detailData.preferred_working_hours}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Delivery Location</div>
                        <div className={styles.infoValue}>{detailData.preferred_delivery_location}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Service Radius</div>
                        <div className={styles.infoValue}>{detailData.preferred_service_area}</div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Owns Two-Wheeler</div>
                        <div className={styles.infoValue}>
                          {detailData.owns_two_wheeler ? 'Yes (Own Bike)' : 'No (Requires Fleet Rental)'}
                        </div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Driving License</div>
                        <div className={styles.infoValue}>
                          {detailData.has_driving_license ? 'Valid License Available' : 'No License'}
                        </div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Vehicle RC</div>
                        <div className={styles.infoValue}>
                          {detailData.has_vehicle_registration ? 'RC Available' : 'No RC'}
                        </div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Smartphone</div>
                        <div className={styles.infoValue}>
                          {detailData.has_smartphone ? 'Yes (4G/5G Phone)' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Uploaded Identity Documents & Numbers */}
                  <div className={styles.cardSection}>
                    <h3 className={styles.sectionHeading}>Identity Numbers &amp; Uploaded Documents</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                      <div>
                        <div className={styles.infoLabel}>Aadhaar Card Number</div>
                        <div className={styles.infoValue}>
                          {detailData.aadhaar_number
                            ? `XXXX-XXXX-${detailData.aadhaar_number.replace(/\s+/g, '').slice(-4)}`
                            : 'Submitted via Document'}
                        </div>
                      </div>
                      <div>
                        <div className={styles.infoLabel}>PAN Card Number</div>
                        <div className={styles.infoValue}>
                          {detailData.pan_number || 'Submitted via Document'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {detailData.documents.map((doc) => (
                        <div key={doc.id} className={styles.docItem}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                              {doc.document_type} Card
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              {(doc.file_size / 1024).toFixed(0)} KB &bull; Encrypted
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDoc(doc.id)}
                            className={styles.docBtn}
                          >
                            View Document
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Streamlined Actions */}
                  <div className={styles.cardSection}>
                    <h3 className={styles.sectionHeading}>Recruiter Decision &amp; Kotak Status</h3>
                    <div className={styles.actionRow}>
                      <div>
                        <label className={styles.infoLabel}>Application Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                          className={styles.actionSelect}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleUpdateStatus}
                          className={styles.applyActionBtn}
                        >
                          Save Status
                        </button>
                      </div>

                      <div>
                        <label className={styles.infoLabel}>Kotak Mahindra Bank Status</label>
                        <select
                          value={selectedKotakStatus}
                          onChange={(e) => setSelectedKotakStatus(e.target.value as KotakAccountStatus)}
                          className={styles.actionSelect}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Completion Awaited">Completion Awaited</option>
                          <option value="Failed">Failed</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleUpdateKotak}
                          className={styles.applyActionBtn}
                        >
                          Save Kotak Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
