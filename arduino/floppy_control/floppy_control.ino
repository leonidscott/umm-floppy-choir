#include <TimerOne.h>

// timing loop period (microseconds)
const byte LOOP_RESOLUTION = 40;

// head position range
const byte HEAD_MIN = 0;
const byte HEAD_MAX = 82;

// frequency range (A0 through B4)
const int FREQUENCY_MIN = 27;
const int FREQUENCY_MAX = 494;

// number of drives
const byte DRIVE_COUNT = 3;

// starting direction pin
const byte STARTING_PIN = 2;
// we assume direction pins occur on evens and step pins occur on odds
// (so for drive 0, direction is pin 2 and step is pin 3)

// all of the following arrays need to be initialized with DRIVE_COUNT items...
// this could maybe be avoided with enums or something

// head directions (by drive)
byte directions[] = {
  LOW,
  LOW,
  LOW
};

// active periods (by drive)
int periods[] = {
  0,
  0,
  0
};

// head positions (by drive)
byte positions[] = {
  0,
  0,
  0
};

// elapsed ticks (by drive)
// used to know when to step
int ticks[] = {
  0,
  0,
  0
};

// serial command codes
enum {
  MESSAGE_READY = 000,
  MESSAGE_INVALID = 001,
  MESSAGE_ACTIVE = 010,
  MESSAGE_RESET_ALL = 011,
  MESSAGE_RESET_ONE = 012,
  MESSAGE_SET_FREQUENCY = 020,
};

void setup() {
  // sets all needed pins to output
  for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
    byte direction = STARTING_PIN + (drive * 2);
    byte step = direction + 1;

    pinMode(direction, OUTPUT);
    pinMode(step, OUTPUT);
  }

  // initialize serial interface
  Serial.begin(9600);

  // set the drives to starting position if they aren't already
  resetDrives();

  // initialize the timing loop
  Timer1.initialize(LOOP_RESOLUTION);
  Timer1.attachInterrupt(tick);
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
  case MESSAGE_READY:
    response[0] = MESSAGE_READY;
    break;

    // gets active drive count
  case MESSAGE_ACTIVE:
    response[0] = MESSAGE_ACTIVE;
    response[1] = DRIVE_COUNT;
    break;

    // resets all drives
  case MESSAGE_RESET_ALL:
    resetDrives();
    response[0] = MESSAGE_RESET_ALL;
    break;

    // resets one drive
  case MESSAGE_RESET_ONE:
    // check to make sure the drive is in bounds
    if (command[1] < 0 || command[1] >= DRIVE_COUNT) {
      break;
    }

    resetDrive(command[1]);
    response[0] = MESSAGE_RESET_ONE;
    response[1] = command[1];
    break;

    // sets a drive to a frequency
  case MESSAGE_SET_FREQUENCY:
    // check to make sure the drive is in bounds
    if (command[1] < 0 || command[1] >= DRIVE_COUNT) {
      break;
    }

    int frequency;
    frequency = command[2] + command[3];

    // check to make sure the frequency is in bounds
    if (frequency != 0 && (frequency < FREQUENCY_MIN || frequency > FREQUENCY_MAX)) {
      break;
    }

    setFrequency(command[1], frequency);
    break;

  default:
    response[0] = MESSAGE_INVALID;
  }

  Serial.write(response[0]);
  Serial.write(response[1]);
}

// steps drives according to their frequencies
void tick() {
  for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
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
  digitalWrite(s, HIGH);
  digitalWrite(s, LOW);
}

void resetDrive(byte drive) {
  directions[drive] = LOW;
  periods[drive] = 0;
  positions[drive] = 0;
  ticks[drive] = 0;

  for (byte step = HEAD_MIN; step <= HEAD_MAX; step++) {
    digitalWrite(getDirectionPin(drive), HIGH);
    digitalWrite(getStepPin(drive), HIGH);
    digitalWrite(getStepPin(drive), LOW);

    delay(5);
  }
}

// sets everything to a clean starting state
void resetDrives() {
  // set everything we track to 0
  for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
    directions[drive] = LOW;
    periods[drive] = 0;
    positions[drive] = 0;
    ticks[drive] = 0;
  }

  // the drives won't go past 0, so no worries about wrecking stuff
  for (byte step = HEAD_MIN; step <= HEAD_MAX; step++) {
    for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
      digitalWrite(getDirectionPin(drive), HIGH);
      digitalWrite(getStepPin(drive), HIGH);
      digitalWrite(getStepPin(drive), LOW);
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


