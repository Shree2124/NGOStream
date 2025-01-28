import { Request, Response } from "express";
import { Donation } from "../models/donations.model";
import { Donor } from "../models/donors.model";
import { Goal } from "../models/goals.model";
import { SuccessResponse } from "../utils/successResponse";

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

    res.json(new SuccessResponse(200,{
      totalDonations:
        totalDonations.length > 0 ? totalDonations[0].totalAmount : 0,
      totalDonors,
      activeCampaigns,
      topDonor:
        topDonor.length > 0
          ? { name: topDonor[0].donorName, amount: topDonor[0].totalDonated }
          : null,
      averageMonthlyDonations: 0, 
      predictedNextMonthDonations: 0,},
      "Metrics fetched "
    )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch quick stats." });
  }
};


export {
  getQuickStats
}