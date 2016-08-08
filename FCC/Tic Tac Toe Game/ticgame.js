
var Pieces = ['X', 'O'];

var getOpponent = function(piece) {
  return Pieces[0] === piece ? Pieces[1] : Pieces[0];
};

// 'X' plays first
var playsFirst = function(piece) {
  return Pieces[0] === piece;
};

var InitBoardValue = 0;

var checkarr = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

var checker = checkarr.reduce(function(prev, curr) {
  curr.forEach(function(val) {
    if (prev.hasOwnProperty(val)) prev[val].push(curr);
    else prev[val] = [curr];
  });
  return prev;
}, {});

var Board = function() {
  var bdArray;

  return {
    init: function(arr) {
      if (arr === undefined) arr = Array(9).fill(InitBoardValue);
      bdArray = arr;
    },
    build: function() {
      $('div#ticboard').html('');
      for (var i = 0; i < bdArray.length; ++i) {
        $('div#ticboard').append($('<div>', {'class': 'cell'}));
      }
      $('div#ticboard').append($('<div>').css({'clear': 'both'}));
    },
    update: function() {
      bdArray.forEach(function(val, index) {
        if (InitBoardValue !== val) $('div.cell').eq(index).html(val);
      });
    },
    positions: function() {
      return bdArray.filter(function(val) {
        return InitBoardValue === val;
      });
    },
    taken: function(place) {
      if (place === undefined) {
        if (bdArray.every(function(val) {
          return val !== InitBoardValue;
        })) {
          console.log('it\'s a tie.');
          return true;
        }
        return false;
      }
      if (bdArray[place] === undefined) return true; // index out of range
      return bdArray[place] !== InitBoardValue;
    },
    weigh: function(place, piece) {
      if (this.taken(place)) return -1;
      var win = [], lose = [];
      var weights = checker[place].map(function(line) {
        var cnt = _.countBy(line.map(function(val) {
          return bdArray[val];
        }));
        var weight = 0;
        if (cnt[InitBoardValue] === 3) weight += 1;
        if (cnt[InitBoardValue] === 2) {
          if (cnt[piece]) weight += 2;
          else weight += 1;
        }
        if (cnt[InitBoardValue] === 1) {
          if (cnt[piece]) {
            if (cnt[piece] == 2) weight += 100; // win
          } else weight += 50; // otherwise lose
        }
        // console.log(cnt, weight);
        return weight;
      });
      return weights.reduce(function(a, b) {return a+b;});
    },
    rehearse: function(piece, depth) {
      if (piece === undefined) return this.positions();
      if (depth === undefined) depth = 0;
    },
    check: function(piece) {
      return checkarr.some(function(line) {
        if (line.every(function(val) {
          return piece === bdArray[val];
        })) {
          console.log(piece + ' wins.');
          line.forEach(function(val) {
            $('div.cell').eq(val).addClass('highlight');
          });
          return true;
        }
        return false;
      });
    },
    play: function(piece, place) {
      bdArray[place] = piece;
      this.update();
    }
  };
};

var Gamer = function(piece, board) {
  return {
    play: function(place) {
      var weights = _.range(9).map(function(val) {
        return board.weigh(val, piece);
      });
      console.log(weights);

      if (place === undefined) {
        // AI
        var place;

        var max = _.max(weights)

        place = _.sample(weights.reduce(function(prev, curr, index) {
          if (max === curr) prev.push(index);
          return prev;
        }, []));
        if (weights[place] !== _.max(weights)) console.log('Error!');
      }
      board.play(piece, place);
    }
  };
};

var Game = function() {
  var board = Board(),
      gamerPiece, aiPiece,
      gamer, ai;

  return {
    init: function() {
      board.init();
      board.build();
    },
    setup: function(piece) {
      gamerPiece = piece;
      aiPiece = getOpponent(piece);

      gamer = Gamer(gamerPiece, board);
      ai = Gamer(aiPiece, board);
    },
    start: function() {
      if (playsFirst(aiPiece)) ai.play();

      var self = this;
      $('div.cell').on('click', function() {
        self.move($(this).index());
      });
    },
    over: function() {
      var ret = false;

      if (Pieces.some(function(piece) {
        return board.check(piece);
      })) {
        ret = true;
      } else if (board.taken()) {
        ret = true;
      }

      // delay 3s
      if (ret) {
        // deactivate click
        $('div.cell').off();
        setTimeout(() => {
          this.init();
          this.start();
        }, 3000);
      }

      return ret;
    },
    move: function(place) {
      if (board.taken(place)) return;
      gamer.play(place);
      if (this.over()) return;
      ai.play();
      if (this.over()) return;
    }
  };
};

$(document).ready(function() {

  var game = Game();
  game.init();

  $('dialog button').click(function() {
    // setup player
    var gamerPiece = $(this).text();
    game.setup(gamerPiece)
    document.getElementById('config').close();

    game.start();
  });

});
