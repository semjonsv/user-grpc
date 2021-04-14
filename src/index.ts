import { Server, ServerCredentials } from "@grpc/grpc-js";
import { UserService } from "../pb/user_grpc_pb";
import { UserServer } from "./services/user";

const server = new Server();
server.addService(UserService, new UserServer());

const port = 3000;
const uri = `localhost:${port}`;

server.bindAsync(
    uri,
    ServerCredentials.createInsecure(),
    (err, port) => {
      if (err != null) {
        return console.error(err);
      }
      server.start();
      console.log(`Listening on port ${port}`);
    },
);
