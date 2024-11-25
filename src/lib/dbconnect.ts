import mongoose from 'mongoose'

type ConnectionObject = {
    isConnected ?: number
}

const connection:ConnectionObject = {}

async function dbConnect():Promise<void> {
    if(connection.isConnected){
        console.log('already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URL || '', {})
        console.log(db);
        connection.isConnected = db.connections[0].readyState;
        console.log('db connection');
        return 
    } catch (error) {
        console.log('database connection error', error);
        
        process.exit(1)
    }
}

export default dbConnect;