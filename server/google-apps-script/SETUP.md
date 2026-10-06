# Activate booking emails and calendar approvals

This code is prepared locally. It does not send mail or change a calendar until you deploy it and configure the website.

1. Sign into Google as admin@motocycle.co.za (or an account with permission to edit that Google Calendar). If this mailbox does not have a Google Calendar, create or select the workshop calendar and use its Calendar ID instead.
2. Create a Google Apps Script project. Copy `Code.gs` into the script, add an HTML file named `Approval` with `Approval.html`, and enable the manifest in Project Settings to copy `appsscript.json`.
3. Under Project Settings → Script Properties, set `CALENDAR_ID` to `admin@motocycle.co.za` (the default) or the workshop calendar's actual ID. Optional: set `BOOKING_MINUTES` to the default appointment duration; it defaults to 60. The admin can adjust the final slot and duration on the approval page.
4. Run `setupBookings` once and authorise the script's spreadsheet, email and calendar permissions. It creates a private booking log spreadsheet and stores its ID automatically. Do not publish this spreadsheet. The setup log identifies the calendar and sheet.
5. Deploy → New deployment → Web app. Execute as the deploying account; allow Anyone so the public website can submit requests. Approvals are protected by private, unguessable links that expire after seven days. Anyone holding that link can confirm that request: keep it private. Opening a link only reviews the request; the explicit confirmation button performs approval.
6. Copy the deployment URL ending in `/exec`. Create `.env.local` from `.env.example`, set `VITE_BOOKING_ENDPOINT` to the URL, and rebuild/deploy the React site. This URL is public configuration, not a secret. After script edits, update the web app deployment to a new version.
7. Verify with an explicitly identified test request: check the admin inbox, open the review link, select a suitable slot and duration, confirm, and check the customer's confirmation email plus the calendar event's three reminders. Also verify an overlapping slot is rejected and reopening the approval does not create another event. Delete the test event through Google Calendar when finished.

## Behaviour

- Every submitted field appears in the email to admin@motocycle.co.za, with the customer's email as Reply-To. Data is also stored in the private sheet to track pending/confirmed requests and prevent duplicate retries.
- The admin reviews and can change the requested slot/duration before explicitly confirming. An overlap with any event on the selected calendar blocks approval; this assumes one workshop slot at a time. It does not check other calendars or staff schedules. External calendar edits can still race with confirmation, so review availability.
- On confirmation, the event is created in the selected calendar and the customer is emailed, with admin copied. Three popup reminders are set for 1440, 60 and 10 minutes before the event. These are calendar notifications for the managing Google account, not scheduled reminder emails to the customer. Google Calendar notifications must be enabled on that account/device; past reminder times for short-notice bookings cannot fire retroactively.
- A repeated approval reuses the recorded event. If confirmation email fails, retrying the link retries notification. If delivery completed but recording that completion failed, a duplicate confirmation email is possible; no email provider can guarantee exactly-once delivery with this design.
- Google mail quotas apply to the deploying account. Emails are sent from that account, with admin@motocycle.co.za as Reply-To on confirmations. For that address to be the sender, deploy under its Google account.
- The browser needs to be able to read the Apps Script JSON response. Verify from the actual hosting domain; do not use `no-cors` because it cannot confirm delivery. If your Google Workspace policy disallows anonymous Apps Script deployment, a hosted server/API is required instead.
- No live test emails or calendar writes were performed during local implementation.
