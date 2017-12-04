# The University of Minnesota Morris Floppy Choir

This is a (somewhat dormant) attempt to build a floppy drive choir and develop a friendly way to interact with it. 

Presently, the floppy choir is composed of eight floppy drives powered by a standard PSU and controlled by an Arduino. Above the hardware, there's a Raspberry Pi that controls the Arduino over serial and runs an AngularJS frontend. [Lenny drew a picture of the whole thing.](https://raw.githubusercontent.com/morrislenny/umm-floppy-choir/master/documentation/stack-diagram.jpg)

When (if?) it's finished, it'll live in the computer science display case at UMM and visitors can play with it.

## Action shots

![Photo 1](https://raw.githubusercontent.com/morrislenny/umm-floppy-choir/master/documentation/photo-1.jpg)

![Photo 2](https://raw.githubusercontent.com/morrislenny/umm-floppy-choir/master/documentation/photo-2.jpg)

## Project layout

This repo holds pretty much everything needed to make the floppy choir work:

*   **ansible**: Contains an [Ansible](http://docs.ansible.com/) playbook that sets up the Raspberry Pi. If you've got questions about how the Raspberry Pi is configured, that's the place to look.

*   **arduino**: Contains the code that powers the Arduino. Note that it depends on the [TimerOne](http://www.arduinolibraries.info/libraries/timer-one) library.

*   **documentation**: Contains the assets for this README and some experiments that demonstrate how the hardware works.

*   **lib**: Contains all of the server logic (interacting with the Arduino, parsing MIDI, etc.).

*   **music**: The MIDI library. Any valid MIDI files in that directory will be made available in the Jukebox section of the frontend.

*   **public**: Contains everything needed for the web interface. Everything in that directory is served as-is, no building or anything required.

*   **test**: Contains (woefully incomplete) tests for (some of) the server logic. 

*   **bower.json**: Dependencies for the web interface.

*   **package.json**: Dependencies for the server.

*   **server.js**: The script that runs the server. The first few lines of the script show how to configure it.

## Developing and running the server

1.  Clone this repo:

    ```
    $ git clone https://github.com/morrislenny/umm-floppy-choir.git
    $ cd umm-floppy-choir
    ```

2.  Install dependencies:

    ```
    $ npm install
    ```

    This installs the server dependencies (using npm) and the frontend dependencies (using Bower). Make sure to run this command whenever you change **bower.json** or **package.json**.

3.  To start the server with the Arduino attached, run the following (replace `/dev/ttyACM0` with the Arduino's serial interface on your machine):

    ```
    $ ARDUINO=/dev/ttyACM0 npm run serve
    ```

    To start the server without the Arduino attached (in that case, all communication will be written to the console), don't specify the `ARDUINO` environment variable:

    ```
    $ npm run serve
    ```

    To stop the server, press <kbd>Ctrl</kbd> + <kbd>C</kbd>.

## Deploying new code

To deploy changes to the Pi:

1.  Connect to the Pi (replacing `user` with the correct user and `hostname` with the correct hostname or IP address) and navigate to the app directory:

    ```
    $ ssh user@hostname.morris.umn.edu
    $ cd /srv/app
    ```

2.  Pull the changes:
   
    ```
    $ git pull
    ```

3.  Restart the server:

    ```
    $ sudo systemctl restart floppy-control-app
    ```

## Reconfiguring the Raspberry Pi

The best way to update configuration on the Pi is to use the Ansible playbook:

1.  Copy **ansible/inventories/hosts.yml.dist** to **ansible/inventories/hosts.yml** and add the hostname or IP of the Pi.

2.  Make configuration changes in **ansible/server_setup.yml**.

3.  Run the playbook:

    ```
    $ cd ansible
    $ ansible-playbook -i inventories/hosts.yml server_setup.yml
    ```
