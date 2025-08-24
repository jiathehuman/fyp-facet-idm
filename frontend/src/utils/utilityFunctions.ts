//@ts-ignore
import { isAxiosError } from "axios";
type SetErrorFunction = React.Dispatch<React.SetStateAction<string | null>>;

export function handleError(err: any, setError: SetErrorFunction) {
  if (isAxiosError(err)) {
    setError(err.message);
    console.error("Error fetching details:", err.response?.data || err.message);
  } else if (err instanceof Error) {
    // Else it is a standard error
    setError(err.message);
    console.error("Error fetching details:", err.message);
  } else {
    // Else it is an error of unknown type
    setError("An unknown error occurred.");
    console.error("Error fetching details (unknown type):", err);
  }
}
