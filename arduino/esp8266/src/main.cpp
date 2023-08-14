#include <Arduino.h>

const int relayPin = D1;
const int computerPin = D2;

int computerPowerState = 0;

void setup() {
  pinMode(relayPin, OUTPUT);
  pinMode(computerPin, INPUT);
}

void loop() {
  computerPowerState = digitalRead(computerPin);

  if (computerPowerState == HIGH) {
    digitalWrite(relayPin, HIGH);
  } else {
    digitalWrite(relayPin, LOW);
  }

  delay(1000);
}
