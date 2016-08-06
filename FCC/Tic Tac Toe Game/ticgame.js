
var pieces = ['X', 'O'];

var InitBoardValue = 0;

var board = Array(9).fill(InitBoardValue);

var checkarr = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

var check = function(piece) {
  return checkarr.some(function(line) {
    return line.every(function(val) {
      return piece === board[val];
    });
  });
};

var taken = function(place) {
  if (place === undefined) {
    return board.every(function(val) {
      return val !== InitBoardValue;
    });
  }
  if (board[place] === undefined) return true; // index out of range
  return board[place] !== InitBoardValue;
};

var weigh = function(place, piece) {
  // console.log(place);
  if (taken(place)) return -1;
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
};

var gameOver = function() {
  return taken() || pieces.some(function(piece) {
    return check(piece);
  });
};

var Player = function(piece) {
  return {
    play: function(place) {
      if (!gameOver() && !taken(place)) {
        var weights = _.range(board.length).map(function(val) {
          return weigh(val, piece);
        });
        console.log(weights);
        board[place] = piece;
        if (check(piece)) console.log(piece + ' wins.');
        return true;
      }
      return false;
    }
  };
};

var AutoPlayer = function(piece) {
  return {
    play: function(forcePlace) {
      if (forcePlace !== undefined) return Player(piece).play(forcePlace);
      var weights = _.range(board.length).map(function(val) {
        return weigh(val, piece);
      });
      var max = _.max(weights)
      var place = _.sample(weights.reduce(function(prev, curr, index) {
        if (max === curr) prev.push(index);
        return prev;
      }, []));
      if (weights[place] !== _.max(weights)) console.log('Error!');
      return Player(piece).play(place);
    }
  };
};

$(document).ready(function() {

  // build chess board
  for (var i = 0; i < board.length; ++i) {
    $('div#ticboard').append($('<div>', {'class': 'cell'}));
  }
  $('div#ticboard').append($('<div>').css({'clear': 'both'}));

  var updateBoard = function() {
    board.forEach(function(val, index) {
      if (InitBoardValue !== val) $('div.cell').eq(index).html(val);
    });
  };

  updateBoard();

  // setup player
  var piece = 'X', autopiece = 'O';
  var player = Player(piece), autoplayer = AutoPlayer(autopiece);

  // autoplayer.play(_.sample(_.range(9)));
  // updateBoard();

  $('div.cell').click(function() {
    if (!gameOver() && player.play($(this).index())) {
      updateBoard();
      if (autoplayer.play()) updateBoard();
    }
  });

});
