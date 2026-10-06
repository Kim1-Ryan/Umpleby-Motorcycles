const ADMIN_EMAIL = "admin@motocycle.co.za";
const ZONE = "Africa/Johannesburg";
const HEADERS = [
  "ID",
  "Status",
  "Request JSON",
  "Token hash",
  "Expires",
  "Calendar event ID",
  "Confirmation emailed",
];

// Run once in the editor. Configure CALENDAR_ID and BOOKING_MINUTES in Script Properties first if needed.
function setupBookings() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("BOOKING_SHEET_ID")) {
    const file = SpreadsheetApp.create("Umpleby workshop booking requests");
    file.getSheets()[0].appendRow(HEADERS);
    props.setProperty("BOOKING_SHEET_ID", file.getId());
  }
  const calendar = calendar_();
  console.log("Booking calendar: " + calendar.getName());
  console.log("Booking sheet: " + props.getProperty("BOOKING_SHEET_ID"));
  MailApp.getRemainingDailyQuota();
}
function sheet_() {
  const id =
    PropertiesService.getScriptProperties().getProperty("BOOKING_SHEET_ID");
  if (!id) throw new Error("Run setupBookings before accepting bookings.");
  return SpreadsheetApp.openById(id).getSheets()[0];
}
function calendar_() {
  const id =
    PropertiesService.getScriptProperties().getProperty("CALENDAR_ID") ||
    ADMIN_EMAIL;
  const calendar = id
    ? CalendarApp.getCalendarById(id)
    : CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error("Booking calendar is unavailable.");
  return calendar;
}
function duration_() {
  const value = Number(
    PropertiesService.getScriptProperties().getProperty("BOOKING_MINUTES") ||
      60,
  );
  if (!Number.isInteger(value) || value < 10 || value > 480)
    throw new Error("Invalid booking duration.");
  return value;
}
function date_(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Choose a valid date and time.");
  const result = new Date(value + ":00+02:00");
  if (
    !isFinite(result.getTime()) ||
    Utilities.formatDate(result, ZONE, "yyyy-MM-dd'T'HH:mm") !== value ||
    result <= new Date()
  ) {
    throw new Error("Choose a valid future date and time.");
  }
  return result;
}
function hash_(value) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value),
  );
}
function esc_(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function details_(data) {
  return [
    ["Name", data.firstName + " " + data.lastName],
    ["Email", data.email],
    ["Phone", data.cellNumber],
    ["Motorcycle", data.make + " " + data.model],
    ["VIN", data.vin],
    ["Mileage (km)", data.mileage || "Not provided"],
    ["Service", data.bookingType],
    ["Preferred slot (South Africa)", data.dateTime.replace("T", " ")],
  ]
    .map((pair) => pair[0] + ": " + pair[1])
    .join("\n");
}
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function find_(sheet, id) {
  const rows = sheet.getDataRange().getValues();
  const index = rows.findIndex((row, i) => i > 0 && row[0] === id);
  return index < 0 ? null : { number: index + 1, values: rows[index] };
}
function authorised_(id, token) {
  const record = find_(sheet_(), id);
  if (
    !record ||
    !token ||
    record.values[3] !== hash_(token) ||
    Number(record.values[4]) < Date.now()
  ) {
    throw new Error(
      "This approval link is invalid or expired. Contact the dealership.",
    );
  }
  return record;
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const input = e.parameter || {};
    if (input.website) throw new Error("Invalid request.");
    const data = {};
    const fields = [
      "firstName",
      "lastName",
      "cellNumber",
      "email",
      "make",
      "model",
      "vin",
      "mileage",
      "bookingType",
      "dateTime",
    ];
    fields.forEach((key) => {
      data[key] = String(input[key] || "").trim();
      if (data[key].length > 250 || /[\r\n]/.test(data[key]))
        throw new Error("Invalid field value.");
      if (key !== "mileage" && !data[key])
        throw new Error("Complete all required fields.");
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      throw new Error("Enter a valid email address.");
    date_(data.dateTime);
    const id = String(input.requestId || "");
    if (!/^[a-f0-9-]{36}$/i.test(id))
      throw new Error("Invalid request reference.");
    lock.waitLock(20000);
    const sheet = sheet_();
    let record = find_(sheet, id);
    if (record) {
      if (record.values[2] !== JSON.stringify(data))
        throw new Error(
          "This reference has different details. Refresh the form.",
        );
      if (record.values[1] !== "email-failed")
        return json_({ result: "success", requestId: id });
    }
    const token = Utilities.getUuid() + Utilities.getUuid();
    const values = [
      id,
      "email-failed",
      JSON.stringify(data),
      hash_(token),
      Date.now() + 7 * 86400000,
      "",
      "",
    ];
    if (record)
      sheet.getRange(record.number, 1, 1, HEADERS.length).setValues([values]);
    else {
      sheet.appendRow(values);
      record = { number: sheet.getLastRow() };
    }
    SpreadsheetApp.flush();
    const url = ScriptApp.getService().getUrl();
    if (!url) throw new Error("Deploy the script as a web app first.");
    const review =
      url +
      "?id=" +
      encodeURIComponent(id) +
      "&token=" +
      encodeURIComponent(token);
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      replyTo: data.email,
      name: "Umpleby booking requests",
      subject:
        "Booking request: " +
        data.firstName +
        " " +
        data.lastName +
        " — " +
        data.dateTime.replace("T", " "),
      body:
        details_(data) +
        "\n\nReview and confirm this request: " +
        review +
        "\nApproval link expires in seven days.",
      htmlBody:
        '<h2>Workshop booking request</h2><pre style="white-space:pre-wrap">' +
        esc_(details_(data)) +
        "</pre>" +
        '<p><a href="' +
        esc_(review) +
        '">Review slot and confirm booking</a></p><p>Nothing is booked until you confirm. You may change the time and duration before confirming. This private approval link expires in seven days; do not forward it.</p>',
    });
    sheet.getRange(record.number, 2).setValue("pending");
    return json_({ result: "success", requestId: id });
  } catch (error) {
    console.error(error);
    return json_({
      result: "error",
      message:
        "Your request could not be confirmed. Please contact the dealership before retrying.",
    });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
function doGet(e) {
  try {
    const id = String(e.parameter.id || ""),
      token = String(e.parameter.token || "");
    const record = authorised_(id, token),
      data = JSON.parse(record.values[2]);
    const template = HtmlService.createTemplateFromFile("Approval");
    template.id = id;
    template.token = token;
    template.data = data;
    template.details = details_(data);
    template.status = record.values[1];
    template.minutes = duration_();
    return template.evaluate().setTitle("Confirm Umpleby booking");
  } catch (error) {
    return HtmlService.createHtmlOutput(
      "<h2>Booking approval unavailable</h2><p>" + esc_(error.message) + "</p>",
    );
  }
}
// Called only by the review page. GET requests never create calendar events.
function confirmBooking(id, token, dateTime, minutes) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const record = authorised_(id, token),
      data = JSON.parse(record.values[2]),
      sheet = sheet_();
    const calendar = calendar_();
    let event;
    if (record.values[5]) {
      event = calendar.getEventById(record.values[5]);
      if (!event)
        throw new Error(
          "The recorded calendar event is missing. Contact the administrator before retrying.",
        );
    } else {
      const start = date_(String(dateTime));
      minutes = Number(minutes);
      if (!Number.isInteger(minutes) || minutes < 10 || minutes > 480)
        throw new Error("Duration must be 10–480 minutes.");
      const end = new Date(start.getTime() + minutes * 60000);
      if (
        calendar
          .getEvents(start, end)
          .some(
            (event) => event.getStartTime() < end && event.getEndTime() > start,
          )
      ) {
        throw new Error(
          "This slot overlaps an existing calendar event. Choose another time.",
        );
      }
      event = calendar.createEvent(
        "Workshop: " +
          data.firstName +
          " " +
          data.lastName +
          " — " +
          data.make +
          " " +
          data.model,
        start,
        end,
        {
          description: details_(data) + "\nBooking reference: " + id,
          location: "Umpleby Motorcycles, Durban",
        },
      );
      sheet.getRange(record.number, 6).setValue(event.getId());
      SpreadsheetApp.flush();
    }
    // Reapplied safely if a previous request was interrupted after event creation.
    event.removeAllReminders();
    [1440, 60, 10].forEach((minutes) => event.addPopupReminder(minutes));
    sheet.getRange(record.number, 2).setValue("confirmed");
    if (record.values[6] !== "sent") {
      const slot = Utilities.formatDate(
        event.getStartTime(),
        ZONE,
        "EEEE, d MMMM yyyy HH:mm",
      );
      MailApp.sendEmail({
        to: data.email,
        cc: ADMIN_EMAIL,
        replyTo: ADMIN_EMAIL,
        name: "Umpleby Motorcycles",
        subject: "Your workshop booking is confirmed",
        body:
          "Hi " +
          data.firstName +
          ",\n\nYour booking is confirmed for " +
          slot +
          " (South African time).\nService: " +
          data.bookingType +
          "\nMotorcycle: " +
          data.make +
          " " +
          data.model +
          "\n\nPlease contact " +
          ADMIN_EMAIL +
          " or 031 303 8323 if you need to change your booking.\n\nUmpleby Motorcycles",
      });
      sheet.getRange(record.number, 7).setValue("sent");
    }
    return {
      message:
        "Booking confirmed, calendar event created, and confirmation emailed. Calendar notifications are set for one day, one hour and 10 minutes before.",
    };
  } finally {
    lock.releaseLock();
  }
}
