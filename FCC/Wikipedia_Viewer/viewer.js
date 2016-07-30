
$(document).ready(function() {

  $('span#search-icon').show();
  $('span#search-box').hide();

  $('i#search').click(function() {
    $('span#search-icon').hide();
    $('span#search-box').show();
    $('input').val('').focus();
  });

  $('i#close').click(function() {
    $('span#search-icon').show();
    $('span#search-box').hide();
    $('div#outbox').html('');
  });

  $('input#search').keyup(function(e) {
    if (e.keyCode === 13) {
      var search = $('input').val();
      var query = 'https://en.wikipedia.org/w/api.php?format=json&prop=extracts&exintro&explaintext&exsentences=1&exlimit=max&callback=?';
      $.getJSON(query, {
        action: 'query',
        generator: 'search',
        gsrsearch: search
      }, function(json) {
        // $('div#outbox').html(JSON.stringify(json));
        var tmpl = _.template($('#wiki-item').html());
        $('div#outbox').html('');
        _.forEach(json.query.pages, function(val) {
          $('div#outbox').append(tmpl({
            title: val.title,
            snippet: val.extract,
            url: 'https://en.wikipedia.org/?curid=' + val.pageid
          }));
        });
      });
    }
  });
});
