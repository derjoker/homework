
$(document).ready(function() {
  var quotes = $('div.backend span');
  var newQuote = function() {
    var next = Math.floor(Math.random() * (quotes.length));
    $('#quote-text').html(quotes[next]);
  };

  newQuote();
  $('#new-quote').click(newQuote);
});
