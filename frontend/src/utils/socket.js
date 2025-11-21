import { io } from "socket.io-client";

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?._id; // or user?.id depending on your backend

const API_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:8000";
export const socket = io(API_URL, { withCredentials: true });

// Join the room
if (userId) {
  socket.emit("joinRoom", userId);
}
