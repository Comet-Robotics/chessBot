
const int motorAPin1 = 8;
const int motorAPin2 = 9;

const int motorBPin1 = 11;
const int motorBPin2 = 10;

const int encoderAPin1 = 5;
const int encoderAPin2 = 3;
const int encoderBPin1 = 4;
const int encoderBPin2 = 2;


int turnspeed = 200;
int forward_duration = 1000;
int stop_duration = 1000;

int rotate_duration = 1000;

// double inchesPerSec = 30.0;
// double msPerMeter = 1312.33;

const int wheelDiaInches = 4.375;

 int counterA = 0; 
 int counterB = 0; 
 int aState;
 int aLastState;  
 int bState;
 int bLastState;  




void setup() {
  pinMode(motorAPin1, OUTPUT);
  pinMode(motorAPin2, OUTPUT);
  pinMode(motorBPin1, OUTPUT);
  pinMode(motorBPin2, OUTPUT);
  pinMode(encoderAPin1, INPUT);
  pinMode(encoderAPin2, INPUT);
  pinMode(encoderBPin1, INPUT);
  pinMode(encoderBPin2, INPUT);
  Serial.begin(9600);

  aLastState= digitalRead(encoderAPin1);
  bLastState= digitalRead(encoderBPin1);

}

  // Forward(forward_duration);
  // Stop(stop_duration);


void loop() {
  // put your main code here, to run repeatedly:
  encoderRead();

}


void Forward(int duration)
{
  analogWrite(motorAPin1, turnspeed);
  digitalWrite(motorAPin2, LOW);
  analogWrite(motorBPin1, turnspeed);
  digitalWrite(motorBPin2, LOW);
  delay(duration);
}

void Rotate_Clockwise(int duration)
{
  analogWrite(motorAPin1, turnspeed);
  digitalWrite(motorAPin2, HIGH);
  analogWrite(motorBPin1, turnspeed);
  digitalWrite(motorBPin2, LOW);
  delay(duration);
}

void Stop(int duration)
{
  analogWrite(motorAPin1, 0);
  digitalWrite(motorAPin2, LOW);
  analogWrite(motorBPin1, 0);
  digitalWrite(motorBPin2, LOW);
  delay(duration);
}


void encoderRead()
{
   aState = digitalRead(encoderAPin1); // Reads the "current" state of the outputA
   // If the previous and the current state of the outputA are different, that means a Pulse has occured
   if (aState != aLastState){     
     // If the outputB state is different to the outputA state, that means the encoder is rotating clockwise
     if (digitalRead(encoderAPin2) != aState) { 
       counterA ++;
     } else {
       counterA --;
     }
    //  Serial.print("Position: ");
    //  Serial.println(counter1);
   } 
   aLastState = aState; // Updates the previous state of the outputA with the current state

   bState = digitalRead(encoderBPin1); // Reads the "current" state of the outputA
   // If the previous and the current state of the outputA are different, that means a Pulse has occured
   if (bState != bLastState){     
     // If the outputB state is different to the outputA state, that means the encoder is rotating clockwise
     if (digitalRead(encoderBPin2) != bState) { 
       counterB ++;
     } else {
       counterB --;
     }
    //  Serial.print("Position: ");
   } 
   bLastState = bState; // Updates the previous state of the outputA with the current state

    Serial.print("Counter_A:");
    Serial.print(counterA);
    Serial.print(",");
    Serial.print("Counter_B:");
    Serial.println(counterB);
}
