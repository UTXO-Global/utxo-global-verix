import { useEffect, useMemo, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMaxDay(month: number, year: number) {
  if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return 31;
  if ([4, 6, 9, 11].includes(month)) return 30;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return 31;
}

function BirthdayInput({
  defaultValue,
  onChange,
  setError,
}: {
  defaultValue: string;
  onChange: (value: string) => void;
  setError: (error: string) => void;
}) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const numDay = useMemo(() => {
    return Number(day);
  }, [day]);

  const numMonth = useMemo(() => {
    return Number(month);
  }, [month]);

  const numYear = useMemo(() => {
    return Number(year);
  }, [year]);

  const isDayValid = useMemo(() => {
    const maxDay = getMaxDay(numDay, numYear || 1900);
    return numDay > 0 && numDay <= maxDay;
  }, [numDay, numMonth, numYear]);

  const isMonthValid = useMemo(() => {
    return numMonth > 0 && numMonth <= 12;
  }, [numMonth]);

  const isYearValid = useMemo(() => {
    return numYear > 0 && numYear <= new Date().getFullYear();
  }, [numYear]);

  const handleNumericInput = (setter: (val: string) => void) => (e: any) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setter(val);
  };

  useEffect(() => {
    if (!isDayValid) {
      setError("Day invalid");
    } else if (!isMonthValid) {
      setError("Month invalid");
    } else if (!isYearValid) {
      setError("Year invalid");
    } else {
      setError("");
    }

    const birthday = `${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}-${year.padStart(4, "0")}`;

    onChange(birthday);
  }, [day, month, year, isDayValid, isMonthValid, isYearValid]);

  useEffect(() => {
    try {
      const date = new Date(defaultValue);
      setDay(() => date.getDate().toString());
      setMonth(() => (date.getMonth() + 1).toString());
      setYear(() => date.getFullYear().toString());
    } catch (_) {}
  }, []);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-1 w-1/4">
        <label>Day</label>
        <Input
          defaultValue={day}
          type="number"
          placeholder="DD"
          onChange={handleNumericInput(setDay)}
          className={cn(
            "w-full border border-gray-600 focus:border-gray-600 focus-visible:ring-0",
            {
              "border-red-600 focus:border-red-600": !isDayValid,
            }
          )}
        />
      </div>
      <div className="flex flex-col gap-1 w-1/4">
        <label>Month</label>
        <Input
          defaultValue={month}
          type="number"
          placeholder="MM"
          onChange={handleNumericInput(setMonth)}
          className={cn(
            "w-full border border-gray-600 focus:border-gray-600 focus-visible:ring-0",
            {
              "border-red-600 focus:border-red-600": !isMonthValid,
            }
          )}
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label>Year</label>
        <Input
          defaultValue={year}
          type="number"
          placeholder="YYYY"
          onChange={handleNumericInput(setYear)}
          className={cn(
            "w-full border border-gray-600 focus:border-gray-600 focus-visible:ring-0",
            {
              "border-red-600 focus:border-red-600": !isYearValid,
            }
          )}
        />
      </div>
    </div>
  );
}

export default BirthdayInput;
