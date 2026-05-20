let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*", // change to frontend URL in production
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
    socket.on("join-team", (teamId) => {
      socket.join(teamId);
    });
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };