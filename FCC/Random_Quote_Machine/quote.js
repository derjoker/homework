
$(document).ready(function() {
  var quotes = $('div.backend span');
  var newQuote = function() {
    var next = Math.floor(Math.random() * (quotes.length));
    $('#quote-text').html(quotes[next]);
    $('a#share-twitter').attr('href', 'https://twitter.com/intent/tweet?text=' + $('#quote-text').text() + ' - Taylor Swift @taylorswift13');
  };

  newQuote();
  $('#new-quote').click(newQuote);
});
