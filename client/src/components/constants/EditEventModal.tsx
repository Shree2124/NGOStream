/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { api } from "../../api/api";

interface IEditEventModal {
  event: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose: any;
}

const EditEventModal: React.FC<IEditEventModal> = ({ event, onClose }) => {
  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16);
  };

  const [eventName, setEventName] = useState(event.name);
  const [startDate, setStartDate] = useState(
    formatDateTimeLocal(event.startDate)
  );
  const [endDate, setEndDate] = useState(formatDateTimeLocal(event.endDate));
  const [description, setDescription] = useState(event.description);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [roleMap, setRoleMap] = useState<any>({});

  const onUpdate = async (updatedEvent: any) => {
    try {
      console.log(updatedEvent);
      const res = await api.put(`/event/edit/${event?._id}`, {
        ...updatedEvent,
      });
      console.log(res);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    console.log("event: ", event);

    const fetchMembers = async () => {
      try {
        const res = await api.get("/users/all-members");
        console.log(res.data); // Debugging response structure

        if (res.data) {
          const allMembers = res.data.data?.filter(
            (member: any) => member.role !== "Attendee"
          ); // Exclude Attendees
          console.log(allMembers);

          const updatedMembers = allMembers?.map((member: any) => {
            const assignedStaff = event?.eventStaff?.find(
              (staff: any) => staff.memberId === member._id
            );

            return {
              memberId: member._id,
              fullName: member.fullName,
              email: member.email,
              role: member.role,
              alreadyEventStaff: !!assignedStaff,
              eventRole: assignedStaff ? assignedStaff.eventRole : "Volunteer",
            };
          });

          setMembers(updatedMembers);
          setSelectedMembers(
            updatedMembers
              ?.filter((m: any) => m.alreadyEventStaff)
              .map((m: any) => m.memberId)
          ); // Auto-select existing members
          setRoleMap(
            updatedMembers.reduce((acc: any, member: any) => {
              acc[member.memberId] = member.eventRole;
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [event]);

  const handleSelectMember: any = (memberId: any) => {
    setSelectedMembers((prev: any) =>
      prev.includes(memberId)
        ? prev?.filter((id: any) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRoleChange = (memberId: string, role: string) => {
    setRoleMap((prev: any) => ({ ...prev, [memberId]: role }));
  };

  const handleSave: any = () => {
    const newEventStaff = selectedMembers?.map((memberId) => {
      const member: {memberId: string, role: string, fullName: string} | any = members?.find((m: any) => m?.memberId === memberId);
      return {
        memberId: member?.memberId,
        role: roleMap[memberId] || "Volunteer",
      };
    });

    console.log("newEvent staff: ", newEventStaff);

    const updatedEvent = {
      ...event,
      name: eventName,
      startDate,
      endDate,
      description,
      participants: [...newEventStaff],
    };

    console.log("updated event : ", updatedEvent);

    onUpdate(updatedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg p-6 rounded-lg w-1/3">
        <h2 className="mb-4 font-semibold text-xl">Edit Event</h2>

        {/* Event Name */}
        <label className="block mb-2">
          <span className="text-gray-700">Event Name:</span>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </label>

        {/* Start Date */}
        <label className="block mb-2">
          <span className="text-gray-700">Start Date:</span>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </label>

        {/* End Date */}
        <label className="block mb-2">
          <span className="text-gray-700">End Date:</span>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </label>

        {/* Description */}
        <label className="block mb-4">
          <span className="text-gray-700">Description:</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </label>

        {/* Add Participants */}
        <div className="mb-4">
          <h3 className="font-medium text-md">Add Participants</h3>
          <ul>
            {members?.map((member: {memberId: string, fullName: string, role: string} | any) => (
              <li
                key={member.memberId}
                className="flex justify-between items-center py-2 border-b"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMembers?.includes(member.memberId)}
                    onChange={() => handleSelectMember(member.memberId)}
                    className="mr-2"
                  />
                  <span>{member.fullName}</span>
                </div>

                <select
                  value={roleMap[member.memberId.toString()] || "Volunteer"}
                  onChange={(e) =>
                    handleRoleChange(member?.memberId, e.target.value)
                  }
                  className="p-1 border rounded"
                >
                  <option value="Organizer">Organizer</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-500 px-4 py-2 rounded text-white"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
