
var Pomo = Pomo || {};
Pomo.running = false;

var checkTime = function(i) {
  if (i < 10) {i = "0" + i};
  return i;
};

var clockformat = function(time) {
  var h = time.getHours();
  var m = time.getMinutes();
  var s = time.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  return h + ':' + m + ':' + s;
};

var PomoFactory = function(name, minutes) {
  var interval, delay = minutes, seconds = delay * 60;

  var controllertext = $('<div>', {'text': name}),
      spanminus = $('<span>', {'text': '-', 'class': 'adjust'}),
      spanlen = $('<span>', {'text': delay}),
      spanplus = $('<span>', {'text': '+', 'class': 'adjust'});
  var controller = $('<div>');
  controller.append(controllertext);
  controller.append($('<div>').append([spanminus, spanlen, spanplus]));

  var clocktext = $('<div>', {'text': name}),
      timer = $('<div>').text(clockformat(new Date(1970, 0, 0, 0, 0, seconds)));
  var clockview = $('<div>', {'class': 'clock'});
  clockview.append(clocktext).append(timer);

  var callback = function() {
    --seconds;
    if (seconds < 0) {
      stop();
      $('.clock').toggle(0, function() {
        // console.log(this);
        if ($(this).is(':visible')) $(this).click();
      });
    }
    timer.text(clockformat(new Date(1970, 0, 0, 0, 0, seconds)));
  };

  var init = function() {
    seconds = delay * 60;
    timer.text(clockformat(new Date(1970, 0, 0, 0, 0, seconds)));
  };
  var stop = function() {
    pause();
    seconds = delay * 60;
  };
  var resume = function() {
    interval = setInterval(callback, 1000);
    Pomo.running = true;
  };
  var pause = function() {
    clearInterval(interval);
    Pomo.running = false;
  };
  clockview.click(function() {
    if (Pomo.running) {
      pause();
      enable();
    }
    else {
      resume();
      disable();
    }
  });

  var enable = function() {
    spanminus.on('click', function() {
      if (delay > 1) {
        --delay;
        init();
        spanlen.text(delay);
      }
    });
    spanplus.on('click', function() {
      ++delay;
      init();
      spanlen.text(delay);
    });
  };

  var disable = function() {
    spanminus.off('click');
    spanplus.off('click');
  };

  return {
    controller: function(text) {
      if (text) controllertext.text(text);
      enable();
      return controller;
    },
    clock: function(text) {
      if (text) clocktext.text(text);
      return clockview;
    },
    hide: function() {
      clockview.hide();
    }
  };
};

$(document).ready(function() {

  // prevent double click selection
  $('body').mousedown(function(e) {
    e.preventDefault();
  });

  var pomobreak = PomoFactory('break', 2),
      pomosession = PomoFactory('session', 3);

  $('div#setting').append(pomobreak.controller('Break Length'));
  $('div#setting').append(pomosession.controller('Session Length'));

  $('div#mask').append(pomobreak.clock('Break!'));
  $('div#mask').append(pomosession.clock('Session'));

  pomobreak.hide();

});
