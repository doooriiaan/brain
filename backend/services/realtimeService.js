/**
 * Real-time notification and event broadcasting service
 * Uses Socket.io for WebSocket connections
 */

const activeConnections = new Map();
const eventLog = [];
let socketServer = null;

export function registerConnection(userId, socketId) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, []);
  }

  activeConnections.get(userId).push({
    socketId,
    connectedAt: new Date().toISOString(),
  });

  logEvent("connection", {
    userId,
    socketId,
    timestamp: new Date().toISOString(),
  });
}

export function removeConnection(userId, socketId) {
  if (activeConnections.has(userId)) {
    const connections = activeConnections.get(userId);
    const index = connections.findIndex((c) => c.socketId === socketId);

    if (index !== -1) {
      connections.splice(index, 1);
      if (connections.length === 0) {
        activeConnections.delete(userId);
      }
    }
  }

  logEvent("disconnection", {
    userId,
    socketId,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastToUser(userId, event, data) {
  if (activeConnections.has(userId)) {
    const connections = activeConnections.get(userId);
    connections.forEach((connection) => {
      socketServer?.to(connection.socketId).emit(event, data);
    });
    return {
      userId,
      event,
      data,
      connectedSockets: connections.length,
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

export function broadcastToAll(event, data, excludeUser = null) {
  const broadcast = {
    event,
    data,
    timestamp: new Date().toISOString(),
    affectedUsers: excludeUser ? activeConnections.size - 1 : activeConnections.size,
  };

  if (socketServer) {
    if (excludeUser && activeConnections.has(excludeUser)) {
      const excludedSockets = new Set(
        activeConnections.get(excludeUser).map((connection) => connection.socketId),
      );

      socketServer.sockets.sockets.forEach((socket) => {
        if (!excludedSockets.has(socket.id)) {
          socket.emit(event, data);
        }
      });
    } else {
      socketServer.emit(event, data);
    }
  }

  logEvent("broadcast", broadcast);
  return broadcast;
}

export function broadcastPaymentUpdate(payment) {
  broadcastToAll("payment:new", {
    payment,
    message: `${payment.company} processed a ${payment.planName} payment (${payment.currency} ${payment.amount})`,
  });
}

export function broadcastSmartCardUpdate(cards) {
  broadcastToAll("cards:assigned", {
    cards,
    count: cards.length,
    message: `${cards.length} smart cards assigned to ${cards[0]?.ownerCompany || "clients"}`,
  });
}

export function broadcastActivationUpdate(activation) {
  broadcastToAll("activation:status", {
    activation,
    message: `Device activation for ${activation.company} moved to ${activation.status}`,
  });
}

export function broadcastTicketUpdate(ticket) {
  broadcastToAll("ticket:status", {
    ticket,
    message: `Support ticket from ${ticket.company} now ${ticket.status}`,
  });
}

export function broadcastNotification(notification) {
  broadcastToAll("notification:new", {
    notification,
  });
}

export function broadcastUploadComplete(upload) {
  broadcastToAll("upload:complete", {
    upload,
    message: `File "${upload.fileName}" uploaded successfully`,
  });
}

export function broadcastDashboardMetrics(metrics) {
  broadcastToAll("dashboard:metrics", {
    metrics,
    timestamp: new Date().toISOString(),
  });
}

export function logEvent(eventType, data) {
  const event = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  };

  eventLog.unshift(event);
  eventLog.splice(500); // Keep last 500 events

  return event;
}

export function getEventLog(limit = 50) {
  return eventLog.slice(0, limit);
}

export function getActiveConnections() {
  return {
    totalUsers: activeConnections.size,
    totalConnections: Array.from(activeConnections.values()).reduce(
      (sum, conns) => sum + conns.length,
      0,
    ),
    connections: Array.from(activeConnections.entries()).map(([userId, conns]) => ({
      userId,
      socketCount: conns.length,
      connectedAt: conns[0]?.connectedAt,
    })),
  };
}

export function initializeSocketServer(io) {
  socketServer = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      registerConnection(userId, socket.id);

      socket.on("disconnect", () => {
        removeConnection(userId, socket.id);
      });

      // Listen for client events
      socket.on("request:dashboard", () => {
        socket.emit("dashboard:ready", {
          timestamp: new Date().toISOString(),
        });
      });

      socket.on("request:metrics", (callback) => {
        if (callback) {
          callback({
            status: "received",
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  });

  return io;
}
