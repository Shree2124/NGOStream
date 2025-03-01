export const formatData = (data: any[], type: "goal" | "event" | "donor") => {
  switch (type) {
    case "goal":
      return data?.map((goal) => ({
        Name: goal.name,
        Description: goal.description,
        TargetAmount: goal.targetAmount,
        CurrentAmount: goal.currentAmount,
        Status: goal.status,
        Donations: goal.donations.length,
      }));
    case "event":
      return data?.map((event) => ({
        Name: event.name,
        Description: event.description,
        Location: event?.location,
        Status: event.status,
        Participants: event.totalParticipants || 0, // Aggregated field
        "Monetary Donations (₹)":
          event.totalMonetaryDonations?.toLocaleString() || "0",
        "In-Kind Donations (₹)":
          event.totalInKindDonations?.toLocaleString() || "0",
        "Total Donations Received": event.donationCount || 0, // Aggregated field
      }));
    case "donor":
      return data?.map((donor) => ({
        Name: donor.name,
        Email: donor.email,
        Phone: donor.phone,
        Donations: donor.donations.length,
      }));
    default:
      return [];
  }
};
