import { Goal } from "../../models/goals.model";
import { Event } from "../../models/events.model";
import { Donor } from "../../models/donors.model";
import { Donation } from "../../models/donations.model";
import mongoose from "mongoose";

export const fetchData = async (
  ids: string[],
  type: "goal" | "event" | "donor"
  // fileType: "pdf" | "word" | "excel"
) => {
  try {
    let data;
    console.log(type);
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    switch (type) {
      case "goal":
        data = await Goal.find({ _id: { $in: objectIds } });
        break;
      case "event":
        data = await Event.aggregate([
          {
            $match: { _id: { $in: objectIds } },
          },
          {
            $lookup: {
              from: "donations",
              localField: "donations",
              foreignField: "_id",
              as: "donationDetails",
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
              path: "$donationDetails",
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
              totalParticipants: { $first: { $size: "$participants" } }, // Count participants properly
              totalMonetaryDonations: {
                $sum: {
                  $cond: [
                    { $eq: ["$donationDetails.donationType", "Monetary"] },
                    "$donationDetails.monetaryDetails.amount",
                    0,
                  ],
                },
              },
              totalInKindDonations: {
                $sum: {
                  $cond: [
                    { $eq: ["$donationDetails.donationType", "In-Kind"] },
                    "$donationDetails.inKindDetails.estimatedValue",
                    0,
                  ],
                },
              },
              donationCount: {
                $sum: {
                  $cond: [{ $ifNull: ["$donationDetails._id", false] }, 1, 0],
                },
              },
              participants: { $first: "$participants" },
            },
          },
        ]);
        break;
      case "donor":
        data = await Donor.find({ _id: { $in: objectIds } });
        break;
      default:
        throw new Error("Invalid report type.");
    }
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
