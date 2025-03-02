import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  isPasswordCorrect(password: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password as string, 10);
  next();
});

AdminSchema.methods.isPasswordCorrect = async function (password: any) {
  /*console.log("given password: ",password);
  console.log("Stored password: ", this.password);*/
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IAdmin>("Admin", AdminSchema);
