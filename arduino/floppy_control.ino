#include <TimerOne.h>

// timing loop period (microseconds)
#define LOOP_RESOLUTION 40;

// head position range
#define HEAD_MIN 0;
#define HEAD_MAX 150;

// number of drives
#define DRIVE_COUNT 1;

// starting step control pin
#define STARTING_PIN 2;
// we assume step control pins occur on evens and direction pins occur on odds
// (so for drive 1, step control is pin 4 and direction is pin 5)

// interesting Stack Overflow discussion of #define vs. static const:
// http://stackoverflow.com/questions/1674032/static-const-vs-define-in-c

// head directions (by drive):
byte directions[] = {
  LOW
};

// active frequencies (by drive):
int frequencies[] = {
  0
};

// head positions (by drive):
byte positions[] = {
  0
};

// elapsed ticks (by drive):
// used to know when to step
int ticks[] = {
  0
};

void setup() {
  // set all needed pin modes
  pinMode(2, OUTPUT); // 0: step control
  pinMode(3, OUTPUT); // 0: direction

  // set the drives to starting position if they aren't already
  resetDrives();
  delay(2000);

  // initialize the timing loop
  Timer1.initialize(LOOP_RESOLUTION);
  Timer1.attachInterrupt(tick);

  // initialize serial interface
  Serial.begin(9600);
}

void loop() {
  // everything is done within the tick!
}

// @todo this totally doesn't work... the commented stuff is what the final
// working result should eventually look like
void tick() {
  step(0);

  /*
  for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
    if (frequencies[drive] > 0) {
      ticks[drive]++;

      if (ticks[drive] >= 4) {
        step(drive);
        ticks[drive] = 0;
      }
    }
  }
  */
}

// pulses a pin (because we're lazy)
void pulse(byte pin) {
  digitalWrite(pin, HIGH);
  digitalWrite(pin, LOW);
}

// steps a head (like pulse, but checks for direction):
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
    frequencies[drive] = 0;
    positions[drive] = 0;
    ticks[drive] = 0;
  }

  // the drives won't go past 0, so that's cool
  for (byte step = HEAD_MAX; step >= HEAD_MIN; step--) {
    for (byte drive = 0; drive < DRIVE_COUNT; drive++) {
      digitalWrite(getDirectionPin(drive), HIGH);
      pulse(getStepPin(drive));
    }

    delay(5);
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

