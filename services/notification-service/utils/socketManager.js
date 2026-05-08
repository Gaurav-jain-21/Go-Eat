let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
};

const emitToUser = (userId, event, data) => {
  try {
    getIO().to(userId.toString()).emit(event, data);
    console.log(`Socket emitted "${event}" to user ${userId}`);
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

module.exports = { setIO, getIO, emitToUser };