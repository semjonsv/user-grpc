import { UntypedHandleCall, handleUnaryCall, ServiceError, status } from "@grpc/grpc-js";
import { IUserServer } from "../../pb/user_grpc_pb";
import { UserToken, UserRequest, Authenticated, UserData, Session } from "../../pb/user_pb";

import User, { Session as UserSession } from "../models/user";

export class UserServer implements IUserServer {
    // eslint-disable-next-line no-undef
    [method: string]: UntypedHandleCall;

    public register: handleUnaryCall<UserRequest, UserToken> = async (call, callback) => {
        const email: string = call.request.getEmail();
        const password: string = call.request.getPassword();
        const session: UserSession = new User().generateSession();

        const user = new User({
            email: email,
            password: password,
            createdAt: Date.now(),
            session: session,
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
    };

    public auth: handleUnaryCall<UserToken, Authenticated> = async (call, callback) => {
        const token: string = call.request.getToken();

        try {
            const isAuth = await new User().authenticated(token);

            const res: Authenticated = new Authenticated();
            res.setIsauth(isAuth);

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    };

    public getByToken: handleUnaryCall<UserToken, UserData> = async (call, callback) => {
        const token: string = call.request.getToken();

        try {
            const user = await new User().getByToken(token);

            const res: UserData = new UserData();
            res.setEmail(user.email);
            res.setCreatedat(user.createdAt.toISOString());
            res.setUpdatedat(user.updatedAt.toISOString());

            const session: Session = new Session();
            session.setToken(user.session.token);
            session.setExpires(user.session.expires.toISOString());

            res.setSession(session);

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    };

    public logout: handleUnaryCall<UserToken, Authenticated> = async (call, callback) => {
        const token: string = call.request.getToken();

        try {
            const user = await new User().getByToken(token);
            user.session.expires = new Date();
            await user.save();

            const res: Authenticated = new Authenticated();
            res.setIsauth(false);

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    };

    public check: handleUnaryCall<UserToken, Session> = async (call, callback) => {
        const token: string = call.request.getToken();

        try {
            const user = await new User().getByToken(token);
            user.session.expires = new Date(Date.now() + 86400000);

            await user.save();

            const res: Session = new Session();
            res.setToken(user.session.token);
            res.setExpires(user.session.expires.toISOString());

            return callback(null, res);
        } catch (err) {
            const error: Partial<ServiceError> = {
                code: status.INVALID_ARGUMENT,
                message: err.message,
            };
            return callback(error, null);
        }
    };
}
