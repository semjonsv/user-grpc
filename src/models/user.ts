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
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (input: string): boolean => isEmail(input),
      message: () => "Email is not valid.",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (input: string): boolean => isStrongPassword(input),
      message: () => "Password is not strong enough.",
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
    const salt = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  },
};

UserSchema.pre<IUser>("save", function (next) {
  this.session.token = crypto.randomBytes(32).toString("hex");
  this.updatedAt = new Date();
  this.session.expires = new Date(Date.now() + 86400000);
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
