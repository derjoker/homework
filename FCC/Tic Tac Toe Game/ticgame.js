
var Pieces = ['X', 'O'];

var getOpponent = function(piece) {
  return Pieces[0] === piece ? Pieces[1] : Pieces[0];
};

// 'X' plays first
var playsFirst = function(piece) {
  return Pieces[0] === piece;
};

var InitBoardValue = '';

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

var Weight = {
  'win': 100, 'tbd': 1
};

var Board = function(arr) {
  var array = arr ? _.clone(arr) : Array(9).fill(InitBoardValue);
  return {
    init: function() {
      array = Array(9).fill(InitBoardValue);
    },
    get: function() {
      return array;
    },
    clone: function() {
      return Board(array);
    },
    isEmpty: function(position) {
      return InitBoardValue === array[position];
    },
    positions: function() {
      return _.range(array.length).filter((position) => {
        return this.isEmpty(position);
      });
    },
    rows: function() {
      return checkarr.filter(function(row) {
        var piece = array[row[0]];
        if (piece === InitBoardValue) return false;
        return row.every(function(val) {
          return piece === array[val];
        });
      });
    },
    towin: function(piece, position) {
      if (this.isEmpty(position)) {
        var clone = _.clone(array);
        clone[position] = piece;
        return checker[position].some(function(row) {
          return row.every(function(pos) {
            return piece === clone[pos];
          });
        });
      }
      return false;
    },
    over: function() {
      if (this.rows().length > 0) return true;
      if (this.positions().length === 0) return true;
      return false;
    },
    move: function(piece, position) {
      if (this.isEmpty(position)) {
        array[position] = piece;
        return true;
      }
      return false;
    }
  };
};

var Grid = function() {
  return {
    build: function() {
      $('div#ticboard').html('');
      for (var i = 0; i < 9; ++i) {
        $('div#ticboard').append($('<div>', {'class': 'cell'}));
      }
      $('div#ticboard').append($('<div>').css({'clear': 'both'}));
    },
    update: function(board) {
      console.log(board.get());
      board.get().forEach(function(val, index) {
        $('div.cell').eq(index).html(val);
      });
    }
  };
};

var Node = function(position, weight, nodes) {
  this.position = position;
  this.weight = weight;
  this.children = nodes ? _.clone(nodes) : [];
};

var maximize = function(board, piece) {
  var positions = board.positions(),
      weight = Weight['tbd'];
  var tmp = positions.filter(function(pos) {
    return board.towin(piece, pos);
  });
  if (tmp.length > 0) {
    positions = tmp;
    weight = Weight['win'];
  }
  return positions.map(function(pos) {
    return new Node(pos, weight);
  });
};

var minimize = function(board, piece) {
  return maximize(board, piece).map(function(node) {
    node.weight = -node.weight;
    return node;
  });
};

var BoardTree = function(board, piece, depth, maxmin) {
  var depth = depth === undefined ? 1 : depth;
  var maxmin = maxmin === undefined ? maximize : maxmin;

  if (board.over() || depth < 1) return [];

  var ret = maxmin(board, piece);

  if (depth === 1) return ret;

  var nextmaxmin = maxmin === maximize ? minimize : maximize;
  var opponent = getOpponent(piece);
  ret.map(function(node) {
    var clone = board.clone();
    clone.move(piece, node.position);
    var bt = BoardTree(clone, opponent, depth - 1, nextmaxmin);
    if (bt.length > 0) {
      node.weight = nextmaxmin === maximize ? _.max(bt, 'weight').weight : _.min(bt, 'weight').weight;
    }
    return node;
  });

  return ret;
};

var Gamer = function(piece, board) {
  return {
    play: function(position) {
      if (position === undefined) {
        var bt = BoardTree(board, piece, 9);
        var max = _.max(bt, 'weight').weight;
        var position = _.sample(
          _.pluck(_.where(bt, {weight: max}), 'position')
        );
      }
      board.move(piece, position);
    }
  };
};

var Game = function() {
  var board = Board(),
      grid = Grid(),
      gamerPiece, aiPiece,
      gamer, ai;

  return {
    init: function() {
      board.init();
      grid.build();
    },
    setup: function(piece) {
      gamerPiece = piece;
      aiPiece = getOpponent(piece);

      gamer = Gamer(gamerPiece, board);
      ai = Gamer(aiPiece, board);
    },
    start: function() {
      console.log('start!');
      if (playsFirst(aiPiece)) {
        ai.play(_.sample([0,2,4,6,8]));
        grid.update(board);
      }

      var self = this;
      $('div.cell').on('click', function() {
        self.move($(this).index());
      });
    },
    over: function() {
      var ret = board.over();

      // delay 3s
      if (ret) {
        board.rows().forEach(function(row) {
          row.forEach(function(val) {
            $('div.cell').eq(val).addClass('highlight');
          });
        });
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
      if (!board.isEmpty(place)) return;
      gamer.play(place);
      grid.update(board);
      if (this.over()) return;
      ai.play();
      grid.update(board);
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
