
var isOperator = function(input) {
  return ['/', '*', '-', '+'].indexOf(input) >= 0;
};

var isNumber = function(input) {
  return parseFloat(input) == input;
};

$(document).ready(function() {

  var entry = '0', expression = [];

  var updateScreen = function() {
    $('div#entry').text(entry);
    if (expression.length === 0) {
      $('div#expression').text('0');
    } else {
      $('div#expression').text(expression.join(''));
    }
  };

  var clearAll = function() {
    entry = '0';
    expression = [];
  };

  var clearEntry = function() {
    entry = '0';
    expression.pop();
  };

  var calculate = function() {
    entry = eval($('div#expression').text()).toString();
    expression.push(entry);
  };

  var chars = [
    'AC', 'CE', '/', '*',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '3', '2', '1', '=',
    '0', '.'
  ];

  chars.forEach(function(char) {
    $('div#key').append($('<button>').text(char));
  });

  $('button:lt(2)').addClass('red');
  $('button:gt(1)').addClass('black');

  $('button:eq(16)').addClass('width2x');
  $('button:eq(15)').addClass('height2x');

  updateScreen();

  $('div#key button').click(function() {
    var input = $(this).text();

    if ('AC' === input) {
      clearAll();
    } else if ('CE' === input) {
      clearEntry();
    } else {
      /* Operator or Calculator (=) */
      if (isOperator(input) || '=' === input) {
        // if the first input is operator, set entry as default
        if (0 === expression.length) expression.push(entry);
        // auto correct (cancel last time operator)
        if (isOperator(expression[expression.length-1])) expression.pop();
        entry = input;
      }
      /* Operand */
      else {
        // new round
        if (0 === expression.length) entry = '0';
        // clear last input (entry)
        if (isNumber(entry)) expression.pop();

        if ('.' === input) {
          if (isNumber(entry)) {
            if (entry.search(/\./) === -1) {
              entry += input;
            } // ignore if contains '.'
          } else { // default entry = 0
            entry = '0.';
          }
        }

        if (isNumber(input)) {
          if (isNumber(entry) && '0' !== entry) {
            entry += input;
          } else {
            entry = input;
          }
        }
      }

      expression.push(entry);

      if ('=' === input) calculate();
    }

    console.log(expression);

    updateScreen();
    if ('=' === input) expression = [];
  });
});
