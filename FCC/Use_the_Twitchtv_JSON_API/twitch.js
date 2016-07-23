var channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", 'max19830705x', 'brunofin', 'comster404'];

$(document).ready(function() {
  /* Template */
  var tmpl_tw_item = $('#twitch-item').html();
  var appendItem = function(display, detail, status) {
    var item = _.template(tmpl_tw_item)({
      'status': status, 'display': display, 'detail': detail
    });
    $('#twitch-box').append(item);
  };

  /* JSON */
  channels.forEach(function(channel) {
    var stream = 'https://api.twitch.tv/kraken/streams/' + channel;
    var display = channel, detail, status;

    $.getJSON(stream, function(json) {
      if (json['stream']) {
        var json_channel = json.stream.channel,
            display_name = json_channel.display_name,
            url = json_channel.url,
            channel_status = json_channel.status,
            preview = json.stream.preview.medium;

        display = '<a href="'+url+'" target="_blank">'+display_name+'</a>';
        detail = channel_status;
        status = 'status-online';
      } else {
        detail = 'Offline';
        status = 'status-offline';
      }
    }).fail(function(jqxhr, textStatus, error) {
      detail = 'Account Closed';
      status = 'status-close';
    }).always(function() {
      appendItem(display, detail, status);
    });
  });
});
