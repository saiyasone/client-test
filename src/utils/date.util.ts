import moment from "instances/moment.instance";

export const isDateEarlierThisWeek = (date) => {
  const inputDate = moment(date);
  const startOfWeek = moment().startOf("week");
  const endOfToday = moment().endOf("day");

  return inputDate.isBetween(startOfWeek, endOfToday);
};

export const isDateOnToday = (date) => {
  const inputDate = moment(date);
  const currentDate = moment();

  return inputDate.isSame(currentDate, "day");
};

export const isDateYesterday = (date) => {
  const inputDate = moment(date);
  const yesterday = moment().subtract(1, "days");

  return inputDate.isSame(yesterday, "day");
};

export const isDateLastWeek = (date) => {
  const inputDate = moment(date);
  const startOfLastWeek = moment().subtract(1, "weeks").startOf("week");
  const endOfLastWeek = moment().subtract(1, "weeks").endOf("week");

  return inputDate.isBetween(startOfLastWeek, endOfLastWeek);
};

export const isDateEarlierThisMonth = (date) => {
  const inputDate = moment(date);
  const startOfMonth = moment().startOf("month");
  const endOfToday = moment().endOf("day");

  return inputDate.isBetween(startOfMonth, endOfToday);
};

export const isDateLastMonth = (date) => {
  const inputDate = moment(date);
  const startOfLastMonth = moment().subtract(1, "months").startOf("month");
  const endOfLastMonth = moment().subtract(1, "months").endOf("month");
  return inputDate.isBetween(startOfLastMonth, endOfLastMonth);
};

export const isDateLastYear = (date) => {
  const inputDate = moment(date);
  const startOfLastYear = moment().subtract(1, "years").startOf("year");
  const endOfLastYear = moment().subtract(1, "years").endOf("year");

  return inputDate.isBetween(startOfLastYear, endOfLastYear);
};

export const isDateEarlierThisYear = (date) => {
  const inputDate = moment(date);
  const startOfLastYear = moment().startOf("year");
  const endOfLastYear = moment().endOf("day");

  return inputDate.isBetween(startOfLastYear, endOfLastYear);
};

//dayNumber implies 1 - 6 (monday - saturday), 0 is Sunday
export const isWhichWeekWhichDay = (
  date,
  subTractWeekNumber = 0,
  dayNumber = 0,
) => {
  const inputDate = moment(date).clone();
  const todayDate = moment().clone();
  const startOfWeek = todayDate
    .clone()
    .subtract(subTractWeekNumber, "week")
    .startOf("week");
  const endOfWeek = todayDate
    .clone()
    .subtract(subTractWeekNumber, "week")
    .endOf("week");
  const weekdayNumber = dayNumber + 1 >= 7 ? 0 : dayNumber + 1;
  return (
    inputDate.day() === weekdayNumber &&
    inputDate.isBetween(startOfWeek, endOfWeek)
  );
};

//weekNumber implies 0 - 4`
export const isWhichMonthWhichWeek = (
  inputDate,
  subTractMonthNumber = 0,
  weekNumber = 0,
) => {
  const givenDate = moment(inputDate).clone();
  const todayDate = moment().clone();
  const month = todayDate.clone().subtract(subTractMonthNumber, "month");
  const firstDayOfMonth = month.clone().startOf("month");
  const firstDayOfWeek = firstDayOfMonth
    .clone()
    .add(weekNumber, "week")
    .startOf("week");
  return (
    givenDate.isBetween(
      firstDayOfMonth.toDate(),
      firstDayOfMonth.endOf("month").toDate(),
    ) &&
    givenDate.isBetween(
      firstDayOfWeek.toDate(),
      firstDayOfWeek.endOf("week").toDate(),
    )
  );
};

//monthNumber implies 0 - 11
export const isWhichYearWhichMonth = (
  date,
  subtractYearNumber = 0,
  monthNumber = 0,
) => {
  const givenDate = moment(date).clone();
  const todayDate = moment().clone();
  const firstDayOfYear = todayDate
    .clone()
    .subtract(subtractYearNumber, "years")
    .startOf("year");
  const lastDayOfYear = todayDate
    .clone()
    .subtract(subtractYearNumber, "years")
    .endOf("year");
  return (
    givenDate.month() === monthNumber &&
    givenDate.isBetween(firstDayOfYear, lastDayOfYear)
  );
};

export const isLastYear = (inputDate) => {
  const givenDate = moment(inputDate);
  const theFirstDayOfLastYear = moment()
    .subtract(1, "years")
    .startOf("years")
    .toDate();
  const theLastDayOfLastYear = moment()
    .subtract(1, "years")
    .endOf("years")
    .toDate();
  return givenDate.isBetween(theFirstDayOfLastYear, theLastDayOfLastYear);
};

export const isThisYear = (inputDate) => {
  const givenDate = moment(inputDate);
  const theFirstDayOfThisYear = moment().startOf("years").toDate();
  const theLastDayOfThisYear = moment().endOf("years").toDate();
  return givenDate.isBetween(theFirstDayOfThisYear, theLastDayOfThisYear);
};

export const weeksInThisMonth = () => {
  const currentDate = moment();
  const startOfMonth = moment([currentDate.year(), currentDate.month()]);
  const endOfMonth = moment(startOfMonth).endOf("month");
  return endOfMonth.diff(startOfMonth, "weeks") + 1;
};

export const weeksInThisMonthLasTYear = () => {
  const currentDate = moment();
  const startOfMonth = moment([currentDate.year() - 1, currentDate.month()]);
  const endOfMonth = moment(startOfMonth).endOf("month");
  return endOfMonth.diff(startOfMonth, "weeks") + 1;
};

export const DATE_PATTERN_FORMAT = {
  datetime: "D MMM YYYY, h:mm A",
  date: "DD-MM-YYYY",
};

export function calculateTime(time) {
  const seconds = time / 1000;
  if (seconds < 60) {
    return `${seconds} s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} mn${minutes !== 1 ? "s" : ""}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours} h${hours !== 1 ? "s" : ""} and ${remainingMinutes} mn${
      remainingMinutes !== 1 ? "s" : ""
    }`;
  }
}

// format chat history with yesterday
export function isChatYesterday(dateStr) {
  const inputDate = new Date(dateStr.split("-").reverse().join("-"));
  const currentDate = new Date();

  currentDate.setDate(currentDate.getDate() - 1);

  return (
    inputDate.getDate() === currentDate.getDate() &&
    inputDate.getMonth() === currentDate.getMonth() &&
    inputDate.getFullYear() === currentDate.getFullYear()
  );
}

// format time-line chat with date time
export const getTimeLineChat = (date) => {
  const dateNow =
    moment(new Date()).format("HH:mm") === moment(date).format("HH:mm");

  if (dateNow) {
    return "Just now";
  }

  return moment(date).format("HH:mm").toString();
};

// formate date number
export function DateOfNumber(dateTime: string) {
  if (dateTime) {
    const date = moment(dateTime).format("DD-MM-YYYY");
    return date;
  }
}

// datetime: 01 Jun 2024 12:00
export function DateTimeFormate(dateTime: string): string | undefined {
  if (dateTime) {
    return moment(dateTime).format("DD MMM YYYY HH:mm");
  }
}

export default moment;
