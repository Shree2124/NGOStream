import { Request, Response } from "express";
import adminModels from "./../models/admin.model";
import bcrypt from "bcrypt";
import {
  sendAdminCredentialMail,
  sendAdminDeletionMail,
} from "../utils/sendMail";
import { generatePassword } from "../utils/generatePassword";
import mongoose from "mongoose";

export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    // Check if admin already exists
    const existingAdmin = await adminModels.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: "Admin already exists" });
      return;
    }

    const password = generatePassword(12);

    // Generate hashed passwor

    // Create new admin
    const newAdmin = new adminModels({
      name,
      email,
      password: password,
    });

    await newAdmin.save();

    // Send email with credentials
    const originalPassword = password; // Store original password for email
    await sendAdminCredentialMail({
      name,
      email,
      password: originalPassword, // Send unhashed password in email
    });

    // Return success response (without sending password back)
    const adminResponse = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
    };

    res.status(201).json({
      message: "Admin created successfully and credentials sent via email",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    // Use findOne instead of find to get a single document
    const admin = await adminModels.findOne({ email: email });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Store admin details for email
    const adminDetails = {
      name: admin.name,
      email: admin.email,
    };

    // Delete the admin
    await adminModels.findByIdAndDelete(admin._id);

    // Send deletion notification email
    await sendAdminDeletionMail(adminDetails);

    res.json({
      message: "Admin deleted successfully and notification sent",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updatedAdmin = await adminModels.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );

    if (!updatedAdmin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    res.json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAdmins = async (_req: any, res: Response) => {
  try {
    const admins = await adminModels.find();

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
