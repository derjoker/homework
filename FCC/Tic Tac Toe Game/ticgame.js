
var Piece = function(piece) {
  var _pieces = ['X', 'O'], _piece = _pieces[0];
  if (_pieces[1] === piece) _piece = _pieces[1];
  return {
    get: function() {
      return _piece;
    },
    opponent: function() {
      return _pieces[0] === _piece ? _pieces[1] : _pieces[0];
    }
  };
};

var Board = function() {
  var _board, InitBoardValue = 0;
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

  return {
    init: function(board) {
      if (board === undefined || !Array.isArray(board)) _board = Array(9).fill(InitBoardValue);
      else _board = _.clone(board);
    },
    build: function() {
      $('div#ticboard').html('');
      for (var i = 0; i < _board.length; ++i) {
        $('div#ticboard').append($('<div>', {'class': 'cell'}));
      }
      $('div#ticboard').append($('<div>').css({'clear': 'both'}));
    },
    update: function() {
      _board.forEach(function(val, index) {
        if (InitBoardValue !== val) $('div.cell').eq(index).html(val);
      });
    },
    positions: function() {
      return _board.filter(function(val) {
        return InitBoardValue === val;
      });
    },
    taken: function(place) {
      if (place === undefined) {
        if (_board.every(function(val) {
          return val !== InitBoardValue;
        })) {
          console.log('it\'s a tie.');
          return true;
        }
        return false;
      }
      if (_board[place] === undefined) return true; // index out of range
      return _board[place] !== InitBoardValue;
    },
    weigh: function(place, piece) {
      if (this.taken(place)) return -1;
      var win = [], lose = [];
      var weights = checker[place].map(function(line) {
        var cnt = _.countBy(line.map(function(val) {
          return _board[val];
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
          return piece === _board[val];
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
      _board[place] = piece;
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
      pieces = ['X', 'O'],
      _gamerPiece, _aiPiece,
      gamer, ai;

  return {
    init: function() {
      board.init();
      board.build();
    },
    setup: function(gamerPiece) {
      var piece = Piece(gamerPiece);
      _gamerPiece = piece.get();
      _aiPiece = piece.opponent();

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
