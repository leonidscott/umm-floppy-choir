floppy_single_test was made to play one frequency on one drive for testing
and for becoming familiar with floppy drive I/O.

floppy_drive_test.ino is mostly the same as floppy_control.ino, but with some changes to make
sending commands over Serial through the Arduino Serial Monitor possible. This also uses
different STARTING_PIN than floppy_control, because Arduino Uno does not have 22 pins.

The MESSAGE constants now correspond to ASCII characters so that they can be printed and sent over Serial within
the Arduino serial monitor (rather than through a program)

### The following commands can be made by sending over serial:
	"R   " to reset all (1) drives
	"K   " to have the arduino send back MESSAGE_OK
	"f0##" to set the arduino to play a frequency.
		0 corresponds to drive index 0
		put in any characters for ##, the sum of the ASCII values of
		those characters will be the frequency played by the drive."

NOTE: It's important to note that every command sent to the arduino must be 4 bytes and
the arduino won't perform an action until 4 bytes have been sent, hence "R   " rather than "R"

Another thing important for this is the set up of the arduino and the floppy drive.
PIN 4 corresponds to the direction pin for the floppy
PIN 5 corresponds to the step pin for the floppy
	also plug PIN 5 into the "Drive Select 1" pin on the floppy because that makes it work for some reason.

### How to set up the floppy
Attach Arduino to Serial port of computer
Wire PIN 5 to a breadboard so its signal can be shared
	Wire PIN 5 to the pin to the 6th pin along the top of the drive (pin 12)
	Wire PIN 5 to the pin to the 10th pin along the top of the drive (pin 20)
Wire PIN 4 to the 9th pin along the top of the drive (pin 18)

Once everything is wired together you can send commands like
"R  ",
"f0aa",
"f0za",
"f0  ",
"f0d$"
