'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './admin.module.css';
import { DeliveryPartnerApplication, AdminApplicationDetail, ApplicationStatus, KotakAccountStatus } from '@/types';

export default function AdminPage() {
  // Authentication states
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Login form state
  const [emailInput, setEmailInput] = useState<string>('Partners@admin.com');
  const [passwordInput, setPasswordInput] = useState<string>('Delivery#511');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Application data states
  const [applications, setApplications] = useState<DeliveryPartnerApplication[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kotakFilter, setKotakFilter] = useState<string>('ALL');

  // Selected detail modal
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AdminApplicationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Status controls
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('Under Review');
  const [selectedKotakStatus, setSelectedKotakStatus] = useState<KotakAccountStatus>('Completed');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // Initial authentication check from cookie or stored session
  useEffect(() => {
    const checkInitialAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dropyhub_admin_token') : null;
        const testKey = savedToken || 'dropyhub_admin_secure_key_2026';

        const res = await fetch('/api/admin/applications?limit=1', {
          headers: { 'x-admin-key': testKey },
          credentials: 'include',
        });

        if (res.ok) {
          setIsAuthenticated(true);
          setAdminToken(testKey);
        } else {
          setIsAuthenticated(false);
          if (typeof window !== 'undefined') localStorage.removeItem('dropyhub_admin_token');
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkInitialAuth();
  }, []);

  // Fetch applications when authenticated or filters change
  const fetchApplications = async () => {
    setIsLoading(true);
    setError('');

    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dropyhub_admin_token') : null;
      const key = adminToken || savedToken || 'dropyhub_admin_secure_key_2026';

      const params = new URLSearchParams({
        limit: '100',
      });
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (kotakFilter !== 'ALL') params.set('kotakStatus', kotakFilter);

      const res = await fetch(`/api/admin/applications?${params.toString()}`, {
        headers: {
          'x-admin-key': key,
          'x-admin-name': 'Recruiter',
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') localStorage.removeItem('dropyhub_admin_token');
        throw new Error('Admin session expired. Please sign in again.');
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
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated, statusFilter, kotakFilter]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Authentication failed. Please check your credentials.');
      }

      const token = json.token || 'dropyhub_admin_secure_key_2026';
      setAdminToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dropyhub_admin_token', token);
      }
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dropyhub_admin_token');
    }
    setAdminToken('');
    setIsAuthenticated(false);
    setApplications([]);
    setSelectedAppId(null);
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedAppId(id);
    setIsDetailLoading(true);
    setActionMessage('');

    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dropyhub_admin_token') : null;
      const key = adminToken || savedToken || 'dropyhub_admin_secure_key_2026';

      const res = await fetch(`/api/admin/applications/${id}`, {
        headers: { 'x-admin-key': key },
        credentials: 'include',
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
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dropyhub_admin_token') : null;
      const key = adminToken || savedToken || 'dropyhub_admin_secure_key_2026';

      const res = await fetch(`/api/admin/applications/${selectedAppId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
          'x-admin-name': 'Recruitment Lead',
        },
        credentials: 'include',
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
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dropyhub_admin_token') : null;
      const key = adminToken || savedToken || 'dropyhub_admin_secure_key_2026';

      const res = await fetch(`/api/admin/applications/${selectedAppId}/kotak-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
          'x-admin-name': 'Recruitment Lead',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: selectedKotakStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update Kotak status.');

      setDetailData(json.application);
      setActionMessage(`Kotak 811 banking status updated to "${selectedKotakStatus}".`);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Kotak status update failed.');
    }
  };

  const handleViewDoc = (docId: string) => {
    const key = adminToken || 'dropyhub_admin_secure_key_2026';
    window.open(`/api/admin/documents/${docId}?adminKey=${encodeURIComponent(key)}`, '_blank');
  };

  const handleDownloadDoc = (docId: string) => {
    const key = adminToken || 'dropyhub_admin_secure_key_2026';
    window.open(`/api/admin/documents/${docId}?adminKey=${encodeURIComponent(key)}&download=true`, '_blank');
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

  const getKotakBadge = (status: KotakAccountStatus) => {
    switch (status) {
      case 'Completed':
        return styles.kotakBadgeCompleted;
      case 'Failed':
        return styles.kotakBadgePending;
      default:
        return styles.kotakBadgeAwaited;
    }
  };

  // If loading session check
  if (isCheckingAuth) {
    return (
      <div className={styles.loginWrapper}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Verifying Admin Session...</div>
        </div>
      </div>
    );
  }

  // If NOT authenticated, show the Login Card!
  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogoWrapper}>
              <Image
                src="/assets/Home/Dropyhub_logo.png"
                alt="DropyHub Logo"
                width={140}
                height={40}
                unoptimized
                style={{ height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <h1 className={styles.loginTitle}>Recruiter Operations Console</h1>
            <p className={styles.loginSubtitle}>
              Sign in with authorized administrator credentials to review candidates, inspect documents, and manage Kotak 811 verification.
            </p>
          </div>

          {loginError && (
            <div className={styles.loginErrorMsg}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Recruiter Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Partners@admin.com"
                className={styles.fieldInput}
                autoComplete="email"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Security Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Delivery#511"
                className={styles.fieldInput}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={styles.loginSubmitBtn}
            >
              {isLoggingIn ? (
                'Signing In...'
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Metrics
  const totalApplicants = applications.length;
  const underReviewCount = applications.filter((a) => a.application_status === 'Under Review').length;
  const approvedCount = applications.filter((a) => a.application_status === 'Approved').length;
  const kotakCompletedCount = applications.filter((a) => a.kotak_account_status === 'Completed').length;
  const kotakPendingCount = applications.filter((a) => a.kotak_account_status === 'Pending').length;

  return (
    <div className={styles.adminContainer}>
      {/* Top Header - No Passkey Box! */}
      <div className={styles.topHeader}>
        <div className={styles.titleArea}>
          <span className={styles.portalBadge}>Recruitment &amp; Operations Center</span>
          <h1 className={styles.title}>
            Delivery Partner Management
            <span className={styles.livePill}>Live Neon DB Connected</span>
          </h1>
          <div className={styles.subtitle}>
            Review applicant identities, verify Aadhaar/PAN cards, and manage mandatory Kotak 811 payroll statuses.
          </div>
        </div>

        <div className={styles.userControlGroup}>
          <div className={styles.userBadge}>
            <span className={styles.userDot} />
            <span>Signed in: <strong>Partners@admin.com</strong></span>
          </div>

          <button type="button" onClick={fetchApplications} className={styles.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* KPI Stats Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Real Applicants</div>
          <div className={styles.metricVal}>{totalApplicants}</div>
          <div className={styles.metricSub}>Active verified submissions</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Under Review</div>
          <div className={styles.metricVal} style={{ color: '#0284c7' }}>{underReviewCount}</div>
          <div className={styles.metricSub}>Recruiter follow-up queue</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Approved Partners</div>
          <div className={styles.metricVal} style={{ color: '#16a34a' }}>{approvedCount}</div>
          <div className={styles.metricSub}>Ready for hub dispatch</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Kotak 811 Completed</div>
          <div className={styles.metricVal} style={{ color: '#16a34a' }}>{kotakCompletedCount}</div>
          <div className={styles.metricSub}>Bank account verified</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Kotak 811 Pending</div>
          <div className={styles.metricVal} style={{ color: '#dc2626' }}>{kotakPendingCount}</div>
          <div className={styles.metricSub}>Pending candidate action</div>
        </div>
      </div>

      {/* Toolbar / Search / Filter */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search candidate name, mobile, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Application Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={kotakFilter}
            onChange={(e) => setKotakFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Kotak 811 Statuses</option>
            <option value="Completed">Kotak 811: Completed</option>
            <option value="Pending">Kotak 811: Pending</option>
            <option value="Completion Awaited">Kotak 811: Awaited</option>
            <option value="Failed">Kotak 811: Failed</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Contact Details</th>
              <th>Delivery Tracks</th>
              <th>Work &amp; Vehicle</th>
              <th>Kotak 811 Banking</th>
              <th>Application Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  Loading candidate database...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  No candidate records match your current criteria.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className={styles.candidateCell}>
                      <span className={styles.candidateName}>{app.full_name}</span>
                      <span className={styles.refTag}>{app.application_reference}</span>
                    </div>
                  </td>
                  <td>
                    <div><strong>{app.mobile_number}</strong></div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{app.email}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{app.city}, {app.state}</div>
                  </td>
                  <td>
                    {app.delivery_categories.map((c) => (
                      <span key={c} className={styles.categoryTag}>
                        {c === 'food_quick_commerce' ? 'Food & Quick' : 'Logistics'}
                      </span>
                    ))}
                  </td>
                  <td>
                    <div><strong>{app.work_type}</strong></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: app.owns_two_wheeler ? '#15803d' : '#b45309' }}>
                      {app.owns_two_wheeler ? '✓ Owns Two-Wheeler' : '! Needs Fleet Bike'}
                    </span>
                  </td>
                  <td>
                    <span className={getKotakBadge(app.kotak_account_status)}>
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
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(app.id)}
                        className={styles.viewBtn}
                      >
                        Inspect Details
                      </button>
                    </div>
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
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading full candidate profile...
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div>
                    <h2 className={styles.modalTitle}>{detailData.full_name}</h2>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Reference ID: <strong>{detailData.application_reference}</strong> &bull; Submitted on{' '}
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
                    aria-label="Close modal"
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
                    <h3 className={styles.sectionHeading}>Work Preferences &amp; Vehicle Readiness</h3>
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
                          {detailData.owns_two_wheeler ? 'Yes (Owns Two-Wheeler)' : 'No (Needs Fleet Bike)'}
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
                    <h3 className={styles.sectionHeading}>Mandatory Identity Documents &amp; Verification</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div className={styles.infoLabel}>Aadhaar Card Number</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em' }}>
                          {detailData.aadhaar_number
                            ? `XXXX-XXXX-${detailData.aadhaar_number.replace(/\s+/g, '').slice(-4)}`
                            : 'Submitted with Document'}
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div className={styles.infoLabel}>PAN Card Number</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em' }}>
                          {detailData.pan_number || 'Submitted with Document'}
                        </div>
                      </div>
                    </div>

                    <div className={styles.docsList}>
                      {detailData.documents.map((doc) => (
                        <div key={doc.id} className={styles.docItem}>
                          <div>
                            <div className={styles.docMetaTitle}>
                              {doc.document_type} Document
                            </div>
                            <div className={styles.docMetaSub}>
                              {doc.original_file_name} &bull; {(doc.file_size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                          <div className={styles.docButtons}>
                            <button
                              type="button"
                              onClick={() => handleViewDoc(doc.id)}
                              className={styles.docViewBtn}
                              title="Open document in new browser tab"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDoc(doc.id)}
                              className={styles.docDownloadBtn}
                              title="Download document file directly"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Recruiter Decision & Kotak 811 Status */}
                  <div className={styles.cardSection}>
                    <h3 className={styles.sectionHeading}>Recruiter Decision &amp; Kotak 811 Management</h3>
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
                        {selectedStatus === 'Rejected' && (
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            style={{
                              width: '100%',
                              marginTop: 8,
                              padding: '8px 12px',
                              border: '1px solid #fca5a5',
                              borderRadius: 4,
                              fontSize: 12.5,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={handleUpdateStatus}
                          className={styles.applyActionBtn}
                        >
                          Save Application Status
                        </button>
                      </div>

                      <div>
                        <label className={styles.infoLabel}>Kotak 811 Banking Status</label>
                        <select
                          value={selectedKotakStatus}
                          onChange={(e) => setSelectedKotakStatus(e.target.value as KotakAccountStatus)}
                          className={styles.actionSelect}
                        >
                          <option value="Pending">Pending (Not Started)</option>
                          <option value="Completed">Completed (Account Verified)</option>
                          <option value="Completion Awaited">Completion Awaited</option>
                          <option value="Failed">Failed (KYC Incomplete)</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleUpdateKotak}
                          className={styles.applyActionBtn}
                        >
                          Save Kotak 811 Status
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
