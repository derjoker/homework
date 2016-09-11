
// open weather appid
var appid = '78c3b3214e39bb3123822de4979d573e';

var Weather = Weather || {};

Weather.Units = ['metric', 'imperial'];
Weather.Symbol = {'metric': 'C', 'imperial': 'F'};

Weather.get = function(unit) {
  var unit = unit || 'metric';
  var symbol = Weather.Symbol[unit];
  var tmpl_weather = $('#weather').html();

  $.getJSON('http://ipinfo.io/', function(ipinfo) {
    $.getJSON('http://api.openweathermap.org/data/2.5/weather?q='+ipinfo.city+'&units='+unit+'&appid='+appid, function(data) {
      // console.log(ipinfo);
      // console.log(data);
      var weather = $(_.template(tmpl_weather)({
        'city': ipinfo.city,
        'country': ipinfo.country,
        'temperature': data.main.temp,
        'unit': symbol,
        'weather': data.weather[0].main,
        'urlicon': 'http://openweathermap.org/img/w/'+data.weather[0].icon+'.png'
      }));
      $('span.temp-unit', weather).click(function() {
        var altunit = Weather.Units[0] === unit ? Weather.Units[1] : Weather.Units[0];
        Weather.get(altunit);
      });
      $('#weather-app').html(weather);
    });
  });
};

$(document).ready(function() {
  Weather.get();
});
