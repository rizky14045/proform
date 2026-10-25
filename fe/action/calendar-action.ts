"use server";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/config/calendar.config";

export const AddEvent = async (data: any) => {
  const response = await createEvent(data);
  return response;
};

export const deleteEventAction = async (id: any) => {
  const response = await deleteEvent(id);
  return response;
};

// update event
export const updateEventAction = async (id: any, data: any) => {
  const response = await updateEvent(id, data);
  return response;
};
