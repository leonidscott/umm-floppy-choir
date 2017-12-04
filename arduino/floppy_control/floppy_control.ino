#include <TimerOne.h>

// timing loop period (microseconds)
#define LOOP_RESOLUTION 40

// head position range
#define HEAD_MIN 0
#define HEAD_MAX 82

// frequency range (A0 through B4)
#define FREQUENCY_MIN 27
#define FREQUENCY_MAX 494

// pin range
#define STARTING_PIN 22
#define ENDING_PIN 53
// we assume direction pins occur on evens and step pins occur on odds
// (so for drive 0, direction is pin 22 and step is pin 23)

// the drive count
byte drives = 0;

// head directions (by drive)
byte* directions;

// active periods (by drive)
int* periods;

// head positions (by drive)
byte* positions;

// elapsed ticks (by drive)
// used to know when to step
int* ticks;

// serial command codes
enum {
  MESSAGE_OK = 000,
  MESSAGE_INVALID = 001,
  MESSAGE_ACTIVE = 010,
  MESSAGE_RESET_ALL = 011,
  MESSAGE_RESET_ONE = 012,
  MESSAGE_SET_FREQUENCY = 020,
};

void setup() {
  // figure out how many drives we have
  for (byte pin = STARTING_PIN; pin < ENDING_PIN; pin += 2) {
    pinMode(pin, INPUT);
    digitalWrite(pin, LOW);

    if (digitalRead(pin) == HIGH) {
      drives += 1;
    }

    pinMode(pin, OUTPUT);
    pinMode(pin + 1, OUTPUT);
  }

  // set up state accordingly
  directions = (byte*) malloc(drives * sizeof(byte));
  periods = (int*) malloc(drives * sizeof(int));
  positions = (byte*) malloc(drives * sizeof(byte));
  ticks = (int*) malloc(drives * sizeof(int));

  // initialize state
  for (byte drive = 0; drive < drives; drive++) {
    directions[drive] = HIGH;
    periods[drive] = 0;
    positions[drive] = 0;
    ticks[drive] = 0;
  }

  // initialize serial interface
  Serial.begin(57600);

  // set the drives to starting position if they aren't already
  resetDrives();

  // initialize the timing loop
  Timer1.initialize(LOOP_RESOLUTION);
  Timer1.attachInterrupt(tick);

  // send a ready notification
  Serial.write(MESSAGE_OK);
  Serial.write(0);
}

// handles serial communication
void loop() {
  // each command is four bytes
  static byte buffer[4];
  static int index;

  while (Serial.available() > 0) {
    buffer[index] = Serial.read();
    index++;

    if (index > 3) {
      index = 0;
      process(buffer);
    }
  }
}

// responds to a command
void process(byte command[4]) {
  // each response is two bytes
  byte response[2];

  switch (command[0]) {
    // simple ping
    case MESSAGE_OK:
      response[0] = MESSAGE_OK;
      break;

    // gets active drive count
    case MESSAGE_ACTIVE:
      response[0] = MESSAGE_ACTIVE;
      response[1] = drives;
      break;

    // resets all drives
    case MESSAGE_RESET_ALL:
      resetDrives();
      response[0] = MESSAGE_RESET_ALL;
      break;

    // resets one drive
    case MESSAGE_RESET_ONE:
      // check to make sure the drive is in bounds
      if (command[1] < 0 || command[1] >= drives) {
        break;
      }

      resetDrive(command[1]);
      response[0] = MESSAGE_RESET_ONE;
      response[1] = command[1];
      break;

    // sets a drive to a frequency
    case MESSAGE_SET_FREQUENCY:
      // check to make sure the drive is in bounds
      if (command[1] < 0 || command[1] >= drives) {
        break;
      }

      int frequency;
      frequency = command[2] + command[3];

      // check to make sure the frequency is in bounds
      if (frequency != 0 && (frequency < FREQUENCY_MIN || frequency > FREQUENCY_MAX)) {
        break;
      }

      setFrequency(command[1], frequency);
      response[0] = MESSAGE_SET_FREQUENCY;
      response[1] = command[1];
      break;

    default:
      response[0] = MESSAGE_INVALID;
  }

  Serial.write(response[0]);
  Serial.write(response[1]);
}

// steps drives according to their frequencies
void tick() {
  for (byte drive = 0; drive < drives; drive++) {
    if (periods[drive] > 0) {
      ticks[drive]++;

      if (ticks[drive] >= periods[drive]) {
        step(drive);
        ticks[drive] = 0;
      }
    }
  }
}

// steps a head, reversing direction if necessary
void step(byte drive) {
  byte d = getDirectionPin(drive);
  byte s = getStepPin(drive);

  if (positions[drive] >= HEAD_MAX) {
    directions[drive] = HIGH;
  }
  else if (positions[drive] <= HEAD_MIN) {
    directions[drive] = LOW;
  }

  if (directions[drive] == HIGH) {
    positions[drive]--;
  }
  else {
    positions[drive]++;
  }

  digitalWrite(d, directions[drive]);
  digitalWrite(s, LOW);
  digitalWrite(s, HIGH);
}

void resetDrive(byte drive) {
  directions[drive] = LOW;
  periods[drive] = 0;
  positions[drive] = 0;
  ticks[drive] = 0;

  for (byte step = HEAD_MIN; step <= HEAD_MAX; step++) {
    digitalWrite(getDirectionPin(drive), HIGH);
    digitalWrite(getStepPin(drive), LOW);
    digitalWrite(getStepPin(drive), HIGH);

    delay(5);
  }
}

// sets everything to a clean starting state
void resetDrives() {
  // set everything we track to 0
  for (byte drive = 0; drive < drives; drive++) {
    directions[drive] = LOW;
    periods[drive] = 0;
    positions[drive] = 0;
    ticks[drive] = 0;
  }

  // the drives won't go past 0, so no worries about wrecking stuff
  for (byte step = HEAD_MIN; step <= HEAD_MAX; step++) {
    for (byte drive = 0; drive < drives; drive++) {
      digitalWrite(getDirectionPin(drive), HIGH);
      digitalWrite(getStepPin(drive), LOW);
      digitalWrite(getStepPin(drive), HIGH);
    }

    delay(5);
  }
}

// converts a frequency to a period (how often the drive pulses)
void setFrequency(byte drive, int frequency) {
  if (frequency == 0) {
    periods[drive] = 0;
  }
  else {
    periods[drive] = 1000000 / frequency / LOOP_RESOLUTION;
  }
}

// gets the direction pin for a drive
byte getDirectionPin(byte drive) {
  return STARTING_PIN + (drive * 2);
}

// gets the step pin for a drive
byte getStepPin(byte drive) {
  return STARTING_PIN + (drive * 2) + 1;
}
