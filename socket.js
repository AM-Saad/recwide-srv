let io;

module.exports = {
    init: httpServer => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "*",
                credentials: true
            },
            allowEIO3: true
        });
        console.log('YOHAA')
        return io
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket Not Initialized')
        }
        return io;
    }
};