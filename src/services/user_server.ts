import { UntypedHandleCall, handleUnaryCall, ServiceError, status } from "@grpc/grpc-js";
import { IUserServer } from "../../pb/user_grpc_pb";
import { UserToken, UserRequest } from "../../pb/user_pb";

import User from "../models/user";

export class UserServer implements IUserServer {
    // eslint-disable-next-line no-undef
    [method: string]: UntypedHandleCall;

    public register: handleUnaryCall<UserRequest, UserToken> = async (call, callback) => {
        const email: string = call.request.getEmail();
        const password: string = call.request.getPassword();

        const user = new User({
            email: email,
            password: password,
            createdAt: Date.now(),
        });

        try {
            await user.validate();
            user.password = new User().encryptPassword(password);

            await user.save();

            const res: UserToken = new UserToken();
            res.setToken(user.session.token);

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    };

    public login: handleUnaryCall<UserRequest, UserToken> = async (call, callback) => {
        const email: string = call.request.getEmail();
        const password: string = call.request.getPassword();

        try {
            const token = await new User().validateLogin(email, password);

            const res: UserToken = new UserToken();
            res.setToken(token);

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    }
}
