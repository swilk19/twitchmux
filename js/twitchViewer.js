var twitchViewer = angular.module('twitchViewer', ['ui.bootstrap']).
  config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://www.twitch.tv/**']);
  });

twitchViewer.factory('apiService', function($http, $log) {

  $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";

  var getTopGames = function() {
    //Get the top games
    return $http.jsonp('https://api.twitch.tv/kraken/games/top', {params:{'callback':'JSON_CALLBACK'}, "headers":"59q91785fnuyflproxefy3zldavt7zc"}).
      then(function(result) {
        //Top games array
        $log.log(result.data.top);
        return result.data.top;
      });
  };


  var getStreams = function(game, index) {
    //Get the streams for a game
    return $http.jsonp('https://api.twitch.tv/kraken/streams', {params:{'callback':'JSON_CALLBACK', 'game':game}, "headers":"59q91785fnuyflproxefy3zldavt7zc"}).
      then(function(result) {
        //Top games array
        //$log.log(result.data);
        return {'streams':result.data, 'index':index};
      });
  }

  return {getTopGames: getTopGames, getStreams: getStreams};

});

twitchViewer.controller('twitchViewerCtrl', function($scope, $log, $http, apiService) {
    
  $scope.oneAtATime = true;

  $scope.games = [];
  
  $scope.selectedStream = '';

  $scope.selectedGameIndex = 0;

  $scope.twitchStreamUrl = '';
  $scope.twitchChatUrl = '';


  $scope.selectStream = function(stream) {
    $log.log("Selecting stream: " + stream.channel.url);
    $scope.twitchStreamUrl = stream.channel.url + '/embed';
    $scope.twitchChatUrl = stream.channel.url + '/chat?popout=';

  }

  var attachAccordionListeners = function() {
    $scope.$watch('games', function(games) {
      angular.forEach(games, function(game, idx) {
        if(game.open) {
          $scope.selectedGameIndex = idx;
        }
      });
    }, true);
  }


  var fetchGamesAndStreams = function() { 
    $log.log("Fetching games list."); 
    var topGamesPromise = apiService.getTopGames();
    topGamesPromise.then(function(result) {
      $scope.games = result;
      //$log.log($scope.games);
      for (var i = $scope.games.length - 1; i >= 0; i--) {
        //$log.log($scope.games[i].game.name);
        var streams = apiService.getStreams($scope.games[i].game.name, i);
        streams.then(function(result) {
          //$log.log(result.streams.streams);
          //$log.log("index: " + result.index);
          $scope.games[result.index].game.streams = result.streams.streams;
        })
        $scope.games[i].game.streams = streams;
      };
      attachAccordionListeners();
    });
  }

  fetchGamesAndStreams();

  //$scope.twitchUrl = 'http://www.twitch.tv/tsm_theoddone/embed';
});
