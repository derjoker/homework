
var Board = function() {
  var board, InitBoardValue = 0;
  var checkarr = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return {
    init: function() {
      board = Array(9).fill(InitBoardValue);
    },
    build: function() {
      $('div#ticboard').html('');
      for (var i = 0; i < board.length; ++i) {
        $('div#ticboard').append($('<div>', {'class': 'cell'}));
      }
      $('div#ticboard').append($('<div>').css({'clear': 'both'}));
    },
    update: function() {
      board.forEach(function(val, index) {
        if (InitBoardValue !== val) $('div.cell').eq(index).html(val);
      });
    },
    taken: function(place) {
      if (place === undefined) {
        if (board.every(function(val) {
          return val !== InitBoardValue;
        })) {
          console.log('it\'s a tie.');
          return true;
        }
        return false;
      }
      if (board[place] === undefined) return true; // index out of range
      return board[place] !== InitBoardValue;
    },
    weigh: function(place, piece) {
      if (this.taken(place)) return -1;
      return checkarr.reduce(function(prev, curr) {
        if (curr.indexOf(place) < 0) return prev;
        var cnt = _.countBy(curr.map(function(val) {
          return board[val];
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
        return prev + weight;
      }, 0);
    },
    check: function(piece) {
      return checkarr.some(function(line) {
        if (line.every(function(val) {
          return piece === board[val];
        })) {
          console.log(piece + ' wins.');
          line.forEach(function() {
            // [todo] circle
          });
          return true;
        }
        return false;
      });
    },
    play: function(piece, place) {
      board[place] = piece;
      this.update();
    }
  };
};

var Gamer = function(piece, board) {
  return {
    play: function(place) {
      if (place === undefined) {
        // AI
        var place;
        var weights = _.range(9).map(function(val) {
          return board.weigh(val, piece);
        });
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
      pieces = ['X', 'O'],
      _gamerPiece, _aiPiece,
      gamer, ai;

  return {
    init: function() {
      board.init();
      board.build();
    },
    setup: function(gamerPiece) {
      _gamerPiece = gamerPiece;
      _aiPiece = gamerPiece === pieces[0] ? pieces[1] : pieces[0];

      gamer = Gamer(_gamerPiece, board);
      ai = Gamer(_aiPiece, board);
    },
    start: function() {
      // 'X' plays first
      if (pieces[0] === _aiPiece) ai.play();

      var self = this;
      $('div.cell').on('click', function() {
        self.move($(this).index());
      });
    },
    over: function() {
      var ret = false;

      if (pieces.some(function(piece) {
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
