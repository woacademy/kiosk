#NoEnv
#MaxHotkeysPerInterval 1000
SendMode Input
SetWorkingDir %A_ScriptDir%

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; kiosk-hotkeys.ahk
; Visitor Manger - Hotkeys
;
; @license  GPLv3, https://www.gnu.org/licenses/gpl.txt
; @version  1.0
; @author   Adam Adoch
; @updated  10/02/2018
; @link     http://www.woacademy.co.uk
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; Unbind function keys (F12 is used in the custom escape bind).
F1::
F2::
F3::
F4::
F5::
F6::
F7::
F8::
F9::
F10::
F11::
F13::
F14::
F15::
F16::
F17::
F18::
F19::
F20::
F21::
F22::
F23::
F24::

; Unbind arrow keys.
Up::
Down::
Left::
Right::

; Unbind Ctrl keys (disabled through ScanMode Map too).
LCtrl::
RCtrl::

; Unbind Alt keys.
LAlt::
RAlt::

; Unbind Windows keys.
LWin::
RWin::

; Unbind menu key and Alt+Space combination.
AppsKey::
!Space::

; Unbind Tab key.
Tab::

; Unbind Enter key.
Enter::

; Unbind Shift+X combinations (keep Shift+Alphabetic working).
LShift & F3::
LShift & F5::
LShift & F6::
LShift & F10::
LShift & Tab::
LShift & Escape::
RShift & F3::
RShift & F5::
RShift & F6::
RShift & F10::
RShift & Tab::
RShift & Escape::

; Unbind certain custom media keys.
Sleep::
Browser_Search::
Browser_Home::
Launch_Mail::
Media_Play_Pause::
Media_Stop::
Media_Prev::
Media_Next::
Volume_Mute::

; Custom Alt+F4 bind (guess it and you can have a cookie).
F12::
If !GetKeyState("b") || !GetKeyState("e") || !GetKeyState("c")
|| !GetKeyState("k") || !GetKeyState("y")
  Return

Send !{f4}
Return
