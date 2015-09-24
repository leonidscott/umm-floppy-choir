#include <TimerOne.h>

// timing loop period (microseconds)
const byte LOOP_RESOLUTION = 40;

// head position range
const byte HEAD_MIN = 0;
const byte HEAD_MAX = 82;

// number of drives
const byte DRIVE_COUNT = 3;

// starting step control pin
const byte STARTING_PIN = 2;
// we assume step control pins occur on evens and direction pins occur on odds
// (so for drive 1, step control is pin 4 and direction is pin 5)

// head directions (by drive):
byte directions[] = {
  LOW,
  LOW,
  LOW
};

// active periods (by drive):
int periods[] = {
  0,
  0,
  0
};

// head positions (by drive):
byte positions[] = {
  0,
  0,
  0
};

// elapsed ticks (by drive):
// used to know when to step
int ticks[] = {
  0,
  0,
  0
};

void setup() {
  // set all needed pin modes
  pinMode(2, OUTPUT); // 0: step control
  pinMode(3, OUTPUT); // 0: direction
  pinMode(4, OUTPUT); // 1: step control
  pinMode(5, OUTPUT); // 1: direction
  pinMode(6, OUTPUT); // 2: step control
  pinMode(7, OUTPUT); // 2: direction

  // initialize serial interface
  Serial.begin(9600);

  // set the drives to starting position if they aren't already
  resetDrives();

  // @todo remove this, it's for testing
  setFrequency(0, 73);  // D2
  setFrequency(1, 110); // A2
  setFrequency(2, 185); // F#3

  // initialize the timing loop
  Timer1.initialize(LOOP_RESOLUTION);
  Timer1.attachInterrupt(tick);
}

void loop() {
  // everything is done within the tick!
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

// steps a head
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

// sets everything to a clean starting state
void resetDrives() {
  // set everything we track to 0
  for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
    directions[drive] = LOW;
    periods[drive] = 0;
    positions[drive] = 0;
    ticks[drive] = 0;
  }

  // the drives won't go past 0, so that's cool
  for (byte step = HEAD_MIN; step <= HEAD_MAX; step++) {
    for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
      digitalWrite(getDirectionPin(drive), HIGH);
      digitalWrite(getStepPin(drive), HIGH);
      digitalWrite(getStepPin(drive), LOW);
    }

    delay(5);
  }
}

void setFrequency(byte drive, int frequency) {
  if (frequency == 0) {
    periods[drive] = 0;
  }
  else {
    periods[drive] = 1000000 / frequency / LOOP_RESOLUTION;
  }
}

// gets the step pin for a drive
byte getStepPin(byte drive) {
  return STARTING_PIN + (drive * 2);
}

// gets the direction pin for a drive
byte getDirectionPin(byte drive) {
  return STARTING_PIN + (drive * 2) + 1;
}

