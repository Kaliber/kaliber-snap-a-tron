#include <Arduino.h>
#include <ArduinoJson.h>

#define LED_OFF 0
#define LED_ON 1
#define LED_BLINK 2

void checkHornState();
void checkInternalButtonState();
void maybeToggleRinging();
void maybeRingBell();
void maybeTurnOnOrOffLed();
void updateBlinkLedState();
void readSerialPort();
void writeSerialPort();

const int buttonPin = 0;
const int phoneHornPin = 9;
const int B1A = 3;
const int B1B = 5;

const int ledCategory1 = 34;
const int ledCategory2 = 21;
const int ledCategory3 = 17;

const int ledCategoryOptions1 = 36;
const int ledCategoryOptions2 = 38;
const int ledCategoryOptions3 = 40;

int callingState = LOW;
int ringingState = LOW;
int magnetState = LOW;
int buttonState;
int lastButtonState = LOW;
int buttonHornState;
int lastButtonHornState = LOW;
int blinkLedState = LOW;

int ledCategory1State = 0;
int ledCategory2State = 0;
int ledCategory3State = 0;
int ledCategoryOptions1State = 0;
int ledCategoryOptions2State = 0;
int ledCategoryOptions3State = 0;

unsigned long lastDebounceTime = 0;
unsigned long lastDebounceHornTime = 0;
unsigned long debounceDelay = 50;

unsigned long previousMillis = 0;
unsigned long previousMillisRinging = 0;
unsigned long previousMillisBlink = 0;

const long intervalMagnet = 40;
const long intervalRingPhone = 1500;
const long intervalBlink = 500;

unsigned long lastWriteToSerial = 0;

DynamicJsonDocument input(300);
DynamicJsonDocument output(300);

void setup()
{
  Serial.begin(115200);

  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(phoneHornPin, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);

  pinMode(B1A, OUTPUT);
  pinMode(B1B, OUTPUT);

  pinMode(ledCategory1, OUTPUT);
  pinMode(ledCategory2, OUTPUT);
  pinMode(ledCategory3, OUTPUT);
  pinMode(ledCategoryOptions1, OUTPUT);
  pinMode(ledCategoryOptions2, OUTPUT);
  pinMode(ledCategoryOptions3, OUTPUT);
}

void loop()
{
  checkHornState();
  checkInternalButtonState();
  maybeToggleRinging();
  maybeRingBell();
  updateBlinkLedState();
  maybeTurnOnOrOffLed();

  readSerialPort();
  writeSerialPort();
}

void writeSerialPort()
{
  unsigned long currentMillis = millis();

  if (currentMillis - lastWriteToSerial >= 250)
  {
    output["horn"] = lastButtonHornState;
    output["calling"] = callingState;

    output["ledState"]["category1"] = ledCategory1State;
    output["ledState"]["category2"] = ledCategory2State;
    output["ledState"]["category3"] = ledCategory3State;
    output["ledState"]["categoryOptions1"] = ledCategoryOptions1State;
    output["ledState"]["categoryOptions2"] = ledCategoryOptions2State;
    output["ledState"]["categoryOptions3"] = ledCategoryOptions3State;

    serializeJson(output, Serial);
    Serial.print("\n");

    lastWriteToSerial = currentMillis;
  }
}

void checkHornState()
{
  int reading = digitalRead(phoneHornPin);

  if (reading != lastButtonHornState)
  {
    lastDebounceHornTime = millis();
  }

  if ((millis() - lastDebounceHornTime) > debounceDelay)
  {
    if (reading != buttonHornState)
    {
      buttonHornState = reading;
      if (buttonHornState == LOW)
      {
        callingState = LOW;
      }
    }
  }

  lastButtonHornState = reading;
}

void checkInternalButtonState()
{
  int reading = digitalRead(buttonPin);
  if (reading != lastButtonState)
  {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay)
  {
    if (reading != buttonState)
    {
      buttonState = reading;

      if (buttonState == LOW && buttonHornState == HIGH)
      {
        callingState = HIGH;
      }
    }
  }

  lastButtonState = reading;
}

void maybeToggleRinging()
{
  if (!callingState)
    return;

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillisRinging >= intervalRingPhone)
  {
    previousMillisRinging = currentMillis;

    if (ringingState == LOW)
    {
      ringingState = HIGH;
    }
    else
    {
      ringingState = LOW;
    }
  }
}

