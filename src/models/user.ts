import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  session: {
    token: string;
    expires: Date;
  }

  encryptPassword: (password: string) => string;
  validateLogin: (email: string, password: string) => Promise<string>;
  authenticated: (token: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (input: string): boolean => isEmail(input),
      message: (): string => "Email is not valid.",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (input: string): boolean => isStrongPassword(input),
      message: (): string => "Password is not strong enough.",
    },
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
  session: {
    token: { type: String },
    expires: { type: Date },
  },
});

UserSchema.methods = {
  encryptPassword: (password: string): string => {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  },
  validateLogin: async (email: string, password: string): Promise<string> => {
    if (!isEmail(email)) {
      throw new Error("Invalid email.");
    }

    const User = mongoose.model<IUser>("User");
    const user = await User.findOne({ email: email });

    if (user === null) {
      throw new Error("User does not exist.");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error("Incorrect password.");
    }

    await user.save();

    return user.session.token;
  },
  authenticated: async (token: string): Promise<boolean> => {
    const User = mongoose.model<IUser>("User");
    const user = await User.findOne({ "session.token": token });
    const date = new Date();

    if (user === null || user.session.expires < date) {
      return false;
    }

    return true;
  },
};

UserSchema.pre<IUser>("save", function (next) {
  this.session.token = crypto.randomBytes(32).toString("hex");
  this.updatedAt = new Date();
  this.session.expires = new Date(Date.now() + 86400000);
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
