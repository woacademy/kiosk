// ==UserScript==
// @name         Visitor Manger - User Script
// @namespace    http://www.woacademy.co.uk
// @version      2.0
// @description  Retheme, animate and refresh the visitor form.
// @author       Adam Adoch
// @match        https://docs.google.com/forms/*
// @grant        GM_addStyle
// ==/UserScript==

/**
 * Retheme the form and it's surrounding elements.
 *
 * @style Set the header colour to brand guidelines.
 * @style Set the accent banner to brand guidelines.
 * @style Set the required legend to brand guidelines.
 * @style Set the required asterisks to brand guidelines.
 * @style Set highlighted multiple choice answers to brand guidelines.
 * @style Set highlighted checkbox choice answers to brand guidelines.
 * @style Set focused input underlines to brand guidelines.
 * @style Set the focused erroneous input underlines to brand guidelines.
 * @style Set error background to brand guidelines.
 * @style Set the error message to brand guidelines.
 */
GM_addStyle(".freebirdFormviewerViewFormBanner.freebirdHeaderMast { background-color: #005FAF; }");
GM_addStyle(".freebirdFormviewerViewAccentBanner.freebirdAccentBackground { background-color: #00AEEF; }");
GM_addStyle(".freebirdFormviewerViewHeaderRequiredLegend { color: #00AEEF; }");
GM_addStyle(".freebirdFormviewerViewItemsItemRequiredAsterisk { color: #00AEEF; }");
GM_addStyle(".freebirdThemedRadio.isChecked:not(.isDisabled) .exportOuterCircle, .freebirdThemedRadio .exportInnerCircle { border-color: #00AEEF; }");
GM_addStyle(".freebirdThemedCheckbox.isChecked:not(.isDisabled) { border-color: #00AEEF; }");
GM_addStyle(".freebirdThemedInput .exportFocusUnderline { background-color: #00AEEF; }");
GM_addStyle(".HasError .freebirdFormviewerViewItemsTextShortText .exportUnderline, .HasError .freebirdFormviewerViewItemsTextShortText .exportFocusUnderline, .HasError .freebirdFormviewerViewItemsTextLongText .exportUnderline, .HasError .freebirdFormviewerViewItemsTextLongText .exportFocusUnderline { background-color: #00AEEF; }");
GM_addStyle(".freebirdFormviewerViewItemsItemItem.HasError { background-color: #FFAF197F; }");
GM_addStyle(".freebirdFormviewerViewItemsItemErrorMessage { color: #00AEEF; }");

/**
 * Visually countdown inside the innerHTML of the confirmation message.
 *
 * @param element   {Element} Confirmation message element.
 * @param positon   {Integer} Internal param to keep track of the countdown.
 * @return          {N/A}     No return.
 */
function countdownConfirmation(element, position) {
  // If the countdown has ended reset the form.
  if (position <= 0) {
    restartForm();
    return;
  }

  // Visually countdown in 100ms increments.
  element.innerHTML = element.innerHTML.replace(new RegExp("(\-)?\\d+(\.\\d+)?"), parseFloat(position).toFixed(1));
  position -= 0.1;

  // Use the bind() method to setTimeout call with params — thanks Hobblin!
  setTimeout(countdownConfirmation.bind(null, element, position - 0.1), 100);
}

/**
 * Reset the current form to its starting position.
 * @see This is used so the next visitor has a blank slate.
 *
 * @param delay     {Integer} Time to wait in seconds after call before resetting the form.
 * @noreturn
 */
function restartForm(delay) {
  if (delay === undefined) {
    window.location.replace(window.location.href);
    return;
  }

  setTimeout(restartForm, delay * 1000);
}

/**
 * Psuedo main function called when the script runs.
 * @see This is an internal function, do not call it yourself.
 *
 * @param countdown {Float}   Time to wait in seconds before resetting the form.
 * @return          {N/A}     No return.
 */
function main(countdown) {
  // Make the required questions legend stand out.
  var legends = document.getElementsByClassName("freebirdFormviewerViewHeaderRequiredLegend");
  if (legends.length > 0) {
    legends[0].innerHTML = "Questions suffixed with an asterisk <strong>(*)</strong> are required.";
  }

  // Check if we're at the end screen.
  var confirmations = document.getElementsByClassName("freebirdFormviewerViewResponseConfirmationMessage");
  if (confirmations.length > 0) {
    // Find the countdown starting position and center the string.
    confirmations[0].innerHTML = "<center>Your visit has been recorded, this form will automatically reset in <strong>" + countdown + "</strong> seconds.</center>";

    // Call the countdown function.
    countdownConfirmation(confirmations[0], countdown);
    return;
  }
}

main(9.0);
