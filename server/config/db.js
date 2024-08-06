import mongoose from 'mongoose';

const main = async () => {
    try {
        console.log('process.env.MONGO_URI', process.env.MONGO_URI);
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('connect successfully', connection.connection.host);
    } catch (error) {
        console.log('error while connecting ', error);
        process.exit(1);
    }
}

export default main;