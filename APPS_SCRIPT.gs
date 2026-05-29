/**
 * Shameless Brews — Google Apps Script Backend
 * Deploy as Web App: Execute as Me, Anyone can access
 */

var RESERVATIONS_SHEET = "Reservations";
var SUBSCRIBERS_SHEET = "Subscribers";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond(false, "Empty request body");
    }

    var data = JSON.parse(e.postData.contents);
    var source = String(data.source || "website").trim();

    // Route to appropriate handler
    if (source === "shameless-brews-lead" || data.sheet === "Subscribers") {
      return handleSubscriber(data);
    } else {
      return handleReservation(data);
    }
  } catch (err) {
    return respond(false, "Server error: " + err.message);
  }
}

function handleReservation(data) {
  var name = String(data.name || "").trim();
  var email = String(data.email || "").trim();
  var phone = String(data.phone || "").trim();
  var quantity = String(data.quantity || "").trim();
  var source = String(data.source || "website").trim();

  if (!name) return respond(false, "Missing: name");
  if (!email) return respond(false, "Missing: email");
  if (!phone) return respond(false, "Missing: phone");
  if (!quantity) return respond(false, "Missing: quantity");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(false, "Invalid email format");
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESERVATIONS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(RESERVATIONS_SHEET);
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Quantity", "Source", "Status"]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([new Date(), name, email, phone, quantity, source, "New"]);

  // Send confirmation email
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Shameless Brews — Pickup Reserved!",
      htmlBody:
        "<div style='font-family: sans-serif; max-width: 500px;'>" +
        "<h2 style='color: #16a34a;'>Thanks, " + name + "!</h2>" +
        "<p>Your pickup reservation has been received.</p>" +
        "<ul style='color: #374151;'>" +
        "<li><strong>Selection:</strong> " + quantity + "</li>" +
        "<li><strong>Location:</strong> Carmichael, California</li>" +
        "<li><strong>Next step:</strong> We'll reach out to confirm pickup timing.</li>" +
        "</ul>" +
        "<p style='margin-top: 20px;'>Questions? Just reply to this email.</p>" +
        "<p style='color: #6b7280; font-size: 12px; margin-top: 30px;'>Shameless Brews — Homegrown Hand-Pressed Organic Juice</p>" +
        "</div>"
    });
  } catch (mailErr) {
    Logger.log("Email failed: " + mailErr.message);
  }

  // Notify business
  try {
    MailApp.sendEmail({
      to: "shamelessbidetsceo@gmail.com",
      subject: "New Pickup Reservation — " + name,
      htmlBody:
        "<div style='font-family: sans-serif;'>" +
        "<h3>New Shameless Brews Reservation</h3>" +
        "<p><strong>Name:</strong> " + name + "</p>" +
        "<p><strong>Email:</strong> " + email + "</p>" +
        "<p><strong>Phone:</strong> " + phone + "</p>" +
        "<p><strong>Selection:</strong> " + quantity + "</p>" +
        "<p><strong>Source:</strong> " + source + "</p>" +
        "</div>"
    });
  } catch (notifyErr) {
    Logger.log("Notify email failed: " + notifyErr.message);
  }

  return respond(true, "Reservation saved", { row: sheet.getLastRow() });
}

function handleSubscriber(data) {
  var email = String(data.email || "").trim();
  var name = String(data.name || "").trim();
  var source = String(data.source || "lead-magnet").trim();

  if (!email) return respond(false, "Missing: email");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(false, "Invalid email format");
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SUBSCRIBERS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SUBSCRIBERS_SHEET);
    sheet.appendRow(["Timestamp", "Email", "Name", "Source"]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([new Date(), email, name, source]);

  // Send welcome email with discount code
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Your 20% Off Code — Shameless Brews",
      htmlBody:
        "<div style='font-family: sans-serif; max-width: 500px;'>" +
        "<h2 style='color: #16a34a;'>Welcome to Shameless Brews!</h2>" +
        "<p>Thanks for signing up" + (name ? ", " + name : "") + "!</p>" +
        "<div style='background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;'>" +
        "<p style='margin: 0; color: #374151;'>Your 20% off code:</p>" +
        "<p style='font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0;'>FRESH20</p>" +
        "</div>" +
        "<p>Use this code on your first order. Ready to try real juice?</p>" +
        "<p><a href='https://shamelessbrews.com' style='color: #16a34a;'>Order Now →</a></p>" +
        "<p style='color: #6b7280; font-size: 12px; margin-top: 30px;'>Shameless Brews — Homegrown Hand-Pressed Organic Juice</p>" +
        "</div>"
    });
  } catch (mailErr) {
    Logger.log("Welcome email failed: " + mailErr.message);
  }

  return respond(true, "Subscriber added", { row: sheet.getLastRow() });
}

function doGet(e) {
  return respond(true, "Shameless Brews API is live", { version: "1.0" });
}

function respond(ok, message, extra) {
  var payload = { ok: ok, message: message };
  if (extra) {
    for (var key in extra) {
      payload[key] = extra[key];
    }
  }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