void maybeRingBell()
{
  if (!callingState)
    return;

  if (!ringingState)
    return;

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= intervalMagnet)
  {
    previousMillis = currentMillis;

    if (magnetState == LOW)
    {
      digitalWrite(B1A, LOW);
      digitalWrite(B1B, HIGH);
      magnetState = HIGH;
    }
    else
    {
      digitalWrite(B1A, HIGH);
      digitalWrite(B1B, LOW);
      magnetState = LOW;
    }
  }
}

void maybeTurnOnOrOffLed() {
  if (ledCategory1State == LED_ON) {
    digitalWrite(ledCategory1, HIGH);
  } else if (ledCategory1State == LED_BLINK) {
    digitalWrite(ledCategory1, blinkLedState);
  } else {
    digitalWrite(ledCategory1, LOW);
  }

  if (ledCategory2State == LED_ON) {
    digitalWrite(ledCategory2, HIGH);
  } else if (ledCategory2State == LED_BLINK) {
    digitalWrite(ledCategory2, blinkLedState);
  } else {
    digitalWrite(ledCategory2, LOW);
  }

  if (ledCategory3State == LED_ON) {
    digitalWrite(ledCategory3, HIGH);
  } else if (ledCategory3State == LED_BLINK) {
    digitalWrite(ledCategory3, blinkLedState);
  } else {
    digitalWrite(ledCategory3, LOW);
  }

  if (ledCategoryOptions1State == LED_ON) {
    digitalWrite(ledCategoryOptions1, HIGH);
  } else if (ledCategoryOptions1State == LED_BLINK) {
    digitalWrite(ledCategoryOptions1, blinkLedState);
  } else {
    digitalWrite(ledCategoryOptions1, LOW);
  }

  if (ledCategoryOptions2State == LED_ON) {
    digitalWrite(ledCategoryOptions2, HIGH);
  } else if (ledCategoryOptions2State == LED_BLINK) {
    digitalWrite(ledCategoryOptions2, blinkLedState);
  } else {
    digitalWrite(ledCategoryOptions2, LOW);
  }

  if (ledCategoryOptions3State == LED_ON) {
    digitalWrite(ledCategoryOptions3, HIGH);
  } else if (ledCategoryOptions3State == LED_BLINK) {
    digitalWrite(ledCategoryOptions3, blinkLedState);
  } else {
    digitalWrite(ledCategoryOptions3, LOW);
  }
}

void updateBlinkLedState() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillisBlink >= intervalBlink) {
    previousMillisBlink = currentMillis;

    if (blinkLedState == LOW) {
      blinkLedState = HIGH;
    } else {
      blinkLedState = LOW;
    }
  }
}

void readSerialPort() {
  if (Serial.available() > 0) {
    String s = Serial.readStringUntil('\n');
    DeserializationError error = deserializeJson(input, s);

    if (error) {
      digitalWrite(LED_BUILTIN, HIGH);
    } else {
      digitalWrite(LED_BUILTIN, LOW);
    }

    JsonVariant call = input["call"];
    JsonVariant category1 = input["ledState"]["category1"];
    JsonVariant category2 = input["ledState"]["category2"];
    JsonVariant category3 = input["ledState"]["category3"];
    JsonVariant categoryOptions1 = input["ledState"]["categoryOptions1"];
    JsonVariant categoryOptions2 = input["ledState"]["categoryOptions2"];
    JsonVariant categoryOptions3 = input["ledState"]["categoryOptions3"];

    if (!call.isNull()) {
      callingState = call;
    }

    if (!category1.isNull()) {
      ledCategory1State = category1;
    }

    if (!category2.isNull()) {
      ledCategory2State = category2;
    }
  
    if (!category3.isNull()) {
      ledCategory3State = category3;
    }

    if (!categoryOptions1.isNull()) {
      ledCategoryOptions1State = categoryOptions1;
    }

    if (!categoryOptions2.isNull()) {
      ledCategoryOptions2State = categoryOptions2;
    }

    if (!categoryOptions3.isNull()) {
      ledCategoryOptions3State = categoryOptions3;
    }
  }
}
