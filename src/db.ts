import dotenv from 'dotenv';
import { connect, connection } from 'mongoose';

dotenv.config();

let isConnected = false; // Track the connection status

export async function connectToMongoDB(uri: string) {
	if (isConnected) {
		console.log('Reusing existing MongoDB connection');
		return connection;
	}

	try {
		console.log('Creating a new MongoDB connection');
		const connection = await connect(uri);

		isConnected = true; // Set connection status
		console.log('Pinged your deployment. You successfully connected to MongoDB!');

		return connection;
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
		throw error;
	}
}
