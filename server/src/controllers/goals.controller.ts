import { Response } from "express";
import { Goal } from "../models/goals.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { SuccessResponse } from "../utils/successResponse";

const createGoal = asyncHandler(async (req: any, res: Response) => {
  const { name, description, startDate, targetAmount, status } = req.body;

  if (!name || typeof name !== "string") {
    throw new ErrorResponse(400, "Name is required and must be a string.");
  }

  if (!description || typeof description !== "string") {
    throw new ErrorResponse(
      400,
      "Description is required and must be a string."
    );
  }

  if (!startDate || isNaN(new Date(startDate).getTime())) {
    throw new ErrorResponse(
      400,
      "Start date is required and must be a valid date."
    );
  }

  if (targetAmount === undefined || typeof targetAmount !== "number") {
    throw new ErrorResponse(
      400,
      "Target amount is required and must be a number."
    );
  }

  if (!status || typeof status !== "string") {
    throw new ErrorResponse(400, "Status is required and must be a string.");
  }

  const goal = await Goal.create({
    name,
    description,
    startDate,
    targetAmount,
    status
  })

  if(!goal) throw new ErrorResponse(500, "Something went wrong while creating goal")

    return res.status(201).json(new SuccessResponse(201, goal,"Goal created Successfully"))
});

const getAllGoals = asyncHandler(async (req: any, res: Response)=>{
  console.log("requested");
  
  const allGoals = await Goal.find();

  if(!allGoals || allGoals.length === 0) {
    throw new ErrorResponse(404, "Goals not found")
  }

  return res.status(200).json(new SuccessResponse(200, allGoals, "Goals fetched successfully"))
})

export {
    createGoal,
    getAllGoals
}