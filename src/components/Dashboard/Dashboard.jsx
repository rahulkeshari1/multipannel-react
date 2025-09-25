import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { darken } from "@mui/material/styles";

import PeopleIcon from "@mui/icons-material/People";
import KeyIcon from "@mui/icons-material/VpnKey";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import BalanceIcon from "@mui/icons-material/AccountBalance";
import TransactionIcon from "@mui/icons-material/SwapHoriz";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HistoryIcon from "@mui/icons-material/History";
import ProviderIcon from "@mui/icons-material/Store";
import StarIcon from "@mui/icons-material/Star";
import AdminIcon from "@mui/icons-material/AdminPanelSettings";
import ResellerIcon from "@mui/icons-material/Person";
import OwnerIcon from "@mui/icons-material/Business";
import SalesIcon from "@mui/icons-material/ShoppingCart";
import ReferralIcon from "@mui/icons-material/AccountTree";

import axios from "axios";
import GridViewIcon from "@mui/icons-material/GridView";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Time filter options
  const timeFilterOptions = [
    { value: "1days", label: "Today" },
    { value: "7days", label: "7 Days" },
    { value: "15days", label: "15 Days" },
    { value: "1month", label: "1 Month" },
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "1year", label: "1 Year" },
  ];

  useEffect(() => {
    // Try to load cached data first
    const cachedDashboardData = sessionStorage.getItem(
      `dashboardData_${timeFilter}`
    );
    const cachedDetailedData = sessionStorage.getItem(
      `detailedData_${timeFilter}`
    );

    if (cachedDashboardData) {
      setDashboardData(JSON.parse(cachedDashboardData));

      if (cachedDetailedData) {
        setDetailedData(JSON.parse(cachedDetailedData));
      }

      // Still fetch fresh data in the background
      fetchDashboardData();
    } else {
      // No cached data, fetch fresh
      fetchDashboardData();
    }
  }, [timeFilter]);

  const fetchDashboardData = async () => {
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

      // Fetch summary data
      const dashboardResponse = await axios.get(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }/dashboard?time_filter=${timeFilter}`,
        { headers }
      );

      if (dashboardResponse.data.success) {
        const data = dashboardResponse.data;
        setDashboardData(data);
        // Cache the data
        sessionStorage.setItem(
          `dashboardData_${timeFilter}`,
          JSON.stringify(data)
        );
      }

      // Fetch detailed data - only for admin and reseller roles
      if (dashboardResponse.data.user_role !== "ownner") {
        try {
          const detailedResponse = await axios.get(
            `${
              import.meta.env.VITE_APP_BASE_URL
            }/dashboard/detailed?time_filter=${timeFilter}`,
            { headers }
          );

          if (detailedResponse.data.success) {
            const data = detailedResponse.data;
            setDetailedData(data);
            // Cache the data
            sessionStorage.setItem(
              `detailedData_${timeFilter}`,
              JSON.stringify(data)
            );
          }
        } catch (detailedErr) {
          console.error("Error fetching detailed data:", detailedErr);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Role-based avatar icons
  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <OwnerIcon />;
      case "admin":
        return <AdminIcon />;
      case "reseller":
        return <ResellerIcon />;
      default:
        return <PeopleIcon />;
    }
  };

  // Helper function to darken colors for gradients
  const getDarkenedColor = (color) => {
    return darken(color, 0.3);
  };

  // Stats cards for all roles
  const StatCard = ({ title, value, icon, color }) => (
    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
      <Card
        sx={{
          height: "100%",
          minHeight: 140,
          width: "100%",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(17, 25, 40, 0.75) 0%, rgba(25, 35, 55, 0.75) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)",
          backdropFilter: "blur(16px) saturate(180%)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.125)"
              : "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.36)"
              : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&: hover": {
            transform: "translateY(-5px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 12px 40px 0 rgba(0, 0, 0, 0.5)"
                : "0 12px 40px 0 rgba(31, 38, 135, 0.25)",
          },
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="overline"
                sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                ml: 1,
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${color} 0%, ${getDarkenedColor(
                        color
                      )} 100%)`
                    : color,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  if (loading && !dashboardData) {
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
    <Box p={isMobile ? 1 : 3} sx={{ marginBottom: 10 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <GridViewIcon sx={{ mr: 1 }} />
          Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeFilter}
            onChange={handleTimeFilterChange}
            displayEmpty
            inputProps={{ "aria-label": "time filter" }}
          >
            {timeFilterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {dashboardData && (
        <>
          <Typography variant="subtitle1" color="textSecondary" mb={2}>
            Showing data for the last{" "}
            {timeFilterOptions
              .find((opt) => opt.value === timeFilter)
              ?.label.toLowerCase()}
          </Typography>

          {/* Summary Statistics */}
          <Grid container spacing={2} mb={4}>
            {dashboardData.user_role === "owner" ? (
              // Owner view stats
              <>
                <StatCard
                  title="Total Users"
                  value={dashboardData.data.total_users}
                  icon={<PeopleIcon />}
                  color={theme.palette.primary.main}
                />
                <StatCard
                  title="Sold Keys"
                  value={dashboardData.data.sold_keys}
                  icon={<KeyIcon />}
                  color={theme.palette.success.main}
                />
                <StatCard
                  title="Unsold Keys"
                  value={dashboardData.data.unsold_keys}
                  icon={<KeyIcon />}
                  color={theme.palette.warning.main}
                />
                <StatCard
                  title="Total Revenue"
                  value={`₹${dashboardData.data.total_revenue}`}
                  icon={<MoneyIcon />}
                  color={theme.palette.info.main}
                />
                <StatCard
                  title="Total Cost"
                  value={`₹${dashboardData.data.total_cost}`}
                  icon={<BalanceIcon />}
                  color={theme.palette.error.main}
                />
                <StatCard
                  title="Total Profit"
                  value={`₹${dashboardData.data.total_profit}`}
                  icon={<TrendingUpIcon />}
                  color={theme.palette.success.main}
                />
                <StatCard
                  title="Total Recharge"
                  value={`₹${dashboardData.data.total_recharge}`}
                  icon={<WalletIcon />}
                  color={theme.palette.secondary.main}
                />
                <StatCard
                  title="Total Transactions"
                  value={dashboardData.data.total_transactions}
                  icon={<TransactionIcon />}
                  color={theme.palette.info.main}
                />
              </>
            ) : dashboardData.user_role === "admin" ? (
              // Admin view stats (no revenue data)
              <>
                <StatCard
                  title="Referred Users"
                  value={dashboardData.data.referred_users}
                  icon={<PeopleIcon />}
                  color={theme.palette.primary.main}
                />
                <StatCard
                  title="Sold Keys"
                  value={dashboardData.data.sold_keys}
                  icon={<KeyIcon />}
                  color={theme.palette.success.main}
                />
            
                <StatCard
                  title="Total Recharge"
                  value={`₹${dashboardData.data.total_recharge}`}
                  icon={<WalletIcon />}
                  color={theme.palette.secondary.main}
                />
                <StatCard
                  title="Total Transactions"
                  value={dashboardData.data.total_transactions}
                  icon={<TransactionIcon />}
                  color={theme.palette.info.main}
                />
                <StatCard
                  title="Wallet Balance"
                  value={`₹${dashboardData.data.wallet_balance}`}
                  icon={<BalanceIcon />}
                  color={theme.palette.success.main}
                />

                 <StatCard
                  title="Total Bonus"
                  value={
          dashboardData?.data?.bonus?.find(b => b.type === 'bonus_earned')?.value || 0
                  
                  }
                  icon={<KeyIcon />}
                  color={theme.palette.warning.main}
                />

                  <StatCard
                  title="Claimed Bonus "
                  value={
          dashboardData?.data?.bonus?.find(b => b.type === 'bonus_claimed')?.value || 0
                  
                  }
                  color={theme.palette.warning.main}
                />

                   <StatCard
                  title="Available Bonus"
                  value={
          dashboardData?.data?.bonus?.find(b => b.type === 'available_bonus')?.value || 0
                  
                  }
                  icon={<KeyIcon />}
                  color={theme.palette.warning.main}
                />
              </>
            ) : (
              // Reseller view stats (no revenue data)
              <>
                <StatCard
                  title="Sold Keys"
                  value={dashboardData.data.sold_keys}
                  icon={<KeyIcon />}
                  color={theme.palette.success.main}
                />
                <StatCard
                  title="Total Recharge"
                  value={`₹${dashboardData.data.total_recharge}`}
                  icon={<WalletIcon />}
                  color={theme.palette.secondary.main}
                />
                <StatCard
                  title="Total Transactions"
                  value={dashboardData.data.total_transactions}
                  icon={<TransactionIcon />}
                  color={theme.palette.info.main}
                />
                <StatCard
                  title="Wallet Balance"
                  value={`₹${dashboardData.data.wallet_balance}`}
                  icon={<BalanceIcon />}
                  color={theme.palette.success.main}
                />
              </>
            )}
          </Grid>

          {/* Additional sections for owner role */}
          {dashboardData.user_role === "owner" &&
            dashboardData.data.provider_stats && (
              <Grid container spacing={2} mb={4}>
                <Grid size={12}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(17, 25, 40, 0.75) 0%, rgba(25, 35, 55, 0.75) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.125)"
                          : "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 8px 32px 0 rgba(0, 0, 0, 0.36)"
                          : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <ProviderIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Provider Statistics</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {dashboardData.data.provider_stats.map(
                        (provider, index) => (
                          <Grid
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={provider.id}
                          >
                            <Card
                              sx={{
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                height: "100%",
                                background:
                                  theme.palette.mode === "dark"
                                    ? "rgba(17, 25, 40, 0.5)"
                                    : "rgba(255, 255, 255, 0.7)",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                              >
                                {provider.name}
                              </Typography>
                              <Box
                                display="flex"
                                justifyContent="space-around"
                                width="100%"
                                mt={1}
                              >
                                <Box textAlign="center">
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Sold
                                  </Typography>
                                  <Typography variant="h6" color="success.main">
                                    {provider.sold_keys}
                                  </Typography>
                                </Box>
                                <Box textAlign="center">
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Unsold
                                  </Typography>
                                  <Typography variant="h6" color="warning.main">
                                    {provider.unsold_keys}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}

          {/* Top Sellers Section */}
          {dashboardData.data.top_sellers &&
            dashboardData.data.top_sellers.length > 0 && (
              <Grid container spacing={2} mb={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      height: "100%",
                      background:
                        theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(17, 25, 40, 0.75) 0%, rgba(25, 35, 55, 0.75) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)",
                      backdropFilter: "blur(16px) saturate(180%)",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.125)"
                          : "1px solid rgba(255, 255, 255, 0.3)",
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 8px 32px 0 rgba(0, 0, 0, 0.36)"
                          : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <StarIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Top Sellers</Typography>
                    </Box>
                    <List>
                      {dashboardData.data.top_sellers.map((seller, index) => (
                        <React.Fragment key={seller.name + index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  background:
                                    theme.palette.mode === "dark"
                                      ? `linear-gradient(135deg, ${
                                          theme.palette.primary.main
                                        } 0%, ${getDarkenedColor(
                                          theme.palette.primary.main
                                        )} 100%)`
                                      : theme.palette.primary.main,
                                }}
                              >
                                {getRoleIcon(seller.role)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primaryTypographyProps={{ component: "div" }}
                              secondaryTypographyProps={{ component: "div" }}
                              primary={
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography variant="subtitle2">
                                    {seller.name}
                                  </Typography>
                                  <Chip
                                    label={`${seller.keys_sold} keys`}
                                    size="small"
                                    color={
                                      seller.keys_sold > 0
                                        ? "success"
                                        : "default"
                                    }
                                  />
                                </Box>
                              }
                              secondary={
                                <Chip
                                  label={seller.role}
                                  size="small"
                                  variant="outlined"
                                  color={
                                    seller.role === "admin"
                                      ? "primary"
                                      : "default"
                                  }
                                />
                              }
                            />
                          </ListItem>
                          {index <
                            dashboardData.data.top_sellers.length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Top Providers Section - Only for owners */}
                {["owner", "reseller", "admin"].includes(
                  dashboardData.user_role
                ) &&
                  dashboardData.data.top_providers && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          height: "100%",
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, rgba(17, 25, 40, 0.75) 0%, rgba(25, 35, 55, 0.75) 100%)"
                              : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)",
                          backdropFilter: "blur(16px) saturate(180%)",
                          border:
                            theme.palette.mode === "dark"
                              ? "1px solid rgba(255, 255, 255, 0.125)"
                              : "1px solid rgba(255, 255, 255, 0.3)",
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 8px 32px 0 rgba(0, 0, 0, 0.36)"
                              : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <ProviderIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Hot Selling</Typography>
                        </Box>
                        <List>
                          {dashboardData.data.top_providers.map(
                            (provider, index) => (
                              <React.Fragment key={provider.name + index}>
                                <ListItem alignItems="flex-start">
                                  <ListItemAvatar>
                                    <Avatar
                                      sx={{
                                        bgcolor: theme.palette.info.main,
                                        background:
                                          theme.palette.mode === "dark"
                                            ? `linear-gradient(135deg, ${
                                                theme.palette.info.main
                                              } 0%, ${getDarkenedColor(
                                                theme.palette.info.main
                                              )} 100%)`
                                            : theme.palette.info.main,
                                      }}
                                    >
                                      <ProviderIcon />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primaryTypographyProps={{
                                      component: "div",
                                    }}
                                    secondaryTypographyProps={{
                                      component: "div",
                                    }}
                                    primary={
                                      <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                      >
                                        <Typography variant="subtitle2">
                                          {provider.name}
                                        </Typography>
                                        <Chip
                                          label={`${provider.keys_sold} keys`}
                                          size="small"
                                          color={
                                            provider.keys_sold > 0
                                              ? "success"
                                              : "default"
                                          }
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Performance rating
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                                {index <
                                  dashboardData.data.top_providers.length -
                                    1 && (
                                  <Divider variant="inset" component="li" />
                                )}
                              </React.Fragment>
                            )
                          )}
                        </List>
                      </Paper>
                    </Grid>
                  )}
              </Grid>
            )}

          {/* Detailed Information for Admin and Reseller */}
          {(dashboardData.user_role === "admin" ||
            dashboardData.user_role === "reseller") &&
            detailedData && (
              <Box>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    mb: 2,
                    overflowX: "auto",
                    "& .MuiTabs-scroller": {
                      overflow: "auto !important",
                    },
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab icon={<SalesIcon />} label="My Sales" />
                  <Tab icon={<WalletIcon />} label="My Recharges" />
                </Tabs>

                {/* Admin/Reseller tab content remains the same */}
                {tabValue === 0 && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      My Sales
                    </Typography>
                    {detailedData.data.my_sales &&
                    detailedData.data.my_sales.length > 0 ? (
                      <List>
                        {detailedData.data.my_sales.map((sale, index) => (
                          <React.Fragment key={sale.id || index}>
                            <ListItem>
                              <ListItemText
                                primary={`Sale: ${sale.price || "N/A"}`}
                                secondary={` ${
                                  sale.ProviderPlan?.KeyProvider?.name ||
                                  "No description"
                                } | ${
                                  sale.ProviderPlan?.duration || "No duration"
                                }`}
                              />

                              <Typography variant="body2">
                                {sale.created_at
                                  ? new Date(
                                      sale.created_at
                                    ).toLocaleDateString()
                                  : "Unknown date"}
                              </Typography>
                            </ListItem>
                            {index < detailedData.data.my_sales.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No sales data available
                      </Typography>
                    )}
                  </Paper>
                )}

                {tabValue === 1 && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      My Recharges
                    </Typography>
                    {detailedData.data.my_recharges &&
                    detailedData.data.my_recharges.length > 0 ? (
                      <List>
                        {detailedData.data.my_recharges.map(
                          (recharge, index) => (
                            <React.Fragment key={recharge.id || index}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{ bgcolor: theme.palette.success.main }}
                                  >
                                    <WalletIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={`₹${recharge.amount} - ${recharge.description}`}
                                  secondary={`By: ${
                                    recharge.doneByUser?.name || "Unknown"
                                  } | ${new Date(
                                    recharge.created_at
                                  ).toLocaleDateString()}`}
                                />
                              </ListItem>
                              {index <
                                detailedData.data.my_recharges.length - 1 && (
                                <Divider variant="inset" />
                              )}
                            </React.Fragment>
                          )
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No recharge data available
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
            )}

          {dashboardData.user_role === "owner" && detailedData && (
            <Box>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  mb: 2,
                  overflowX: "auto",
                  "& .MuiTabs-scroller": {
                    overflow: "auto !important",
                  },
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<TransactionIcon />} label="Recent Transactions" />
                <Tab icon={<WalletIcon />} label="Recent Recharges" />
                <Tab icon={<PeopleIcon />} label="Recent Registrations" />
              </Tabs>

              {tabValue === 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Transactions
                  </Typography>
                  {detailedData.data.recent_transactions &&
                  detailedData.data.recent_transactions.length > 0 ? (
                    <List>
                      {detailedData.data.recent_transactions.map(
                        (transaction, index) => (
                          <React.Fragment key={transaction.id || index}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor:
                                      transaction.type === "recharge"
                                        ? theme.palette.success.main
                                        : theme.palette.info.main,
                                  }}
                                >
                                  <TransactionIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${transaction.type.toUpperCase()}: ₹${
                                  transaction.amount
                                }`}
                                secondary={`${transaction.description} | By: ${
                                  transaction.doneByUser?.name || "System"
                                } | ${new Date(
                                  transaction.created_at
                                ).toLocaleDateString()}`}
                              />
                            </ListItem>
                            {index <
                              detailedData.data.recent_transactions.length -
                                1 && <Divider variant="inset" />}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No transaction data available
                    </Typography>
                  )}
                </Paper>
              )}

              {tabValue === 1 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Recharges
                  </Typography>
                  {detailedData.data.recent_recharges &&
                  detailedData.data.recent_recharges.length > 0 ? (
                    <List>
                      {detailedData.data.recent_recharges.map(
                        (recharge, index) => (
                          <React.Fragment key={recharge.id || index}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{ bgcolor: theme.palette.success.main }}
                                >
                                  <WalletIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`₹${recharge.amount} - ${recharge.description}`}
                                secondary={`By: ${
                                  recharge.doneByUser?.name || "Unknown"
                                } | ${new Date(
                                  recharge.created_at
                                ).toLocaleDateString()}`}
                              />
                            </ListItem>
                            {index <
                              detailedData.data.recent_recharges.length - 1 && (
                              <Divider variant="inset" />
                            )}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recharge data available
                    </Typography>
                  )}
                </Paper>
              )}

              {tabValue === 2 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Registrations
                  </Typography>
                  {detailedData.data.recent_registrations &&
                  detailedData.data.recent_registrations.length > 0 ? (
                    <List>
                      {detailedData.data.recent_registrations.map(
                        (user, index) => (
                          <React.Fragment key={user.id || index}>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{ bgcolor: theme.palette.primary.main }}
                                >
                                  <PeopleIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={user.name || "Unknown User"}
                                secondary={`${
                                  user.email || "No email"
                                } | Role: ${user.role} | Joined: ${new Date(
                                  user.created_at
                                ).toLocaleDateString()}`}
                              />
                            </ListItem>
                            {index <
                              detailedData.data.recent_registrations.length -
                                1 && <Divider variant="inset" />}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No registration data available
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
