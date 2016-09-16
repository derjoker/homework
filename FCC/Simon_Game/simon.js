
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

Simon.Level = function() {
  return {
    set: function(level) {
      $('.display').text(level);
    }
  };
};

Simon.Mode = function() {
  return {
    set: function(strict) {
      if (strict) {
        $('.indicator').css({'background': 'red'});
      } else {
        $('.indicator').css({'background': 'black'});
      }
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
    Simon.Level().set(level);
    window.setTimeout(function() {
      round.start().done(function() {
        _usermode = true;
      });
    }, 800);
  };

  $('td > div').on('click', function() {
    if (_gameon && _usermode) {
      var index = $('td > div').index(this);
      var result = round.check(index);
      Simon.Effect().click(index);
      if (result > 0) {
        Simon.Audio().play(index).done(function() {
          if (result === level) {
            if (level > 19) {
              level = 0;
              alert('You win the game! (20)');
            }
            ++level;
            round = Simon.Round(level);
            start();
          }
        });
      } else {
        Simon.Level().set('!!');
        Simon.Audio().play(4).done(function() {
          start(true);
        });
      }
    }
  });

  return {
    setmode: function(strict) {
      _strict = strict;
      Simon.Mode().set(strict);
    },
    start: function() {
      level = 1;
      round = Simon.Round(level);
      start();
    },
    on: function() {
      _gameon = true;
      Simon.Level().set('--');
    },
    off: function() {
      _gameon = false;
      Simon.Level().set('');
    }
  };
};

$(document).ready(function() {

  var game = Simon.Game();
  var gameon = false, strict = false;

  $('.switch > input').click(function() {
    if (gameon) {
      game.off();
      gameon = false;
      strict = false;
      game.setmode(strict);
      $('.round').off('click');
    } else {
      game.on();
      gameon = true;
      $('.roundred').on('click', game.start);
      $('.roundyellow').on('click', function() {
        if (strict) {
          strict = false;
          game.setmode(strict);
        } else {
          strict = true;
          game.setmode(strict);
        }
      });
    }
  });

});
