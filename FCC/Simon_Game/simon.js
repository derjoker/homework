
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
    }
  };
};

var Series = function(len) {
  var series = [], step = 0;
  for (var i = 0; i < len; ++i) {
    series.push(_.random(0,3));
  }
  // console.log(series);
  return {
    each: function(callback) {
      series.forEach(function(num, index) {
        window.setTimeout(callback, 1000 * index, num);
      });
    },
    check: function(num) {
      return series[step] === num ? ++step : 0;
    }
  };
};

var SimonGame = function() {
  var _series = [], _level = 1, _strict = false;
  var _gameon = false, _usermode = false;

  var series;

  var click = function(index) {
    $('td > div').eq(index).fadeOut(function() {
      $(this).fadeIn();
    });
    $('audio').eq(index).trigger('play');
  };

  var newRound = function(level) {
    _usermode = false;
    if (level) series = Series(level);
    series.each(click);
    window.setTimeout(function() {
      _usermode = true;
    }, 1000 * series.length);
  };

  $('td > div').on('click', function() {
    if (_gameon & _usermode) {
      var index = $('td > div').index(this);
      var result = series.check(index);
      if (0 === result) {
        $('td > div').eq(index).fadeOut(function() {
          $(this).fadeIn();
        });
        $('audio').eq(4).trigger('play');
        window.setTimeout(function() {
          if (_strict) {
            _level = 1;
            newRound(_level);
          } else {
            newRound();
          }
        }, 2000);
      } else {
        click(index);
        if (result === _level) {
          ++_level;
          newRound(_level);
        }
      }
    }
  });

  return {
    setmode: function(strict) {
      _strict = strict;
    },
    start: function() {
      _level = 1;
      newRound(_level);
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

  var round = Simon.Round(10);
  // round.start();
  round.start().done(function() {
    console.log('it\'s your turn.');
    round.start().done(function() {
      console.log('new round');
      Simon.Round(10).start();
    });
  });

  var play = function(index) {
    $('td > div').eq(index).fadeOut(function() {
      $(this).fadeIn();
    });
    $('audio').eq(index).trigger('play');
  };

  var game = SimonGame();
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
