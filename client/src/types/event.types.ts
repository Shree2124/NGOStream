export interface IEvent {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: string;
  status: "Upcoming" | "Happening" | "Completed";
  outcomes: string | null;
  feedback: {
    feedbackText: string[];
    rating: number[];
    date: string[];
  }[];
  kpis: {
    successMetrics: string[];
  };
  donations: string[];
  attendees: string[];
  eventStaff: {
    memberId: string;
    fullName: string;
    ngoRole: string;
    eventRole: string[];
    email: string;
    addedAt: string[];
  }[];
}
