#UMM Floppy Choir  
####Our goal is to build a floppy choir and develop a full stack of software to interact with it. 

Presently, the floppy choir is composed of several floppy disks, powered by a standard computer 
power supply, and controlled by an aurdino.

Above the hardware, we have a RaspberryPi that is used as a controller for all of the choir and as a webserver. It 
communicates by sending serial to each of the aurdinos. The RaspberryPi also uses node to serve the angular front end.

[Full Stack Diagram]
(https://raw.githubusercontent.com/dstelljes/umm-floppy-choir/master/documentation/floppyStack2015-11-20.JPG)

Once it is done, we want to put it in the Computer Science display, here at the University of Minnesota, Morris.


###It has several drives and it works pretty well!!
![It's working! Taken 2015/10/25]
(https://raw.githubusercontent.com/dstelljes/umm-floppy-choir/master/documentation/floppyChoir2015-11-20(small).jpg)


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
1. `git pull`
2. Run `nvm install v0.12.7`
3. `node server.js` 

###Updating Code on the Raspberry Pi
1. ssh into the raspberry pi
2. `cd /srv/app`
2. `git pull`
3. `sudo systemctl restart floppy-control-app`

