let io;

module.exports = {
    init: httpServer => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "http://192.168.1.7:9090",
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