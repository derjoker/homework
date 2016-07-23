var channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", 'max19830705', 'brunofin', 'comster404'];

$(document).ready(function() {
  /* Template */
  var tmpl_tw_item = $('#twitch-item').html();
  var appendItem = function(status, logo, href, name, detail) {
    var item = _.template(tmpl_tw_item)({
      'status': status, 'logo': logo, 'href': href, 'name': name, 'detail': detail
    });
    $('#twitch-box').append(item);
  };

  /* JSON */
  channels.forEach(function(channel) {
    var stream_query = 'https://api.twitch.tv/kraken/streams/' + channel,
        channel_query = 'https://api.twitch.tv/kraken/channels/' + channel;

    var status,
        // twitch 404 user
        logo = 'https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png',
        href = '#',
        name = channel,
        detail;

    $.getJSON(stream_query, function(json) {
      if (json.stream) {
        var json_channel = json.stream.channel;

        status = 'status-online';
        href = json_channel.url;
        detail = json_channel.status;
      } else {
        status = 'status-offline';
        detail = 'Offline';
      }
    }).fail(function(jqxhr, textStatus, error) {
      status = 'status-close';
      detail = 'Account Closed';
    }).always(function() {
      $.getJSON(channel_query, function(json) {
        if (json.logo) logo = json.logo;
        if (json.display_name) name = json.display_name;
      }).always(function() {
        appendItem(status, logo, href, name, detail);
      });
    });
  });
});
