angular.module('newJobs.userProfile', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/user/:username', {
				templateUrl: 'profile/user.html',
				controller: 'userController'
			})
			.when('/user/:username/edit', {
				templateUrl: 'profile/edit.html',
				controller: 'myProfileController'
			})
			.when('/login', {
				templateUrl: 'profile/login.html',
				controller: 'authController'
			})
			.when('/register', {
				templateUrl: 'profile/register.html',
				controller: 'authController'
			})
	}])

	.factory('userService', function($resource) {
		return $resource('/api/user/:username');
	})
	.factory('userMethods', function() {
		var userMethods = {};
		
		return userMethods;
	})
	.controller('userController', function($scope, $routeParams, $rootScope, $location, userService) {
		$scope.isMine = false;

		if ($rootScope.current_user && $rootScope.current_user.username === $routeParams.username) {
			$scope.isMine = true;
		}

		$scope.user = userService.get({
			username: $routeParams.username
		}, function(res) {
			// console.log(res);
		}, function(err) {

			$location.path('/');
		});

	})
	.controller('myProfileController', function($scope, $http, $routeParams, $rootScope, $location, userService) {
		$scope.form_errors = {
			isMatch: true
		};

		if ($rootScope.current_user.username != $routeParams.username) {
			return $location.path('/');
		}
		$scope.myProfile = userService.get({
			username: $rootScope.current_user.username
		}, function(res) {
			console.log($scope.myProfile);
		}, function(err) {
			$location.path('/');
		});

		$scope.isMatch = function() {
			var isMatch = $scope.myProfile.new_password === $scope.myProfile.re_password;
			$scope.form_errors.isMatch = isMatch;
			return isMatch;
		}
		$scope.updateProfile = function() {
			if($scope.myProfile.new_password && $scope.myProfile.new_password.length) {
				if($scope.isMatch()) {
					$scope.myProfile.password = $scope.myProfile.new_password;
				} else {
					return;
				}
			}

			$rootScope.loading = true;
			$rootScope.loadText = 'Updating your profile';

			$http.put('/api/user/', $scope.myProfile).then(function(res) {
				$rootScope.loading = false;
				$rootScope.loadText = '';
			}, function(err) {
				$location.path('/');
			});
		}
	})
	.controller('authController', function($scope, $http, $location, $rootScope, $cookieStore, socket) {

		$scope.user = {};
		$scope.newUser = {};

		$scope.login = function() {
			$http.post('/auth/login', $scope.user).then(function(response) {
				$rootScope.authenticated = true;
				$rootScope.current_user = response.data.user;

				$cookieStore.put('user', $rootScope.current_user);
				$location.path('/');
				location.reload();
			}, function(err) {
				$scope.error_message = err.data.message;
			});
		};

		$scope.register = function() {
			$http.post('/auth/signup', $scope.newUser).then(function(response) {
				$location.path('/');
			}, function(response) {
				$scope.error_message = response.data.message;
			});
		}
		
	});