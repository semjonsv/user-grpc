import mongoose from "mongoose";

export default (db: string): void => {
    const connect = () => {
        mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(() => {
            console.info("Successfully connected to database");
        })
        .catch(error => {
            console.error("Error connecting to database: ", error);
            process.exit(1);
        });
    };

    connect();
    mongoose.connection.on("disconnected", connect);
};
