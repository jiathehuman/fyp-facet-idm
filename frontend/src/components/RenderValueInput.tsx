/**
 * RenderValueInput component
 * Takes in a Detail value type and renders the appropriate input field.
 * Eg. If the input type is date, render a DateInput field for user to input date.
 */
import { RenderValueInputProps } from '@/types/types';
import {Input} from "@heroui/input";
import {DateInput} from "@heroui/date-input";
import {CalendarDate} from "@internationalized/date";

const RenderValueInput: React.FC<RenderValueInputProps> = ({
    detailValueType,
    detailString,
    setDetailString,
    detailDate,
    setDetailDate,
    // detailFile,
    setDetailFile,
}) => {
    // Switch function to render the appropriate input field based on detailValueType
    switch (detailValueType.charAt(0).toUpperCase() + detailValueType.slice(1)) {
        case 'String':
            return (
                <Input
                    label="Text value"
                    type="text"
                    value={detailString}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDetailString(e.target.value)}
                    placeholder="Enter text"
                    required
                />
            );
        case 'Date':
            let calendarDateValue: CalendarDate | null = null;
            if (detailDate) {
                // Parse the "YYYY-MM-DD"
                const [year, month, day] = detailDate.split('-').map(Number);

                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    // If the values are all present, create new CalendarDate
                    calendarDateValue = new CalendarDate(year, month, day);
                } else {
                    console.warn("Invalid date string for CalendarDate:", detailDate);
                }
            }
            return (
                <DateInput
                    label={'Choose a date'}
                    // My bday :D
                    placeholderValue={new CalendarDate(1998, 1, 5)}
                    value={calendarDateValue}
                    onChange={(date: CalendarDate | null) => {
                        setDetailDate(date ? date.toString() : '');
                    }}
                    isRequired
                />
            );
        case 'File':
            return (
                <Input
                    type="file"
                    aria-label="file-upload"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Check if files exist and select the first one
                        if (e.target.files && e.target.files.length > 0) {
                            setDetailFile(e.target.files[0]);
                        } else {
                            setDetailFile(null);
                        }
                    }}
                    isRequired
                />
            );
        case 'Image':
            return (
                <Input
                    type="file"
                    accept="image/*" // Restrict file selection to image types
                    aria-label="image-upload"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        // Check if files exist and select the first one, otherwise set to null
                        if (e.target.files && e.target.files.length > 0) {
                            setDetailFile(e.target.files[0]);
                        } else {
                            setDetailFile(null);
                        }
                    }}
                    isRequired
                />
            );
        default:
            return null; // Return null if no matching type is found
    }
};

export default RenderValueInput;
