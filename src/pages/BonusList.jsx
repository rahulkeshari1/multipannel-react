import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Pagination,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Refresh,
  AccountCircle,
} from "@mui/icons-material";
import axios from "axios";

const BonusList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [processing, setProcessing] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    claimId: null,
    action: null,
    claimAmount: null,
    userName: null,
  });

  const statusMap = ["pending", "approved", "rejected"];
  const statusLabels = ["Pending", "Approved", "Rejected"];
  const statusColors = ["warning", "success", "error"];

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchClaims = useCallback(
    async (page = 1, status = "pending") => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/bonus/pending-claims`,
          {
            headers: getAuthHeaders(),
            params: {
              page,
              limit: pagination.limit,
              status,
            },
          }
        );

        if (response.data.success) {
          setClaims(response.data.claims);
          setPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
            page,
          }));
        }
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError(err.response?.data?.error || "Failed to load claims");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders, pagination.limit]
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    fetchClaims(1, statusMap[newValue]);
  };

  const handlePageChange = (event, page) => {
    fetchClaims(page, statusMap[activeTab]);
  };

  const handleApprove = async (claimId) => {
    try {
      setProcessing((prev) => ({ ...prev, [claimId]: "approving" }));
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/approve-withdrawal`,
        { claimId },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess("Claim approved successfully!");
        fetchClaims(pagination.page, statusMap[activeTab]);
      }
    } catch (err) {
      console.error("Error approving claim:", err);
      setError(err.response?.data?.error || "Failed to approve claim");
    } finally {
      setProcessing((prev) => ({ ...prev, [claimId]: false }));
      setConfirmDialog({ open: false, claimId: null, action: null });
    }
  };

  const handleReject = async (claimId) => {
    try {
      setProcessing((prev) => ({ ...prev, [claimId]: "rejecting" }));
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/bonus/reject-withdrawal`,
        { claimId },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setSuccess("Claim rejected successfully!");
        fetchClaims(pagination.page, statusMap[activeTab]);
      }
    } catch (err) {
      console.error("Error rejecting claim:", err);
      setError(err.response?.data?.error || "Failed to reject claim");
    } finally {
      setProcessing((prev) => ({ ...prev, [claimId]: false }));
      setConfirmDialog({ open: false, claimId: null, action: null });
    }
  };

  const openConfirmDialog = (claimId, action, claimAmount, userName) => {
    setConfirmDialog({
      open: true,
      claimId,
      action,
      claimAmount,
      userName,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, claimId: null, action: null });
  };

  const handleConfirmAction = () => {
    const { claimId, action } = confirmDialog;
    if (action === "approve") {
      handleApprove(claimId);
    } else if (action === "reject") {
      handleReject(claimId);
    }
  };

  useEffect(() => {
    fetchClaims(1, statusMap[activeTab]);
  }, [activeTab, fetchClaims]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" fontWeight="bold">
              Bonus Claims
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchClaims(pagination.page, statusMap[activeTab])}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Claimed Amount</TableCell>
                      <TableCell>Total Bonus</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Claimed At</TableCell>
                      <TableCell>Processed At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <AccountCircle
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {claim.user?.name || "Unknown User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {claim.user?.email || "No email"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{claim.claimed_amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ₹{claim.total_bonus}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={claim.status}
                            color={
                              statusColors[statusMap.indexOf(claim.status)] ||
                              "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(claim.claimed_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {claim.processed_at
                              ? formatDate(claim.processed_at)
                              : "Pending"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {claim.status === "pending" && (
                            <Box display="flex" gap={1}>
                              <IconButton
                                color="success"
                                onClick={() =>
                                  openConfirmDialog(
                                    claim.id,
                                    "approve",
                                    claim.claimed_amount,
                                    claim.user?.name
                                  )
                                }
                                disabled={processing[claim.id]}
                                size="small"
                              >
                                {processing[claim.id] === "approving" ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <CheckCircle />
                                )}
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() =>
                                  openConfirmDialog(
                                    claim.id,
                                    "reject",
                                    claim.claimed_amount,
                                    claim.user?.name
                                  )
                                }
                                disabled={processing[claim.id]}
                                size="small"
                              >
                                {processing[claim.id] === "rejecting" ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <Cancel />
                                )}
                              </IconButton>
                            </Box>
                          )}
                          {claim.status !== "pending" && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Processed
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {claims.length === 0 && (
                <Box display="flex" justifyContent="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No {statusLabels[activeTab].toLowerCase()} claims found
                  </Typography>
                </Box>
              )}

              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === "approve"
            ? "Approve Claim"
            : "Reject Claim"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {confirmDialog.action} the claim of{" "}
            <strong>₹{confirmDialog.claimAmount}</strong> by{" "}
            <strong>{confirmDialog.userName}</strong>?
          </Typography>
          {confirmDialog.action === "reject" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. The user will be notified of the
              rejection.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === "approve" ? "success" : "error"}
            variant="contained"
            disabled={processing[confirmDialog.claimId]}
          >
            {processing[confirmDialog.claimId] ? (
              <CircularProgress size={20} />
            ) : confirmDialog.action === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BonusList;
