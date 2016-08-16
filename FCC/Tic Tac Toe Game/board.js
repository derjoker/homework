
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
  'win': 100, 'block': 50, 'fork': 30, 'force': 10,
  'possible': 2, 'tbd': 1, 'zero': 0
};

var Board = function(arr) {
  var array = arr ? _.clone(arr) : Array(9).fill(InitBoardValue);
  return {
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
    move: function(piece, position) {
      if (this.isEmpty(position)) {
        array[position] = piece;
        return true;
      }
      return false;
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

  if (Game(board).over() || depth < 1) return [];

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

var Game = function(board) {
  return {
    over: function() {
      if (board.rows().length > 0) {
        return true;
      }
      if (board.positions().length === 0) {
        return true;
      }
      return false;
    }
  };
};

$(document).ready(function() {
  var array = ['X', '', '', '', 'O', '', '', '', 'X'],
      board = Board(array),
      game = Game(board);

  var bt = BoardTree(board, 'O', 7);
  console.log(bt);
});
