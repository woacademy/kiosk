/**
 * kiosk-formscript.gs
 * Visitor Manager — Form Script
 *
 * @license   GPLv3, https://www.gnu.org/licenses/gpl.txt
 * @version   2.0
 * @author    Adam Adoch
 * @updated   10/02/2018
 * @link      http://www.woacademy.co.uk
 */
var RESPONSEBOUND = -1;
var VISITORSIGNID = -1;
var SPREADSHEETID = "";
var VISITORFORMID = "";
var Columns = {
  Column_SignedIn:        0,
  Column_SignedOut:       1,
  Column_Name:            2,
  Column_Organisation:    3,
  Column_Visitee:         4,
  Column_VisiteeRole:     5,
  Column_CarRegistration: 6,
  Column_DBSNumber:       7,
  Column_ID:              8,
  Column_Notes:           9,
  MAX_COLUMNS:            10
};

/**
 * Called whenever a form response is submitted.
 *
 * @param e         {Object}  GAS event parameter.
 * @return          {N/A}     No return.
 */
function onSubmit(e) {
  // Try and load the spreadsheet.
  spreadsheet = SpreadsheetApp.openById(SPREADSHEETID);
  if (spreadsheet === null)
    return;

  // Resolve relevant submission information.
  time = e.response.getTimestamp();
  responses = e.response.getItemResponses();
  todaysheet = spreadsheet.getSheetByName(getShortDayName(time));
  
  // Determine whether they're signing in or out.
  if (responses.length > RESPONSEBOUND) {
    signVisitorIn(e.source, time, todaysheet, responses);
  } else {
    signVisitorOut(e.source, time, todaysheet, responses);
  }
}

/**
 * Add a visitor to the spreadsheet and the sign out section.
 *
 * @param form      {Form}    Form used during sign in.
 * @param time      {Date}    Time visitor signed in.
 * @param sheet     {Sheet}   Sheet to log info on.
 * @param responses {Array}   Visitor's form responses.
 * @return          {N/A}     No return.
 */
function signVisitorIn(form, time, sheet, responses) {
  // Push responses to an array before appending.
  var row = new Array(Columns.MAX_COLUMNS);
  row[Columns.Column_SignedIn] = getPreferredTime(time);
  row[Columns.Column_SignedOut] = "";
  row[Columns.Column_DBSNumber] = "";
  row[Columns.Column_ID] = "";
  row[Columns.Column_Notes] = "";

  // Gather the responses we want.
  for (var i = 0; i < responses.length; i++) {
    // Get the current response's value.
    var response = responses[i].getResponse();

    // Magic numbers :(
    switch (i) {
      case 1:
        row[Columns.Column_Name] = response;
      case 2:
        row[Columns.Column_Organisation] = response;
      case 3:
        row[Columns.Column_Visitee] = response;
      case 4:
        row[Columns.Column_VisiteeRole] = response;
      case 5:
        row[Columns.Column_CarRegistration] = response;
    }
  }

  // Sleeping for the row to be appended is probably necessary.
  sheet.appendRow(row);
  Utilities.sleep(9 * 1000);
  setLastACellNote(sheet, time.getTime());

  // Add the visitor to the sign out form.
  addVisitorToForm(form, row[Columns.Column_Name], time.getTime());
}

/**
 * Remove a visitor from the sign out section and mark them as signed out.
 *
 * @param form      {Form}    Form used during sign out.
 * @param time      {Date}    Time visitor signed out.
 * @param sheet     {Sheet}   Sheet to log info on.
 * @param responses {Array}   Visitor's form responses.
 * @return          {N/A}     No return.
 */
function signVisitorOut(form, time, sheet, responses) {
  // Loop through each signing out visitor seperately.
  var visitors = responses[1].getResponse();
  for (var visitor = 0; visitor < visitors.length; visitor++) {
    // Use RegEx to find the sign in time.
    var timestamp = visitors[visitor].match(new RegExp("[0-9]+"));
    if (timestamp === null)
      continue;
    
    // Look for the visitor who signed in at that time.
    var notes = sheet.getRange("A2:A").getNotes();
    for (var note = 0; note < notes.length; note++) {
      if (notes[note] != timestamp[0])
        continue;

      sheet.getRange("B" + (note + 2)).setValue(getPreferredTime(time));
      removeVisitorFromForm(form, visitors[visitor]);
      break;
    }
  }
}

/**
 * Add a visitor to the sign out section of the form.
 *
 * @param form      {Form}    Form to use.
 * @param name      {String}  Visitor's name.
 * @param discrim   {Integer} Numerical discriminator.
 * @return          {N/A}     No return.
 */
function addVisitorToForm(form, name, discrim) {
  // Find the sign out question and fetch it's choices.
  var item = form.getItemById(VISITORSIGNID).asCheckboxItem();
  var choices = item.getChoices();

  // Get the first choice's value.
  var first = choices[0].getValue();
  var choice = name + " (" + discrim + ")";

  // Discern whether there are currently no choices.
  if (choices.length > 1) {
    // If there's already 2+ just append the new visitor.
    choices.push(item.createChoice(choice));
  } else {
    // The choice could be something else as well.
    if (first.indexOf("No visitors are") !== -1)
      choices = [item.createChoice(choice)];
    else
      choices.push(item.createChoice(choice));
  }

  item.setChoices(choices);
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
  var item = form.getItemById(VISITORSIGNID).asCheckboxItem();
  var choices = item.getChoices();

  // Find the index of the removed visitor.
  var index = -1;
  for (var i = 0; i < choices.length; i++) {
    if (choices[i].getValue() !== value)
      continue;

    index = i;
    break;
  }

  // Change behaviour based on the amount of signed in visitors.
  if (choices.length > 1)
    choices.splice(index, 1);
  else
    choices = [item.createChoice("No visitors are currently signed in.")];

  item.setChoices(choices);
}

/**
 * Set the last A cell's note.
 *
 * @param sheet     {Sheet}   Sheet to search in.
 * @param note      {Integer} New numerical note value.
 */
function setLastACellNote(sheet, note) {
  // Find the last A column cell.
  var range = sheet.getRange("A2:A").getValues();
  var last = range.filter(String).length + 1;
  
  // Set the cell note.
  sheet.getRange("A" + last).setNote(note);
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
