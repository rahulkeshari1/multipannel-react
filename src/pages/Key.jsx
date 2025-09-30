import React, { useState, useEffect, lazy } from "react";
// MUI Material imports
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// MUI Icons imports
import KeyIcon from "@mui/icons-material/VpnKey";
import UserIcon from "@mui/icons-material/AccountCircle";
import CopyIcon from "@mui/icons-material/ContentCopy";
import ViewIcon from "@mui/icons-material/Visibility";
import HideIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DateIcon from "@mui/icons-material/DateRange";
import CalendarIcon from "@mui/icons-material/CalendarToday";

import axios from "axios";
import { useAuth } from "../context/AuthContext";
const  ResetFloatingIcon = lazy(() => import('../components/ResetFloatingIcon'))


const Keys = () => {
  const [keysData, setKeysData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    range: "all",
    start_date: "",
    end_date: "",
  });
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [openProvidersDialog, setOpenProvidersDialog] = useState(false);

  const handleCloseProvidersDialog = () => setOpenProvidersDialog(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchKeysData();
  }, [page, rowsPerPage, dateFilter]);

  const fetchKeysData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Build query parameters
      const params = new URLSearchParams({
        page: page,
        limit: rowsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(dateFilter.start_date && { start_date: dateFilter.start_date }),
        ...(dateFilter.end_date && { end_date: dateFilter.end_date }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/dashboard/my-sold-keys?${params}`,
        { headers }
      );

      if (response.data.success) {
        setKeysData(response.data);
      }
    } catch (err) {
      console.error("Error fetching keys data:", err);
      setError(err.response?.data?.error || "Failed to load keys data");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setPage(1);
    fetchKeysData();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDateFilter({
      range: "all",
      start_date: "",
      end_date: "",
    });
    setPage(1);
  };

  const handleDateRangeChange = (range) => {
    setDateFilter((prev) => ({
      ...prev,
      range,
    }));

    const today = new Date();
    let startDate = "";
    let endDate = "";

    switch (range) {
      case "today":
        startDate = today.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = yesterday.toISOString().split("T")[0];
        endDate = yesterday.toISOString().split("T")[0];
        break;
      case "last7":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        startDate = last7.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "last30":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        startDate = last30.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "lastMonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        startDate = firstDayLastMonth.toISOString().split("T")[0];
        endDate = lastDayLastMonth.toISOString().split("T")[0];
        break;
      default:
        break;
    }

    if (range !== "custom" && range !== "all") {
      setDateFilter((prev) => ({
        ...prev,
        start_date: startDate,
        end_date: endDate,
      }));
    } else if (range === "all") {
      setDateFilter((prev) => ({
        ...prev,
        start_date: "",
        end_date: "",
      }));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shortenKeyCode = (keyCode) => {
    if (keyCode.length > 20) {
      return `${keyCode.substring(0, 10)}...${keyCode.substring(
        keyCode.length - 10
      )}`;
    }
    return keyCode;
  };

  const toggleKeyVisibility = (keyId) => {
    setRevealedKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You could add a toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleProviderExpand = (providerId) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

  const isOwner = user?.role === "owner";

  const totalProfit =
    isOwner && keysData?.data?.provider_stats
      ? keysData.data.provider_stats.reduce(
          (total, provider) => total + (provider.total_profit || 0),
          0
        )
      : 0;

  const totalRevenue =
    isOwner && keysData?.data?.provider_stats
      ? keysData.data.provider_stats.reduce(
          (total, provider) => total + (provider.total_revenue || 0),
          0
        )
      : 0;

  const totalCost =
    isOwner && keysData?.data?.provider_stats
      ? keysData.data.provider_stats.reduce(
          (total, provider) => total + (provider.total_cost || 0),
          0
        )
      : 0;

  if (loading && !isSearching) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 1 : 3} sx={{ paddingBottom: "70px" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        {/* Left side: Title */}
        <Box display="flex" alignItems="center">
          <KeyIcon
            sx={{ mr: 1, fontSize: 32, color: theme.palette.primary.main }}
          />
          <Typography variant="h5" fontWeight="bold" color="text.glass">
            My Keys
          </Typography>
        </Box>

        {/* Right side: Dropdown-style Button */}
        {keysData?.data?.provider_stats?.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            endIcon={<ExpandMoreIcon />}
            onClick={() => setOpenProvidersDialog(true)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              px: 2,
              py: 1,
            }}
          >
            Providers
          </Button>
        )}
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 1,
              background: theme.palette.background.glass,
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: theme.shadows[8],
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sold Keys
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="text.glass">
                {keysData?.data.pagination.total_items || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional stats for non-owner users */}
        {!isOwner && keysData?.data?.user_performance && (
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: theme.shadows[8],
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Your Revenue
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  ₹{keysData.data.user_performance.total_revenue || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {!isOwner && keysData?.data?.provider_stats?.length > 0 && (
          <Dialog
            open={openProvidersDialog}
            onClose={handleCloseProvidersDialog}
            fullScreen
          >
            <DialogTitle>Provider Statistics</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                {keysData.data.provider_stats.map((provider) => (
                  <Grid key={provider.provider_id} size={{ xs: 12 }}>
                    <Accordion
                      expanded={expandedProvider === provider.provider_id}
                      onChange={() =>
                        handleProviderExpand(provider.provider_id)
                      }
                      sx={{
                        background: theme.palette.background.glass,
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: theme.shadows[8],
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {provider.provider_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {provider.total_sold} keys sold
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {provider.plans.map((plan, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1,
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              "&:last-child": { borderBottom: "none" },
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {plan.plan_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {plan.sold_count} sold
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={theme.palette.success.main}
                              >
                                ₹{plan.total_revenue}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Revenue
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseProvidersDialog} color="secondary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Additional stats for owner */}
        {isOwner && (
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 1,
                background: theme.palette.background.glass,
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: theme.shadows[8],
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Profit
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.glass">
                  ₹{totalProfit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={openProvidersDialog}
        onClose={handleCloseProvidersDialog}
        fullScreen
      >
        <DialogTitle>Provider Statistics</DialogTitle>

        <DialogContent dividers
          sx={{
    overflowY: 'auto',     
    overflowX: 'hidden',  
  }}
        >
          <Grid container spacing={2}>
            {keysData.data.provider_stats.map((provider) => (
              <Grid key={provider.provider_id} size={{ xs: 12 }}>
                <Accordion
                  expanded={expandedProvider === provider.provider_id}
                  onChange={() => handleProviderExpand(provider.provider_id)}
                  sx={{
                    background: theme.palette.background.glass,
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: theme.shadows[8],
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {provider.provider_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {provider.total_sold} keys sold
                      </Typography>

                      {/* Owner-only extra stats */}
                      {isOwner && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mt: 0.5 }}
                        >
                          Revenue: ₹{provider.total_revenue} | Cost: ₹
                          {provider.total_cost} | Profit: ₹
                          {provider.total_profit}
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    {provider.plans.map((plan, planIndex) => (
                      <Box
                        key={planIndex}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        {/* Left side - Plan Info */}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {plan.plan_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {plan.sold_count} sold
                          </Typography>

                          {isOwner && (
                            <Typography variant="caption" color="textSecondary">
                              Revenue: ₹{plan.total_revenue} | Cost: ₹
                              {plan.total_cost}
                            </Typography>
                          )}
                        </Box>

                        {/* Right side - Profit or Revenue */}
                        <Box textAlign="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={theme.palette.success.main}
                          >
                            ₹{isOwner ? plan.total_profit : plan.total_revenue}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {isOwner ? "Profit" : "Revenue"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseProvidersDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        sx={{
          mb: 2,
          borderRadius: 1,
          background: theme.palette.background.glass,
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: theme.shadows[8],
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          p={2}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              mr: isMobile ? 0 : 2,
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SearchIcon color="primary" />
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            sx={{ mb: isMobile ? 2 : 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: theme.palette.text.glass,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
              },
            }}
          />

          <Box
            display="flex"
            ml={isMobile ? 0 : 1}
            width={isMobile ? "100%" : "auto"}
            mt={isMobile ? 0 : 0}
          >
            <Tooltip title="Date Filters">
              <Button
                variant="outlined"
                onClick={() => setFiltersOpen(true)}
                startIcon={<DateIcon />}
                sx={{ mr: 2 }}
              >
                Date
              </Button>
            </Tooltip>

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching}
              startIcon={
                isSearching ? <CircularProgress size={16} /> : <SearchIcon />
              }
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </Box>
        </Box>
      </Card>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Date Filters
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter.range}
                label="Date Range"
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last7">Last 7 Days</MenuItem>
                <MenuItem value="last30">Last 30 Days</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {dateFilter.range === "custom" && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilter.start_date}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start_date: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilter.end_date}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end_date: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setFiltersOpen(false);
              handleSearch();
            }}
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {keysData && (
        <>
          {/* Keys Table */}
          <Paper
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 1,
              background: theme.palette.background.glass,
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: theme.shadows[8],
            }}
          >
            <TableContainer sx={{ maxHeight: "100vh" }}>
              <Table stickyHeader aria-label="sold keys table">
                <TableHead>
                  <TableRow
                    sx={{ background: "rgba(19, 19, 19, 0.8)", padding: 0 }}
                  >
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Key
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Plan
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Duration
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Date
                    </TableCell>
                    {isOwner && (
                      <TableCell
                        sx={{
                          color: theme.palette.text.glass,
                          fontWeight: 600,
                        }}
                      >
                        Sold By
                      </TableCell>
                    )}
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ color: theme.palette.text.glass, fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keysData.data.keys.map((key) => (
                    <TableRow
                      key={key.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <KeyIcon
                            sx={{ mr: 1, color: theme.palette.primary.main }}
                          />
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            sx={{
                              filter: revealedKeys[key.id]
                                ? "none"
                                : "blur(4px)",
                              transition: "filter 0.2s ease",
                            }}
                          >
                            {isMobile
                              ? shortenKeyCode(key.key_code)
                              : key.key_code}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" color="text.glass">
                            {key.provider}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{key.duration}</TableCell>
                      <TableCell>
                        <Typography
                          fontWeight="bold"
                          color={theme.palette.primary.main}
                        >
                          ₹{key.price}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(key.sold_at)}</TableCell>
                      {isOwner && (
                        <TableCell>
                          {key.sold_by ? (
                            <Box display="flex" alignItems="center">
                              <UserIcon
                                sx={{
                                  mr: 1,
                                  fontSize: 20,
                                  color: theme.palette.secondary.main,
                                }}
                              />
                              <Box>
                                <Typography variant="body2" color="text.glass">
                                  {key.sold_by.name}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={key.status}
                          color={key.status === "sold" ? "success" : "default"}
                          size="small"
                          sx={{
                            background:
                              key.status === "sold"
                                ? alpha(theme.palette.success.main, 0.2)
                                : alpha(theme.palette.grey[500], 0.2),
                            color:
                              key.status === "sold"
                                ? theme.palette.success.main
                                : theme.palette.grey[500],
                            border: `1px solid ${
                              key.status === "sold"
                                ? alpha(theme.palette.success.main, 0.3)
                                : alpha(theme.palette.grey[500], 0.3)
                            }`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip
                            title={
                              revealedKeys[key.id] ? "Hide key" : "Reveal key"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => toggleKeyVisibility(key.id)}
                              sx={{
                                color: theme.palette.primary.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              {revealedKeys[key.id] ? (
                                <HideIcon />
                              ) : (
                                <ViewIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy key">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(key.key_code)}
                              sx={{
                                color: theme.palette.secondary.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.secondary.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={keysData.data.pagination.total_items}
              rowsPerPage={rowsPerPage}
              page={keysData.data.pagination.current_page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: theme.palette.text.glass,
                "& .MuiTablePagination-selectIcon": {
                  color: theme.palette.text.glass,
                },
              }}
            />
          </Paper>
        </>
      )}

        <ResetFloatingIcon 
        position="right"
      />
    </Box>
  );
};

export default Keys;
