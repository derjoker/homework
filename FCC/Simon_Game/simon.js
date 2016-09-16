
var Simon = Simon || {};

Simon.Audio = function() {

  return {
    play: function(index) {
      var dfd = $.Deferred();
      $('audio').eq(index).one('ended', function() {
        console.log('play', $(this).index());
        console.log('ended');
        dfd.resolve();
      }).trigger('play');
      return dfd.promise();
    }
  };
};

Simon.Effect = function() {

  return {
    click: function(index) {
      // console.log('click', index);
      return $('td > div').eq(index).fadeOut(500).fadeIn(500);
    }
  };
};

Simon.Round = function(level) {
  var series = _.range(level).map(function() {
    return _.random(3);
  });
  // series.pop();
  // series.unshift(5);
  console.log(series);
  var step = 0;

  return {
    start: function() {
      var dfd = $.Deferred();
      var audio = Simon.Audio(), effect = Simon.Effect();

      var i = 0;
      var iterate = function() {
        if (i < level) {
          console.log('i:', i);
          $.when(audio.play(series[i]), effect.click(series[i])).done(function() {
            ++i;
            iterate();
          });
        } else dfd.resolve();
      };
      iterate();
      return dfd.promise();
    },
    check: function(num) {
      step = series[step] === num ? ++step : 0;
      return step;
    }
  };
};

Simon.Game = function() {

  var _strict = false, _gameon = false, _usermode = false;

  var round, level = 1;

  var start = function(fail) {
    _usermode = false;
    if (fail && _strict) {
      level = 1;
      round = Simon.Round(level);
    }
    round.start().done(function() {
      _usermode = true;
    });
  };

  $('td > div').on('click', function() {
    if (_gameon && _usermode) {
      var index = $('td > div').index(this);
      var result = round.check(index);
      Simon.Effect().click(index);
      if (result > 0) {
        Simon.Audio().play(index);
        if (result === level) {
          ++level;
          round = Simon.Round(level);
          start();
        }
      } else start(true);
    }
  });

  return {
    setmode: function(strict) {
      _strict = strict;
    },
    start: function() {
      level = 1;
      round = Simon.Round(level);
      start();
    },
    on: function() {
      _gameon = true;
    },
    off: function() {
      _gameon = false;
    }
  };
};

$(document).ready(function() {

  var game = Simon.Game();
  var gameon = false, strict = false;

  $('.switch > input').click(function() {
    if (gameon) {
      game.off();
      strict = false;
      game.setmode(strict);
      $('.indicator').css({'background': 'black'});
      $('.round').off('click');
    } else {
      game.on();
      $('.roundred').on('click', game.start);
      $('.roundyellow').on('click', function() {
        if (strict) {
          strict = false;
          game.setmode(strict);
          $('.indicator').css({'background': 'black'});
        } else {
          strict = true;
          game.setmode(strict);
          $('.indicator').css({'background': 'red'});
        }
      });
    }
  });

});
