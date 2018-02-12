/**
 * kiosk-sheetscript.gs
 * Visitor Manager — Sheet Script
 *
 * @license   GPLv3, https://www.gnu.org/licenses/gpl.txt
 * @version   1.0
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
  var sheet = source.getActiveSheet();
  var name = sheet.getRange(notation.replace("B", "C")).getValue();
  var discrim = sheet.getRange(notation.replace("B", "A")).getNote();
  removeVisitorFromForm(form, name + " (" + discrim + ")");
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
