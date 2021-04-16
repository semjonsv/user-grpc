import { Server, ServerCredentials } from "@grpc/grpc-js";
import { UserService } from "../pb/user_grpc_pb";
import { UserServer } from "./services/user_server";
import connect from "./connect";
import * as dotenv from "dotenv";

dotenv.config();

const server = new Server();
server.addService(UserService, new UserServer());

const port = process.env.APP_PORT;
const uri = `${process.env.APP_URI}:${port}`;

server.bindAsync(
    uri,
    ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err != null) {
        return console.error(err);
      }
      server.start();
      console.log(`Listening on port ${port}`);
    },
);

const db = process.env.DB as string;
connect(db);
