import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  RefreshControl,
  StatusBar,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API from "../../services/api";
import { formatCurrency } from "../../utils/currency";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Status config ─────────────────────────────────────────────────
const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  "Pending Approval": { label: "Pending", color: "#D97706", bg: "#FEF3C7" },
  Approved: { label: "Approved", color: "#16A34A", bg: "#DCFCE7" },
  Rejected: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2" },
};

export default function AdminServiceRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Slip viewer modal state
  const [slipModal, setSlipModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const baseUrl =
    API.defaults.baseURL?.replace("/api", "") || "http://10.0.2.2:5000";

  const getFileUrl = (filePath: string) => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    return `${baseUrl}/${filePath.replace(/\\/g, "/")}`;
  };

  const isPdf = (url: string | null) =>
    !!url && url.toLowerCase().endsWith(".pdf");

  // ─── Fetch ─────────────────────────────────────────────────────
  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get("/service-payments");
      setRequests(res.data.servicePayments || []);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to load service requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests(true);
  };

  // ─── Open slip viewer ──────────────────────────────────────────
  const openSlip = (item: any) => {
    setViewingItem(item);
    setSlipModal(true);
  };

  // ─── Approve / Reject ──────────────────────────────────────────
  const handleAction = (
    id: string,
    action: "Approved" | "Rejected",
    fromModal = false
  ) => {
    const verb = action === "Approved" ? "approve" : "reject";
    Alert.alert(
      `${action === "Approved" ? "Approve" : "Reject"} Request`,
      `Are you sure you want to ${verb} this service request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "Approved" ? "Approve" : "Reject",
          style: action === "Approved" ? "default" : "destructive",
          onPress: async () => {
            setActionLoading(id);
            try {
              await API.put(`/service-payments/${id}/status`, {
                status: action,
              });
              setRequests((prev) =>
                prev.map((r) =>
                  r._id === id ? { ...r, status: action } : r
                )
              );
              // If actioning from inside the modal, close it and update viewingItem
              if (fromModal) {
                setViewingItem((prev: any) =>
                  prev ? { ...prev, status: action } : prev
                );
                setSlipModal(false);
              }
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message || `Failed to ${verb} request.`
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // ─── Slip Viewer Modal ─────────────────────────────────────────
  const renderSlipModal = () => {
    if (!viewingItem) return null;
    const slipUrl = getFileUrl(viewingItem.paymentSlip);
    const isPending = viewingItem.status === "Pending Approval";
    const isActioning = actionLoading === viewingItem._id;

    return (
      <Modal
        visible={slipModal}
        animationType="slide"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setSlipModal(false)}
      >
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
        <View style={styles.modalRoot}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSlipModal(false)}
              style={styles.modalBackBtn}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>Payment Slip</Text>
              <Text style={styles.modalHeaderSub}>
                {viewingItem.serviceName} · {formatCurrency(viewingItem.servicePrice)}
              </Text>
            </View>
          </View>

          {/* Customer summary row */}
          <View style={styles.modalInfoBar}>
            <View style={styles.modalInfoItem}>
              <Ionicons name="person-outline" size={14} color="#8338EC" />
              <Text style={styles.modalInfoText}>{viewingItem.customerName}</Text>
            </View>
            <View style={styles.modalInfoItem}>
              <Ionicons name="call-outline" size={14} color="#8338EC" />
              <Text style={styles.modalInfoText}>{viewingItem.phoneNumber}</Text>
            </View>
          </View>

          {/* Slip image */}
          <View style={styles.modalSlipArea}>
            {!slipUrl ? (
              <View style={styles.modalNoSlip}>
                <Ionicons name="image-outline" size={48} color="#aaa" />
                <Text style={styles.modalNoSlipText}>No slip uploaded</Text>
              </View>
            ) : isPdf(slipUrl) ? (
              <View style={styles.modalPdfBox}>
                <Ionicons name="document-text-outline" size={64} color="#8338EC" />
                <Text style={styles.modalPdfTitle}>PDF Payment Slip</Text>
                <Text style={styles.modalPdfSub}>
                  Tap the button below to open and view the full payment slip PDF.
                </Text>
                <TouchableOpacity
                  style={styles.openPdfBtn}
                  onPress={() => {
                    if (slipUrl) {
                      Linking.openURL(slipUrl).catch(() =>
                        Alert.alert(
                          "Cannot Open PDF",
                          "Make sure a PDF viewer app is installed on your device."
                        )
                      );
                    }
                  }}
                >
                  <Ionicons name="open-outline" size={20} color="#fff" />
                  <Text style={styles.openPdfBtnText}>Open PDF Slip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: slipUrl }}
                style={styles.modalSlipImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Action buttons inside modal — only for pending */}
          {isPending && (
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={() => handleAction(viewingItem._id, "Rejected", true)}
                disabled={isActioning}
              >
                {isActioning ? (
                  <ActivityIndicator color="#DC2626" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#DC2626"
                    />
                    <Text style={styles.modalRejectText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApproveBtn}
                onPress={() => handleAction(viewingItem._id, "Approved", true)}
                disabled={isActioning}
              >
                {isActioning ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.modalApproveText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Resolved state inside modal */}
          {!isPending && (
            <View
              style={[
                styles.modalResolvedBar,
                {
                  backgroundColor:
                    viewingItem.status === "Approved" ? "#DCFCE7" : "#FEE2E2",
                },
              ]}
            >
              <Ionicons
                name={
                  viewingItem.status === "Approved"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={22}
                color={
                  viewingItem.status === "Approved" ? "#16A34A" : "#DC2626"
                }
              />
              <Text
                style={[
                  styles.modalResolvedText,
                  {
                    color:
                      viewingItem.status === "Approved" ? "#16A34A" : "#DC2626",
                  },
                ]}
              >
                {viewingItem.status === "Approved"
                  ? "Request has been approved"
                  : "Request has been rejected"}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  // ─── Card render ───────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    const cfg = STATUS_CFG[item.status] || STATUS_CFG["Pending Approval"];
    const slipUrl = getFileUrl(item.paymentSlip);
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const isPending = item.status === "Pending Approval";
    const isActioning = actionLoading === item._id;

    return (
      <View style={styles.card}>
        {/* Top: service name + status */}
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.price}>{formatCurrency(item.servicePrice)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        {/* Customer info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{item.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={14} color="#888" />
            <Text style={styles.infoText}>ID: {item.customerId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{item.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
        </View>

        {/* Payment Slip thumbnail + View Slip button */}
        <View style={styles.slipSection}>
          <Text style={styles.slipLabel}>Payment Slip</Text>

          {slipUrl && !isPdf(slipUrl) ? (
            /* Image thumbnail */
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => openSlip(item)}
              style={styles.thumbnailWrap}
            >
              <Image
                source={{ uri: slipUrl }}
                style={styles.slipThumbnail}
                resizeMode="cover"
              />
              <View style={styles.thumbnailOverlay}>
                <Ionicons name="eye-outline" size={22} color="#fff" />
                <Text style={styles.thumbnailOverlayText}>Tap to view full</Text>
              </View>
            </TouchableOpacity>
          ) : slipUrl && isPdf(slipUrl) ? (
            /* PDF indicator */
            <View style={styles.pdfBox}>
              <Ionicons name="document-outline" size={24} color="#8338EC" />
              <Text style={styles.pdfText}>PDF document attached</Text>
            </View>
          ) : (
            <View style={styles.pdfBox}>
              <Ionicons name="image-outline" size={22} color="#aaa" />
              <Text style={[styles.pdfText, { color: "#aaa" }]}>No slip</Text>
            </View>
          )}

          {/* View Slip button — always shown if slip exists */}
          {slipUrl && (
            <TouchableOpacity
              style={styles.viewSlipBtn}
              onPress={() => openSlip(item)}
            >
              <Ionicons name="eye-outline" size={16} color="#8338EC" />
              <Text style={styles.viewSlipBtnText}>View Full Slip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pending: Approve / Reject buttons */}
        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleAction(item._id, "Rejected")}
              disabled={isActioning}
            >
              {isActioning ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#DC2626"
                  />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleAction(item._id, "Approved")}
              disabled={isActioning}
            >
              {isActioning ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Resolved state */}
        {!isPending && (
          <View style={[styles.resolvedBar, { backgroundColor: cfg.bg }]}>
            <Ionicons
              name={
                item.status === "Approved" ? "checkmark-circle" : "close-circle"
              }
              size={16}
              color={cfg.color}
            />
            <Text style={[styles.resolvedText, { color: cfg.color }]}>
              {item.status === "Approved"
                ? "Request has been approved"
                : "Request has been rejected"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ─── Main render ───────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Slip full-screen modal */}
      {renderSlipModal()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <TouchableOpacity
          onPress={() => fetchRequests()}
          style={styles.refreshIconBtn}
        >
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#8338EC"
          style={{ marginTop: 60 }}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8338EC"]}
              tintColor="#8338EC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={56} color="#C4B8F0" />
              <Text style={styles.emptyTitle}>No Requests Yet</Text>
              <Text style={styles.emptySub}>
                No customer service requests have been submitted yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6FB" },

  // ── Header ─────────────────────────────────────────────────────
  header: {
    backgroundColor: "#1A1A2E",
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 20, fontWeight: "800" },
  refreshIconBtn: { padding: 4 },

  list: { padding: 16, paddingBottom: 40, gap: 14 },

  // ── Card ───────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  price: { fontSize: 15, fontWeight: "700", color: "#8338EC" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  // ── Info section ───────────────────────────────────────────────
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#F0EEFF",
    paddingTop: 12,
    marginBottom: 14,
    gap: 6,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 13, color: "#555" },

  // ── Slip section ───────────────────────────────────────────────
  slipSection: { marginBottom: 14 },
  slipLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  thumbnailWrap: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EDE9FF",
    marginBottom: 8,
  },
  slipThumbnail: { width: "100%", height: "100%" },
  thumbnailOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  thumbnailOverlayText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  pdfBox: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EDE9FF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  pdfBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pdfText: { color: "#8338EC", fontWeight: "600" },
  viewSlipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#8338EC",
    backgroundColor: "#F3EEFF",
  },
  viewSlipBtnText: {
    color: "#8338EC",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Action row ─────────────────────────────────────────────────
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    backgroundColor: "#FEE2E2",
  },
  rejectBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#16A34A",
  },
  approveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // ── Resolved bar ───────────────────────────────────────────────
  resolvedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  resolvedText: { fontSize: 13, fontWeight: "600" },

  // ── Empty state ────────────────────────────────────────────────
  emptyWrap: { alignItems: "center", marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 20 },

  // ── Slip viewer modal ──────────────────────────────────────────
  modalRoot: { flex: 1, backgroundColor: "#0F0F1E" },
  modalHeader: {
    backgroundColor: "#1A1A2E",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalBackBtn: { padding: 4 },
  modalHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  modalHeaderSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginTop: 2,
  },
  modalInfoBar: {
    backgroundColor: "#1E1634",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 20,
  },
  modalInfoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  modalInfoText: { color: "rgba(255,255,255,0.75)", fontSize: 13 },

  modalSlipArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalSlipImage: {
    width: SCREEN_W - 32,
    height: SCREEN_H * 0.55,
    borderRadius: 16,
  },
  modalNoSlip: { alignItems: "center", gap: 12 },
  modalNoSlipText: { color: "#aaa", fontSize: 16 },
  modalPdfBox: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#1E1634",
    borderRadius: 20,
    gap: 16,
    width: "100%",
  },
  modalPdfTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalPdfSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  openPdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8338EC",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 4,
  },
  openPdfBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  // Modal action buttons
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  modalRejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#DC2626",
    backgroundColor: "#FEE2E2",
  },
  modalRejectText: { color: "#DC2626", fontWeight: "800", fontSize: 15 },
  modalApproveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#16A34A",
  },
  modalApproveText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  modalResolvedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  modalResolvedText: { fontSize: 15, fontWeight: "700" },
});
