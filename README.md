#UMM Floppy Choir  
####Our goal is to build a floppy choir and develop a full stack of software to interact with it. 

Presently, the floppy choir is composed of several floppy disks, powered by a standard computer 
power supply, and controlled by an aurdino. We will build several sub-choirs that follow this model.

Above the hardware, we have a RaspberryPi that we intend to use as a controller for all of the sub-choirs. It 
communicates by sending serial to each of the aurdinos. The RaspberryPi will also act as a web server. Presenlty we 
are running a Node server and are working on an angular front end.

Once it is done, we want to put it in the Computer Science display, here at the University of Minnesota, Morris.


###It's primitive, but it is already working!!
![It's working! Taken 2015/10/25]
(https://raw.githubusercontent.com/dstelljes/umm-floppy-choir/master/documentation/itsWorkingSmall.jpg)


###Full Developer Setup
1. Clone this repo: `git clone https://github.com/dstelljes/umm-floppy-choir.git`
2. Install and setup nvm
   * Install nvm from https://github.com/creationix/nvm
   * Run `nvm install v0.12.7`
3. Run `npm install`
4. If you don't have bower installed run `npm install -g bower`
5. Run `bower install` 
6. Launch the server: `ARDUINO=/dev/ttyACM0 node server.js` 
  * Omit *ARDUINO=/dev/ttyACM0* if you don't happen to have the floppy choir with you

###Quick Startup
1. git pull
2. Run `nvm install v0.12.7`
3. node server.js` 

###Updating Code on the Raspberry Pi
1. ssh into the pi
2. cd /srv/app
2. git pull
3. sudo systemctrl restart floppy-control-app

