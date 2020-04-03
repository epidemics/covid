import * as moment from "moment";

const KEY = "consulting_dismissed";
const DISMISSAL_DURATION = { days: 1 };
const ALERT_ID = "consultingAlert";

// control the consulting alert, using a Storage object
function controlConsultingAlert($alert: HTMLElement, storage: Storage) {
  let alertId = $alert.dataset.id;

  function shouldDisplay() {
    if (!storage) {
      return true;
    }

    let raw = storage.getItem(KEY);
    if (raw === null) {
      return true;
    }

    let dismissed;
    try {
      dismissed = JSON.parse(raw);
      dismissed.date = moment(dismissed.date);

      if (!dismissed.date.isValid()) {
        throw new Error();
      }
    } catch {
      // the stored item is somehow invalid, remove it
      storage.removeItem(KEY);
      return true;
    }

    // display if the alert has a different id or the maximal
    // date has not yet been exceded
    return (
      dismissed.id !== alertId ||
      dismissed.date.add(DISMISSAL_DURATION).isBefore(moment())
    );
  }

  if (shouldDisplay()) {
    $($alert)
      .removeClass("d-none")
      .on("closed.bs.alert", () => {
        let dismissed = {
          date: moment().toISOString(),
          id: alertId
        };

        storage.setItem(KEY, JSON.stringify(dismissed));
      });
  }
}

let $alert = document.getElementById(ALERT_ID);
if ($alert) {
  controlConsultingAlert($alert, window.sessionStorage);
}
