import * as moment from "moment";

export interface Alert {
  id: string;
  dismissalDuration: moment.DurationInputObject;
  storage?: "session" | "local";
  revision: string | null;
  content: string;
}
