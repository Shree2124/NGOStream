import { Request, Response } from "express";
import { Donation } from "../models/donations.model";
import { Donor } from "../models/donors.model";
import { Goal } from "../models/goals.model";
import { SuccessResponse } from "../utils/successResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Event } from "../models/events.model";
import mongoose, { isValidObjectId } from "mongoose";
import { ErrorResponse } from "../utils/errorResponse";
import { Impact } from "../models/impact.models";

const getQuickStats = async (req: any, res: Response) => {
  try {
    const [totalDonations, totalDonors, activeCampaigns, topDonor] =
      await Promise.all([
        Donation.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$donationType", "Monetary"] },
                    "$monetaryDetails.amount",
                    "$inKindDetails.estimatedValue",
                  ],
                },
              },
            },
          },
        ]),

        Donor.countDocuments(),

        Goal.countDocuments({ status: "Active" }),
        Donation.aggregate([
          {
            $group: {
              _id: "$donorId",
              totalDonated: {
                $sum: {
                  $cond: [
                    { $eq: ["$donationType", "Monetary"] },
                    "$monetaryDetails.amount",
                    "$inKindDetails.estimatedValue",
                  ],
                },
              },
            },
          },
          { $sort: { totalDonated: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: "donors",
              localField: "_id",
              foreignField: "_id",
              as: "donor",
            },
          },
          { $unwind: "$donor" },
          {
            $project: {
              donorName: "$donor.name",
              totalDonated: 1,
            },
          },
        ]),
      ]);

    res.json(
      new SuccessResponse(
        200,
        {
          totalDonations:
            totalDonations.length > 0 ? totalDonations[0].totalAmount : 0,
          totalDonors,
          activeCampaigns,
          topDonor:
            topDonor.length > 0
              ? {
                  name: topDonor[0].donorName,
                  amount: topDonor[0].totalDonated,
                }
              : null,
          averageMonthlyDonations: 0,
          predictedNextMonthDonations: 0,
        },
        "Metrics fetched "
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch quick stats." });
  }
};

const getEvent = asyncHandler(async (req: any, res: Response) => {
  const { eventId } = req.params;

  if (!isValidObjectId(eventId))
    throw new ErrorResponse(400, "Invalid event ID");

  const event = await Event.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(eventId) },
    },
    {
      $unwind: {
        path: "$participants",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "participants.memberId",
        foreignField: "_id",
        as: "participantDetails",
      },
    },
    {
      $unwind: {
        path: "$participantDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        startDate: { $first: "$startDate" },
        endDate: { $first: "$endDate" },
        location: { $first: "$location" },
        eventType: { $first: "$eventType" },
        status: { $first: "$status" },
        outcomes: { $first: "$outcomes" },
        kpis: { $first: "$kpis" },
        donations: { $first: "$donations" },
        eventReport: { $first: "$eventReport" },
        feedback: { $first: "$feedback" },
        attendees: {
          $push: {
            $cond: {
              if: { $eq: ["$participants.role", "Attendee"] },
              then: {
                memberId: "$participantDetails._id",
                fullName: "$participantDetails.fullName",
                email: "$participantDetails.email",
                addedAt: "$participants.addedAt",
              },
              else: "$$REMOVE",
            },
          },
        },
        eventStaff: {
          $push: {
            $cond: {
              if: { $ne: ["$participants.role", "Attendee"] },
              then: {
                memberId: "$participantDetails._id",
                fullName: "$participantDetails.fullName",
                email: "$participantDetails.email",
                addedAt: "$participants.addedAt",
                eventRole: "$participants.role",
              },
              else: "$$REMOVE",
            },
          },
        },
      },
    },
    {
      $addFields: {
        feedback: {
          $map: {
            input: "$feedback",
            as: "fb",
            in: {
              feedbackText: "$$fb.feedbackText",
              rating: "$$fb.rating",
              date: "$$fb.date",
            },
          },
        },
      },
    },
  ]);

  if (!event || event.length === 0) {
    return res.status(404).json(new ErrorResponse(404, "Event not found"));
  }

  let feedbackAnalysis = {};

  if (event[0]?.feedback.length !== 0) {
    let feedbackTexts: string[] = [];
    let feedbackDates: string[] = [];

    event[0]?.feedback.forEach((f: any) => {
      feedbackTexts.push(f.feedbackText);
      feedbackDates.push(f.date);
    });

    const response = await fetch(`http://127.0.0.1:5000/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: feedbackTexts }),
    });

    const analysisResult = await response.json();
    console.log(analysisResult);

    let startDate = new Date(event[0].startDate);
    let currentDate = new Date();
    let weeklyData: any = {};

    while (startDate <= currentDate) {
      let endOfWeek = new Date(startDate);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      let weekKey = startDate.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          suggestion: 0,
        };
      }

      feedbackDates.forEach((date: string, index: number) => {
        let feedbackDate = new Date(date);
        if (feedbackDate >= startDate && feedbackDate < endOfWeek) {
          let sentimentObj = analysisResult.sentiments[index];
          console.log("sentiment objec:", sentimentObj);
          if (sentimentObj && sentimentObj.sentiment) {
            let sentiment = sentimentObj.sentiment.toLowerCase();
            console.log("Sentiment .to lower ", sentiment);
            if (weeklyData[weekKey][sentiment] !== undefined) {
              console.log(weekKey, sentiment);
              weeklyData[weekKey][sentiment]++;
              console.log("if ", weeklyData);
            } else {
              console.warn(`Unexpected sentiment type: ${sentiment}`);
            }
          }
        }
      });

      startDate = endOfWeek;
    }

    feedbackAnalysis = weeklyData;
  }

  console.log(feedbackAnalysis);

  return res
    .status(200)
    .json(
      new SuccessResponse(
        200,
        { ...event[0], feedbackAnalysis },
        "Event fetched successfully"
      )
    );
});

const getImpacts = asyncHandler(async (req: any, res: Response) => {
  const impacts = await Impact.find();

  return res
    .status(200)
    .json(new SuccessResponse(200, impacts, "Impacts fetched successfully"));
});

export { getQuickStats, getEvent, getImpacts };
