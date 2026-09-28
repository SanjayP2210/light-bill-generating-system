import mongoose from 'mongoose';

// Fail fast instead of letting queries sit in mongoose's buffer while the
// platform timeout (Vercel) runs out.
mongoose.set('bufferTimeoutMS', 10000);

// On serverless platforms the module stays loaded between warm invocations,
// so the connection promise is cached on globalThis and reused instead of
// opening a new connection (TCP + TLS + auth handshake) on every request.
const cached = globalThis.__mongoose || (globalThis.__mongoose = { promise: null });

const connectDB = () => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 10,
            })
            .then((m) => {
                console.log('MongoDB connected');
                return m.connection;
            })
            .catch((err) => {
                // Clear the cache so the next request retries instead of
                // reusing a rejected promise forever.
                cached.promise = null;
                console.error('[db] MongoDB connection error:', err?.message);
                if (err?.syscall === 'querySrv') {
                    console.error(
                        'This looks like a DNS SRV lookup failure, not a bad connection string. ' +
                        'Switch DNS to 8.8.8.8 / 1.1.1.1, disable VPN/firewall, or use the ' +
                        'non-SRV (standard) connection string from Atlas.'
                    );
                }
                throw err;
            });
    }

    return cached.promise;
};

export default connectDB;
