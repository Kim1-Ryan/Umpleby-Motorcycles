const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const crypto = require("node:crypto");

function fixture() {
  const rows = [
    [
      "ID",
      "Status",
      "Request JSON",
      "Token hash",
      "Expires",
      "Calendar event ID",
      "Confirmation emailed",
    ],
  ];
  const mail = [],
    events = [];
  let failEmail = false,
    overlaps = false;
  const sheet = {
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
    appendRow: (r) => rows.push(r.slice()),
    getLastRow: () => rows.length,
    getRange: (r, c) => ({
      setValue: (v) => {
        rows[r - 1][c - 1] = v;
      },
      setValues: (values) => {
        rows[r - 1] = values[0].slice();
      },
    }),
  };
  const calendar = {
    getEvents: () =>
      overlaps
        ? [
            {
              getStartTime: () => new Date("2030-01-01T08:00:00Z"),
              getEndTime: () => new Date("2030-01-01T12:00:00Z"),
            },
          ]
        : [],
    getEventById: (id) => events.find((e) => e.getId() === id),
    createEvent: (title, start, end) => {
      const event = {
        reminders: [],
        getId: () => `event-${events.length}`,
        getStartTime: () => start,
        removeAllReminders() {
          this.reminders = [];
        },
        addPopupReminder(m) {
          this.reminders.push(m);
        },
      };
      events.push(event);
      return event;
    },
  };
  const context = vm.createContext({
    console: { error: () => {} },
    Date,
    JSON,
    Number,
    String,
    Error,
    isFinite,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => (key === "BOOKING_SHEET_ID" ? "sheet" : null),
      }),
    },
    SpreadsheetApp: {
      openById: () => ({ getSheets: () => [sheet] }),
      flush: () => {},
    },
    CalendarApp: {
      getCalendarById: (id) => {
        assert.equal(id, "admin@motocycle.co.za");
        return calendar;
      },
    },
    MailApp: {
      sendEmail: (message) => {
        if (failEmail) {
          failEmail = false;
          throw Error("Mail quota");
        }
        mail.push(message);
      },
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        hasLock: () => true,
        releaseLock: () => {},
      }),
    },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      DigestAlgorithm: { SHA_256: "sha256" },
      computeDigest: (_, v) => crypto.createHash("sha256").update(v).digest(),
      base64EncodeWebSafe: (v) => Buffer.from(v).toString("base64url"),
      formatDate: (date, zone, format) =>
        format === "yyyy-MM-dd'T'HH:mm"
          ? new Date(date.getTime() + 7200000).toISOString().slice(0, 16)
          : "Tuesday, 1 January 2030 10:00",
    },
    ScriptApp: {
      getService: () => ({
        getUrl: () => "https://script.google.com/test/exec",
      }),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
  });
  vm.runInContext(
    fs.readFileSync("server/google-apps-script/Code.gs", "utf8"),
    context,
  );
  const data = {
    requestId: crypto.randomUUID(),
    firstName: "Test",
    lastName: "Rider",
    cellNumber: "0123456789",
    email: "test@example.com",
    make: "Suzuki",
    model: "GSX",
    vin: "TESTVIN",
    mileage: "1000",
    bookingType: "Service",
    dateTime: "2030-01-01T10:00",
  };
  return {
    context,
    rows,
    mail,
    events,
    data,
    setFail: () => {
      failEmail = true;
    },
    setOverlap: () => {
      overlaps = true;
    },
    token: () =>
      new URL(mail[0].body.match(/https:\/\/\S+/)[0]).searchParams.get("token"),
  };
}
test("request emails admin once; explicit confirmation creates one event and three reminders", () => {
  const f = fixture();
  assert.equal(f.context.doPost({ parameter: f.data }).result, "success");
  assert.equal(f.mail[0].to, "admin@motocycle.co.za");
  assert.equal(f.events.length, 0);
  assert.equal(f.context.doPost({ parameter: f.data }).result, "success");
  assert.equal(f.mail.length, 1);
  const token = f.token();
  f.context.confirmBooking(f.data.requestId, token, f.data.dateTime, 60);
  assert.equal(f.events.length, 1);
  assert.deepEqual(f.events[0].reminders, [1440, 60, 10]);
  assert.equal(f.mail[1].to, "test@example.com");
  assert.equal(f.mail[1].cc, "admin@motocycle.co.za");
  f.context.confirmBooking(f.data.requestId, token, f.data.dateTime, 60);
  assert.equal(f.events.length, 1);
  assert.equal(f.mail.length, 2);
});
test("calendar overlap and invalid approval token block confirmation", () => {
  const f = fixture();
  f.context.doPost({ parameter: f.data });
  assert.throws(
    () =>
      f.context.confirmBooking(f.data.requestId, "wrong", f.data.dateTime, 60),
    /invalid or expired/,
  );
  f.setOverlap();
  assert.throws(
    () =>
      f.context.confirmBooking(
        f.data.requestId,
        f.token(),
        f.data.dateTime,
        60,
      ),
    /overlaps/,
  );
  assert.equal(f.events.length, 0);
  assert.equal(f.mail.length, 1);
});
test("failed admin mail can be retried with the same request reference", () => {
  const f = fixture();
  f.setFail();
  assert.equal(f.context.doPost({ parameter: f.data }).result, "error");
  assert.equal(f.context.doPost({ parameter: f.data }).result, "success");
  assert.equal(f.rows.length, 2);
  assert.equal(f.mail.length, 1);
});
test("failed customer confirmation reuses event on retry", () => {
  const f = fixture();
  f.context.doPost({ parameter: f.data });
  const token = f.token();
  f.setFail();
  assert.throws(
    () =>
      f.context.confirmBooking(f.data.requestId, token, f.data.dateTime, 60),
    /Mail quota/,
  );
  f.context.confirmBooking(f.data.requestId, token, f.data.dateTime, 60);
  assert.equal(f.events.length, 1);
  assert.equal(f.mail.length, 2);
});
test("past dates, invalid fields and bot submissions cannot send mail", () => {
  const f = fixture();
  assert.equal(
    f.context.doPost({ parameter: { ...f.data, dateTime: "2020-01-01T10:00" } })
      .result,
    "error",
  );
  assert.equal(
    f.context.doPost({ parameter: { ...f.data, email: "bad" } }).result,
    "error",
  );
  assert.equal(
    f.context.doPost({ parameter: { ...f.data, website: "spam" } }).result,
    "error",
  );
  assert.equal(f.mail.length, 0);
  assert.equal(f.rows.length, 1);
});
