/**
 * Real-time Dashboard Component
 * Displays live metrics, payments, cards, and operations
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  subscribeToUpdates,
  initializeRealtime,
} from "../services/api";
import { animationVariants, viewportSettings } from "../utils/animationVariants";
import {
  AnimatedMetricCard,
  AnimatedBadge,
  AnimatedList,
  AnimatedStatusIndicator,
} from "./AnimatedComponents";

type LiveUpdatePayload = {
  message?: string;
  count?: number;
};

export function RealtimeDashboard({
  userId,
  onPaymentUpdate,
  onCardUpdate,
  onActivationUpdate,
}: {
  userId: string;
  onPaymentUpdate?: (data: any) => void;
  onCardUpdate?: (data: any) => void;
  onActivationUpdate?: (data: any) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    paymentsToday: 0,
    cardsAssigned: 0,
    activationsLive: 0,
    ticketsOpen: 0,
  });

  useEffect(() => {
    // Initialize real-time connection
    const socket = initializeRealtime(userId);

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Dashboard connected to real-time updates");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Subscribe to payment updates
    const unsubscribePayments = subscribeToUpdates("payment:new", (data) => {
      const payload = data as LiveUpdatePayload;

      setLiveUpdates((prev) => [
        { type: "payment", data: payload, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
      setMetrics((prev) => ({
        ...prev,
        paymentsToday: prev.paymentsToday + 1,
      }));
      onPaymentUpdate?.(payload);
    });

    // Subscribe to card updates
    const unsubscribeCards = subscribeToUpdates("cards:assigned", (data) => {
      const payload = data as LiveUpdatePayload;

      setLiveUpdates((prev) => [
        { type: "card", data: payload, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
      setMetrics((prev) => ({
        ...prev,
        cardsAssigned: prev.cardsAssigned + (payload.count || 1),
      }));
      onCardUpdate?.(payload);
    });

    // Subscribe to activation updates
    const unsubscribeActivations = subscribeToUpdates(
      "activation:status",
      (data) => {
        const payload = data as LiveUpdatePayload;

        setLiveUpdates((prev) => [
          { type: "activation", data: payload, timestamp: new Date() },
          ...prev.slice(0, 9),
        ]);
        setMetrics((prev) => ({
          ...prev,
          activationsLive: prev.activationsLive + 1,
        }));
        onActivationUpdate?.(payload);
      },
    );

    return () => {
      unsubscribePayments?.();
      unsubscribeCards?.();
      unsubscribeActivations?.();
    };
  }, [userId, onPaymentUpdate, onCardUpdate, onActivationUpdate]);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={animationVariants.containerStagger}
    >
      {/* Connection Status */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        variants={animationVariants.fadeInUp}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live Dashboard</h3>
            <p className="mt-1 text-sm text-white/50">
              Real-time operations and metrics streaming
            </p>
          </div>
          <AnimatedStatusIndicator
            status={isConnected ? "online" : "offline"}
            label={isConnected ? "Connected" : "Offline"}
          />
        </div>
      </motion.div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedMetricCard
          label="Payments Today"
          value={metrics.paymentsToday}
          detail="Transactions processed"
        />
        <AnimatedMetricCard
          label="Cards Assigned"
          value={metrics.cardsAssigned}
          detail="Smart cards distributed"
        />
        <AnimatedMetricCard
          label="Activations Live"
          value={metrics.activationsLive}
          detail="Devices rolling out"
        />
        <AnimatedMetricCard
          label="Support Tickets"
          value={metrics.ticketsOpen}
          detail="Open workflows"
        />
      </div>

      {/* Live Feed */}
      <motion.div
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        variants={animationVariants.fadeInUp}
      >
        <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
        <AnimatedList
          items={liveUpdates}
          children={(update: any) => (
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AnimatedBadge
                    label={update.type.toUpperCase()}
                    variant={
                      update.type === "payment"
                        ? "success"
                        : update.type === "card"
                          ? "info"
                          : "warning"
                    }
                  />
                  <p className="text-sm text-white/70">
                    {update.data.message || `${update.type} event`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/40">
                {new Date(update.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default RealtimeDashboard;
