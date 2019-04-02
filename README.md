# circle-multiples
This program allows you to view multiples of integers arranged in a circle.

## Requirements
Python 3.7

Pygame module (run "pip3 install pygame" or "pip install pygame")

Only tested on Windows

## Usage
Run "circle.py". 
A window should appear, all the controls are documented on the screen.
I recommend turning on labels and stepping through whole integers with the left/right arrows to understand the concept.
Feel free to play with all the settings and options!

## Screenshots
![pic 1](https://i.gyazo.com/2718d39556a54331f0e114df5abf0b07.png)
![pic 2](https://i.gyazo.com/783c20b8f04cc0dbf40f4b00e3c2a5be.png)
![pic 3](https://i.gyazo.com/50db767672beecbdae6e39b84a41f6c4.png)

## Theory
I got this idea from a [Mathologer video](https://youtu.be/qhbuKbxJsk8). They have a great explanation of the concept.

Let's start with 10 points for example, they are arranged counter-clockwise from 0 to 9.
There is a "multiple" which we can adjust.
The value of each point is multiplied by this multiple, and a line is drawn from the point to the result.

So, if the multiple is 0, a line is drawn from each point to 0 (since anything times 0 is 0).
If the multiple is 1, a line is drawn from each point to itself (since anything times 1 is itself).
Now suppose the multiple is 2. We should expect lines from 0 to 0, 1 to 2, 2 to 4, 3 to 6, and so on.
However, 8 times 2 is 16 but our points only go to 10. This is solved dividing by 10 and taking the remainder: 6.

As the multiple changes, various patterns emerge. Especially fascinating is the transition between whole multiples.
