import { UntypedHandleCall, handleUnaryCall } from "@grpc/grpc-js";

import { IUserServer } from "../../pb/user_grpc_pb";
import { UserToken, RegisterRequest } from "../../pb/user_pb";

export class UserServer implements IUserServer {
    // eslint-disable-next-line no-undef
    [method: string]: UntypedHandleCall;

    public register: handleUnaryCall<RegisterRequest, UserToken> = (call, callback) => {
        const email: string = call.request.getEmail();
        const passwordConfirmation: string = call.request.getPasswordConfirmation();
        //let password: string = call.request.getPassword();

        const res: UserToken = new UserToken();
        res.setToken(passwordConfirmation);

        return callback(null, res);
    }
}
