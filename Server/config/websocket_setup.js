/**
 * Enhanced WebSocket Setup for Real-time Chat and Scan Processing
 */

const socketIO = require('socket.io');

/**
 * Initialize WebSocket with Express server
 */
function initializeWebSocket(httpServer, app) {
  const io = socketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4000",
        "https://aitutor.drillingnwk.com",
        "https://tutor.drillingnwk.com"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    // Increase timeout for long-running processing
    pingTimeout: 60000,
    pingInterval: 25000,
    // Enable compression for better streaming performance
    perMessageDeflate: {
      threshold: 1024
    }
  });

  // Make io accessible to routes via app
  app.set('io', io);

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    // ==========================================
    // CHAT ROOM HANDLERS
    // ==========================================

    /**
     * Join a chat room for real-time message streaming
     * Client sends: { chat_id: number }
     */
    socket.on('join_chat', (data) => {
      const { chat_id } = data;
      const roomName = `chat_${chat_id}`;
      
      socket.join(roomName);
      console.log(`💬 Client ${socket.id} joined chat room: ${roomName}`);
      
      // Acknowledge the join
      socket.emit('joined_chat', {
        chat_id,
        room: roomName,
        message: 'Successfully joined chat room',
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Leave a chat room
     * Client sends: { chat_id: number }
     */
    socket.on('leave_chat', (data) => {
      const { chat_id } = data;
      const roomName = `chat_${chat_id}`;
      
      socket.leave(roomName);
      console.log(`📤 Client ${socket.id} left chat room: ${roomName}`);
      
      socket.emit('left_chat', {
        chat_id,
        room: roomName,
        message: 'Left chat room'
      });
    });

    // ==========================================
    // SCAN ROOM HANDLERS (Keep existing)
    // ==========================================

    /**
     * Join scan-specific room
     * Client sends: { scan_id: number }
     */
    socket.on('join_scan', (data) => {
      const { scan_id } = data;
      const roomName = `scan_${scan_id}`;
      
      socket.join(roomName);
      console.log(`📱 Client ${socket.id} joined scan room: ${roomName}`);
      
      // Acknowledge the join
      socket.emit('joined_scan', {
        scan_id,
        room: roomName,
        message: 'Successfully joined scan room'
      });
    });

    /**
     * Leave scan room
     * Client sends: { scan_id: number }
     */
    socket.on('leave_scan', (data) => {
      const { scan_id } = data;
      const roomName = `scan_${scan_id}`;
      
      socket.leave(roomName);
      console.log(`📤 Client ${socket.id} left scan room: ${roomName}`);
    });

    // ==========================================
    // CONNECTION MANAGEMENT
    // ==========================================

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Log all rooms this socket was in
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      if (rooms.length > 0) {
        console.log(`  └─ Was in rooms: ${rooms.join(', ')}`);
      }
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error(`❌ WebSocket error for ${socket.id}:`, error);
    });

    /**
     * Heartbeat/ping for connection monitoring
     */
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    /**
     * Get socket info (for debugging)
     */
    socket.on('get_socket_info', () => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      socket.emit('socket_info', {
        socket_id: socket.id,
        rooms: rooms,
        connected: socket.connected,
        timestamp: new Date().toISOString()
      });
    });
  });

  // ==========================================
  // UTILITY FUNCTIONS FOR CONTROLLERS
  // ==========================================

  /**
   * Emit to a specific chat room
   * Usage: emitToChat(io, chatId, 'event_name', data)
   */
  io.emitToChat = (chatId, event, data) => {
    const roomName = `chat_${chatId}`;
    io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`📡 Emitted '${event}' to ${roomName}`);
  };

  /**
   * Emit to a specific scan room
   * Usage: emitToScan(io, scanId, 'event_name', data)
   */
  io.emitToScan = (scanId, event, data) => {
    const roomName = `scan_${scanId}`;
    io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`📡 Emitted '${event}' to ${roomName}`);
  };

  /**
   * Get room member count
   */
  io.getRoomSize = (roomName) => {
    const room = io.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  };

  console.log('✅ WebSocket initialized successfully');
  console.log('   Supported events:');
  console.log('   • Chat: join_chat, leave_chat, stream_chunk, page_chunk, etc.');
  console.log('   • Scan: join_scan, leave_scan');
  console.log('   • Connection: ping, get_socket_info');

  return io;
}

module.exports = {
  initializeWebSocket
};