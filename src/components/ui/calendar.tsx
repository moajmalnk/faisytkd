import * as React from "react";
import CustomCalendar, { type CustomCalendarProps } from "./CustomCalendar";

export type CalendarProps = CustomCalendarProps;

function Calendar(props: CalendarProps) {
  return <CustomCalendar {...props} />;
}
Calendar.displayName = "Calendar";

export { Calendar };
