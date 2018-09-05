/**
 * kiosk-sheetscript.gs
 * Visitor Manager — Sheet Script
 *
 * @license   GPLv3, https://www.gnu.org/licenses/gpl.txt
 * @version   1.1
 * @author    Adam Adoch
 * @updated   12/02/2018
 * @link      http://www.woacademy.co.uk
 */
var REMOVEVISITOR = -1;
var VISITORFORMID = "";

/**
 * Called whenever a cell is edited.
 *
 * @param e         {Object}  GAS event parameter.
 * @return          {N/A}     No return.
 */
function onEdit(e) {
  // Allow staff to manually sign out visitors.
  if (e.value !== "x")
    return;

  // Only listen in the B column.
  var notation = e.range.getA1Notation();
  if (new RegExp("B[0-9]+").test(notation) !== true)
    return;

  // Try and load the form.
  var form = FormApp.openById(VISITORFORMID);
  if (form === null)
      return;

  // Get the visitor's name and sign in time.
  var sheet = e.source.getActiveSheet();
  var name = sheet.getRange(notation.replace("B", "C")).getValue();
  var discrim = sheet.getRange(notation.replace("B", "A")).getNote();
  removeVisitorFromForm(form, name + " (" + discrim + ")");

  // Sign the user out on the sheet.
  e.range.setValue(getPreferredTime());
}

/**
 * Sign out any stale visitors at the end of the day.
 *
 * @return          {N/A}     No return.
 */
function signAllVisitorsOut() {
  var form = FormApp.openById(VISITORFORMID);
  if (form === null)
      return;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet === null)
    return;

  var todaysheet = spreadsheet.getSheetByName(getShortDayName());
  if (todaysheet === null)
      return;

  // Find the last row in today's sheet.
  var range = todaysheet.getRange("A2:A").getValues();
  var last = range.filter(String).length + 1;

  // Loop through today's visitors.
  for (var i = 2; i <= last; i++) {
    var outtime = todaysheet.getRange("B" + i);
    if (outtime.getValue() !== "")
      continue;

    var name = todaysheet.getRange("C" + i).getValue();
    var discrim = todaysheet.getRange("A" + i).getNote();
    removeVisitorFromForm(form, name + " (" + discrim + ")");

    // Sign the user out on the sheet.
    outtime.setValue(getPreferredTime());
  }
}

/**
 * Move all visit records to the archive sheet.
 *
 * @return          {N/A}     No return.
 */
function archiveRecords() {
  // Load the archive sheet.
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet === null)
    return;

  var archivesheet = spreadsheet.getSheetByName("archive");
  if (archivesheet === null)
      return;

  // Loop through each day sheet.
  var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  days.forEach(function(day) {
    var todaysheet = spreadsheet.getSheetByName(day);
    if (todaysheet === null)
      return;

    // Find the last row in this sheet.
    var range = todaysheet.getRange("A2:A").getValues();
    var last = range.filter(String).length + 1;

    // Manually archive each row due to getDataRange problems.
    for (var i = 2; i <= last; i++) {
      var values = todaysheet.getRange("A" + i + ":J" + i);
      archivesheet.appendRow(values.getValues()[0]);

      // Cleanup.
      values.clearNote();
      values.clearContent();
    }
  });
}

/**
 * Remove a visitor from the sign out section of the form.
 *
 * @param form      {Form}    Form to use.
 * @param value     {String}  Value to remove.
 * @return          {N/A}     No return.
 */
function removeVisitorFromForm(form, value) {
  // Find the sign out question and fetch it's choices.
  var item = form.getItemById(REMOVEVISITOR).asCheckboxItem();
  var choices = item.getChoices();

  // Find the index of the removed visitor.
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].getValue() !== value)
      continue;

    // Change behaviour based on the amount of signed in visitors.
    if (choices.length > 1)
      choices.splice(i, 1);
    else
      choices = [item.createChoice("No visitors are currently signed in.")];

    item.setChoices(choices);
    return;
  }
}

/**
 * Get the datetime in our preferred format. (e.g. 09/02/2018 @ 14:30)
 * @see docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
 *
 * @param time      {Date}    Time to use instead of current time.
 * @return          {String}  Time in "dd/MM/yy @ HH:mm" format.
 */
function getPreferredTime(time) {
  // JS doesn't support default-value kwargs?
  if (time === undefined)
    time = new Date();

  return Utilities.formatDate(time, "Europe/London", "dd/MM/yy @ HH:mm");
}

/**
 * Get the day in 3 letter format. (e.g. Mon, Tue, etc.)
 * @see docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
 *
 * @param time      {Date}    Time to use instead of current time.
 * @return          {String}  Time in "EEE" format.
 */
function getShortDayName(time) {
  // JS STILL doesn't support default-value kwargs?
  if (time === undefined)
    time = new Date();

  return Utilities.formatDate(time, "Europe/London", "EEE");
}
