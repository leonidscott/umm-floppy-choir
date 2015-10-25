'use strict';

var Player = module.exports = function(controller) {
  this.controller = controller;
  this.deltas = [];
  this.queue = {};
};

Player.prototype.fire = function(index) {
  var self = this;

  this.queue[this.deltas[index]].forEach(function(change) {
    self.controller.setFrequency(change.drive, change.frequency);
  });

  if (typeof this.deltas[index + 1] !== 'undefined') {
    setTimeout(function() {
      self.fire(index + 1);
    }, this.deltas[index + 1] - this.deltas[index]);
  }
};

Player.prototype.load = function(events) {
  var queue = {};

  events.forEach(function(event) {
    var start = event.delta;
    var end = event.delta + event.duration;

    // @todo actually add stuff to the queue
  });

  this.setQueue(queue);
};

Player.prototype.play = function() {
  this.fire(0);
};

Player.prototype.setQueue = function(queue) {
  this.deltas = Object.keys(queue).sort();
  this.queue = queue;
};
