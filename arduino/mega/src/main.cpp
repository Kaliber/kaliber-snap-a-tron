#include <Arduino.h>
#include <ArduinoJson.h>
#include <Encoder.h>
#include <SharpIR.h>

#define MUX_1_ENABLE 42
#define MUX_2_ENABLE 44
#define MUX_3_ENABLE 46
#define MUX_4_ENABLE 48

#define MUX_1_COM 14
#define MUX_2_COM 15
#define MUX_3_COM 16
#define MUX_4_COM 17

#define MUX_S0 3
#define MUX_S1 4
#define MUX_S2 5
#define MUX_S3 6

DynamicJsonDocument output(1024);
Encoder encoder(20, 21);
SharpIR sensor(A2, 20150);

void setup()
{
  Serial.begin(115200);

  pinMode(MUX_1_ENABLE, OUTPUT);
  pinMode(MUX_1_COM, INPUT_PULLUP);

  pinMode(MUX_2_ENABLE, OUTPUT);
  pinMode(MUX_2_COM, INPUT_PULLUP);

  pinMode(MUX_3_ENABLE, OUTPUT);
  pinMode(MUX_3_COM, INPUT_PULLUP);

  pinMode(MUX_4_ENABLE, OUTPUT);
  pinMode(MUX_4_COM, INPUT_PULLUP);

  pinMode(MUX_S0, OUTPUT);
  pinMode(MUX_S1, OUTPUT);
  pinMode(MUX_S2, OUTPUT);
  pinMode(MUX_S3, OUTPUT);

  pinMode(40, OUTPUT);
  pinMode(38, OUTPUT);
  pinMode(36, OUTPUT);
  pinMode(34, OUTPUT);
  pinMode(32, OUTPUT);
  pinMode(30, OUTPUT);
  pinMode(28, OUTPUT);
  pinMode(26, OUTPUT);
  pinMode(24, OUTPUT);
  pinMode(22, OUTPUT);

  pinMode(13, OUTPUT);
  pinMode(12, INPUT_PULLUP);

  pinMode(8, OUTPUT);
  pinMode(9, INPUT_PULLUP);

  pinMode(A2, INPUT);
}

void selectChannel(int8_t channel_pin)
{
  int truthTable[16][4] = {
      {0, 0, 0, 0}, // 0
      {1, 0, 0, 0}, // 1
      {0, 1, 0, 0}, // 2
      {1, 1, 0, 0}, // 3
      {0, 0, 1, 0}, // 4
      {1, 0, 1, 0}, // 5
      {0, 1, 1, 0}, // 6
      {1, 1, 1, 0}, // 7
      {0, 0, 0, 1}, // 8
      {1, 0, 0, 1}, // 9
      {0, 1, 0, 1}, // 10
      {1, 1, 0, 1}, // 11
      {0, 0, 1, 1}, // 12
      {1, 0, 1, 1}, // 13
      {0, 1, 1, 1}, // 14
      {1, 1, 1, 1}, // 15
  };

  digitalWrite(MUX_S0, truthTable[channel_pin][0]);
  digitalWrite(MUX_S1, truthTable[channel_pin][1]);
  digitalWrite(MUX_S2, truthTable[channel_pin][2]);
  digitalWrite(MUX_S3, truthTable[channel_pin][3]);
}

void readBank(String section, int enablePin, int comPin)
{
  digitalWrite(enablePin, HIGH);

  selectChannel(0);
  output[section]["channle_0"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(40, !digitalRead(comPin));
  }

  selectChannel(1);
  output[section]["channle_1"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(38, !digitalRead(comPin));
  }

  selectChannel(2);
  output[section]["channle_2"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(36, !digitalRead(comPin));
  }

  selectChannel(3);
  output[section]["channle_3"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(34, !digitalRead(comPin));
  }

  selectChannel(4);
  output[section]["channle_4"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(32, !digitalRead(comPin));
  }

  selectChannel(5);
  output[section]["channle_5"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(30, !digitalRead(comPin));
  }

  selectChannel(6);
  output[section]["channle_6"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(28, !digitalRead(comPin));
  }

  selectChannel(7);
  output[section]["channle_7"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(26, !digitalRead(comPin));
  }

  selectChannel(8);
  output[section]["channle_8"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(24, !digitalRead(comPin));
  }

  selectChannel(9);
  output[section]["channle_9"] = digitalRead(comPin);

  if (section == "category")
  {
    digitalWrite(22, !digitalRead(comPin));
  }

  digitalWrite(enablePin, LOW);
}

void readButtons()
{
  int green = digitalRead(9);
  digitalWrite(8, green);

  int red = digitalRead(12);
  digitalWrite(13, red);

  output["buttons"]["green"] = green;
  output["buttons"]["red"] = red;
}

void readDistanceSensor()
{
  int distance = sensor.distance();
  output["distance"] = distance;
}

void loop()
{
  readBank("category", MUX_1_ENABLE, MUX_1_COM);
  readBank("input_2", MUX_2_ENABLE, MUX_2_COM);
  readBank("input_3", MUX_3_ENABLE, MUX_3_COM);
  readBank("input_4", MUX_4_ENABLE, MUX_4_COM);

  output["encoder"] = encoder.read();

  readButtons();
  readDistanceSensor();

  serializeJson(output, Serial);
  Serial.print("\n");
}
