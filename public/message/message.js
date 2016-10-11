angular.module('newJobs.message', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/messages', {
				templateUrl: 'message/connected-users.html',
				controller: 'messageController'
			})
			.when('/messages/:id', {
				templateUrl: 'message/message.html',
				controller: 'messageController'
			})
	}])
	.factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					// console.log(args);
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			}
		};
	})
	.controller('messageController', function($scope, $rootScope, $routeParams, $location, $timeout, socket) {
		if ($routeParams.id === $rootScope.current_user.username || !$rootScope.authenticated) {
			return $location.path('/');
		}
		$scope.receiver = $routeParams.id;
		$scope.peers = {};

		$timeout(function() {
			angular.forEach($rootScope.connUsers, function(user) {
				$scope.peers[user.name] = true;
			});
		}, 3000);
		
		

		// $scope.active_class = 
		// set socket for current user
		if ($routeParams.id) {
			socket.emit('new user', {
				curr_user: $rootScope.current_user.username,
				another_user: $routeParams.id
			});
		}

		// Load old messages
		$scope.messages = [];
		socket.on('load old msgs', function(messages) {
			$scope.messages = messages;
		});

		$scope.message = {
			_sender: $rootScope.current_user.username,
			_receiver: $routeParams.id,
			is_read: false,
			text: ''
		};

		$scope.sendMessage = function() {
			if (!$routeParams.id || !$scope.message._receiver || !$scope.message.text.trim().length) {
				return false;
			};

			$scope.messages.push({
				_sender: $rootScope.current_user.username,
				created_at: Date.now(),
				text: $scope.message.text.trim()
			});

			socket.emit('message', $scope.message);
			console.log($scope.message);
			$scope.message.text = '';
		};

		socket.on('message', function(message) {
			if (message._sender === $routeParams.id) {
				message.created_at = Date.now();
				$scope.messages.push(message);
			}
		});

		$rootScope.clrNotification = function() {
			angular.forEach($rootScope.connUsers, function(obj) {
				if (obj.name === $routeParams.id && obj.has_msg) {
					socket.emit('clr_notfic', {
						curr_user: $rootScope.current_user.username,
						another_user: obj.name
					});

					obj.has_msg = false;
				}
			});
		};


		$scope.callerPeer;
    	$scope.callStatus;

		function genUniqueStr() {
    		return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
		}
		// easyrtc.setUsername($rootScope.current_user.username);
		// easyrtc.setVideoDims(480,480);

    	easyrtc.setRoomOccupantListener(function(roomName, data, isPrimary) {
    		console.log(data);
    	});
    	
    	// setTimeout(function() {
    	// 	easyrtc.easyApp("private_video", "selfVideo", ["callerVideo"], function(){}, function(){});
    	// }, 5000);

    	$scope.makeCall = function() {

			$scope.callStatus = 'Initiating call, please wait...';
			$scope.showVideoContainer = true;
			var callID = genUniqueStr();
			
			
    		easyrtc.easyApp("private_video_"+ $rootScope.current_user.username, "selfVideo", ["callerVideo"], function(){
    			console.log('calling...');
    			console.log(easyrtc.getApplicationFields());
    			$scope.$apply(function() {
    				$scope.callStatus = 'Calling...' + $scope.receiver;
    			});

    			socket.emit('private_call', {
    				caller_id: easyrtc.myEasyrtcid,
    				caller_username: $rootScope.current_user.username,
    				_receiver: $scope.receiver
    			});

    		}, function() {
    			console.log('easyrtc easyrtc.easyApp error')
    		});


    		// easyrtc.hangupAll();
    		// easyrtc.call(easyrtcid, function(){}, function(){});
    	}
    	$scope.receiveCall = function() {
    		socket.emit('call_received', $scope.callerPeer);

			$scope.showIncommingCallDialogue = false;
			easyrtc.hangupAll();
			easyrtc.call($scope.callerPeer.caller_id, function(){}, function(){});
			$scope.showVideoContainer = true;
    	}

    	$scope.endCall = function() {
    		easyrtc.hangupAll();
    		$scope.showVideoContainer = false;
    	}


    	socket.on('private_call', function(peerData) {
    		easyrtc.easyApp("private_video_"+ peerData.caller_username, "selfVideo", ["callerVideo"], function() {
    			console.log('peer connected');

    			$scope.$apply(function() {
    				$scope.callerPeer = peerData;
    				$scope.showIncommingCallDialogue = true;
    			});

    		}, function() {
    			console.log('Error on receiving call')
    		})
    	});

    	socket.on('call_received', function(data) {
    		$scope.callStatus = 'Connected, Start talking.'
    	})

	})