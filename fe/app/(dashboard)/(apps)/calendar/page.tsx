import { getCategories, getEvents } from "@/config/calendar.config";
import CalendarView from "./calender-view";
export const metadata = {
  title: "Calender",
};
const CalenderPage = async () => {
  const events = await getEvents();
  const categories = await getCategories();
  return (
    <div>
      <CalendarView events={events?.data} categories={categories?.data} />
    </div>
  );
};

export default CalenderPage;
