export interface IEvent {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: string;
  status: "Upcoming" | "Happening" | "Completed";
  outcomes: string;
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
  participants: string[];
  assignedRoles: Record<string, string>;
}
