(function() {

	
	var app = angular.module("workoutlog", [
		"ui.router",
		"workoutlog.auth.signup",
		"workoutlog.auth.signin",
		"workoutlog.define",
		"workoutlog.logs",
		"workoutlog.history"
	]);


	function config($urlRouterProvider) {
		$urlRouterProvider.otherwise("/signin");
	}

	config.$inject = ["$urlRouterProvider"];
	app.config(config);
	app.constant("API_BASE", "//localhost:3000/api/");


})();
(function(){


angular.module("workoutlog.auth.signin",["ui.router"])
	.config(signinConfig);




function signinConfig($stateProvider) {
	$stateProvider
		.state("signin", {
			url: "/signin",
			templateUrl: "/components/auth/signin.html",
			controller: SignInController,
			controllerAs: "ctrl",
			bindToController: this
		});
}

signinConfig.$inject = ["$stateProvider"];





function SignInController($state, UsersService) {
	var vm = this;
	vm.user = {};
	vm.login = function() {
		UsersService.login(vm.user).then(function(response){
			console.log(response);
			$state.go("define");
		});
	};
}

SignInController.$inject = ["$state", "UsersService"];



})();//end of wrapper IIFE
(function(){


angular.module("workoutlog.auth.signup", ["ui.router"])
	.config(signupConfig);



function signupConfig($stateProvider) {
	$stateProvider
		.state("signup",{
			url: "/signup",
			templateUrl: "/components/auth/signup.html",
			controller: SignUpController,
			controllerAs: "ctrl",
			bindToController: this
		});
}

signupConfig.$inject = ["$stateProvider"];




function SignUpController($state, UsersService) {
	var vm = this;
	vm.user = {};
	vm.submit = function() {
		UsersService.create(vm.user).then(function(response){
			console.log("Response in signup.js from the SignUpController, where we UsersService.create: " + response);
			$state.go("define");
		});
	};
}

SignUpController.$inject = ["$state", "UsersService"];





})();//end of wrapper IIFE

(function() {


angular.module("workoutlog")
	.directive("userlinks", function() {

		UserLinksController.$inject = ["$state", "CurrentUser", "SessionToken"];

		function UserLinksController($state, CurrentUser, SessionToken) {
			var vm = this;
			
			vm.user = function() {
				return CurrentUser.get();
			};

			vm.signedIn = function() {
				return !!(vm.user().id);
			};

			vm.logout = function() {
				CurrentUser.clear();
				SessionToken.clear();
				$state.go("signin");
			};
		};


		return {
			scope: {},
			controller: UserLinksController,
			controllerAs: "ctrl",
			bindToController: true,
			templateUrl: "/components/auth/userlinks.html"
		};


	});//end of directive




})();//end of wrapper IIFE


//Notice the return at the bottom of the application.  This is where the directive is configured.  
//It is similar to the configuration of the other components.  One item to note is the scope: {}; creates an isolated scope.  
//This isolates the data to that portion of the application.


(function() {


angular.module("workoutlog.history", ["ui.router"])
	.config(historyConfig);



historyConfig.$inject = ["$stateProvider"];

function historyConfig($stateProvider) {
	$stateProvider
		.state("history", {
			url: "/history",
			templateUrl: "/components/history/history.html",
			controller: HistoryController,
			controllerAs: "ctrl",
			bindToController: this,
			resolve: {
				getUserLogs: [
					"LogsService",
					function(LogsService) {
						return LogsService.fetch();
					}
				]
			}
		});
};



HistoryController.$inject = ["$state", "LogsService"];

function HistoryController($state, LogsService) {
	var vm = this;
	vm.history = LogsService.getLogs();

	vm.delete = function(item) {
		LogsService.deleteLogs(item);
	};

	vm.updateLog = function(item) {
		$state.go("logs/update", {"id": item.id});
	};

};




})();//end of wrapper IIFE


//Notice how LogsService is injected and then implemented in this controller.  The history
//component is used to present the collection of logs.  Look inside vm.updateLog, $state.go has the
//route as the first argument but the second argument is an object with an id property.  This is how logs.js ‘knows” which log to get so it can be updated.

(function() {


angular.module("workoutlog.define", ["ui.router"])
	.config(defineConfig);




function defineConfig($stateProvider) {

	$stateProvider
		.state("define", {
			url: "/define",
			templateUrl: "/components/define/define.html",
			controller: DefineController,
			controllerAs: "ctrl",
			bindToController: this,
			resolve: [
				"CurrentUser", "$q", "$state",
				function(CurrentUser, $q, $state){
					var deferred = $q.defer();
					if (CurrentUser.isSignedIn()){
						deferred.resolve();
					} else {
						deferred.reject();
						$state.go("signin");
					}
					return deferred.promise;
				}	
			]
		});
}

defineConfig.$inject = ["$stateProvider"];



function DefineController( $state, DefineService ) {
	var vm = this;
	vm.message = "Define a workout category here";
	vm.saved = false;
	vm.definition = {};
	vm.save = function() {
		DefineService.save(vm.definition)
			.then(function(){
				vm.saved = true;
				$state.go("logs")
			});
	};
	
}

DefineController.$inject = ["$state", "DefineService"];





})();
(function(){


angular.module("workoutlog.logs", ["ui.router"])
	.config(logsConfig);



logsConfig.$inject = ["$stateProvider"];

function logsConfig($stateProvider) {
	$stateProvider
		.state("logs", {
			url: "/logs",
			templateUrl: "/components/logs/logs.html",
			controller: LogsController,
			controllerAs: "ctrl",
			bindToController: this,
			resolve: {
				getUserDefinitions: [
					"DefineService",
					function(DefineService) {
						return DefineService.fetch();
					}
				]
			}
		})
		.state("logs/update", {
			url: "/logs/:id",         //this is where it assigns the value of $stateParams.id
			templateUrl: "/components/logs/log-update.html",
			controller: LogsController,
			controllerAs: "ctrl",
			bindToController: this,
			resolve: {           //Notice on the .state(‘logs/update’) that there are two functions that occur on the resolve.  This allows the route to have access to the 
				getSingleLog: function($stateParams, LogsService) {    //data of the log being edited.  Also note, that the resolve is getting all user definitions of a workout.
						return LogsService.fetchOne($stateParams.id);
				},

				getUserDefinitions: function(DefineService) {
					return DefineService.fetch();
				}		
			}
		});//end of $stateProvider . stuff
}




LogsController.$inject = ["$state", "DefineService", "LogsService"];

function LogsController($state, DefineService, LogsService) {
	var vm = this;
	vm.saved = false;
	vm.log = {};
	vm.userDefinitions = DefineService.getDefinitions();
	vm.updateLog = LogsService.getLog();
	vm.save = function() {
		LogsService.save(vm.log)
			.then(function(){
				vm.saved = true;
				$state.go("history");
			});
	};

	vm.updateSingleLog = function() {
		var logToUpdate = {
			id: vm.updateLog.id,
			desc: vm.updateLog.description,
			result: vm.updateLog.result,
			def: vm.updateLog.def
		}
		LogsService.updateLog(logToUpdate)
			.then(function() {
				$state.go("history");
			});
	};
}




})();//end of wrapper IIFE

(function(){

	angular.module("workoutlog")
		.factory("AuthInterceptor", ["SessionToken", "API_BASE", 
			function(SessionToken, API_BASE) {
				return {
					request: function(config) {
						var token = SessionToken.get();
						if (token && config.url.indexOf(API_BASE) > -1) {
							config.headers["Authorization"] = token;
						}
						return config;
					}
				};
			}]);

	angular.module("workoutlog")
		.config(["$httpProvider", function($httpProvider) {
			return $httpProvider.interceptors.push("AuthInterceptor");
		}]);
		
})();
(function() {

	angular.module("workoutlog")
		.service("CurrentUser", [ "$window", function($window) {
			function CurrentUser() {
				var currUser = $window.localStorage.getItem("currentUser");
				if (currUser && currUser !== "undefined") {
					this.currentUser = JSON.parse($window.localStorage.getItem("currentUser"));
				}
			}
			CurrentUser.prototype.set = function(user) {
				this.currentUser = user;
				$window.localStorage.setItem("currentUser", JSON.stringify(user));
			};
			CurrentUser.prototype.get = function() {
				return this.currentUser || {};
			};
			CurrentUser.prototype.clear = function() {
				this.currentUser = undefined;
				$window.localStorage.removeItem("currentUser");
			};
			CurrentUser.prototype.isSignedIn = function() {
				return !!this.get().id;
			};

			return new CurrentUser();

		}]);



})();
(function(){


	angular.module("workoutlog")
		.service("DefineService", DefineService);


		DefineService.$inject = ["$http", "API_BASE"];


		function DefineService($http, API_BASE) {
			var defineService = this;
			defineService.userDefinitions = [];

			defineService.save = function(definition) {
				return $http.post(API_BASE + "definition", {
						definition: definition
					}).then(function(response){
						defineService.userDefinitions.unshift(response.data);
					});
			};

			defineService.fetch = function(definition) {
				return $http.get(API_BASE + "definition")
					.then(function(response){
						defineService.userDefinitions = response.data;
				});
			};

			defineService.getDefinitions = function() {
				return defineService.userDefinitions;
			};


		}


})();
(function(){


angular.module("workoutlog")
	.service("LogsService", LogsService);



	LogsService.$inject = ["$http", "API_BASE"];

	function LogsService($http, API_BASE, DefineService) {
		var logsService = this;
		logsService.workouts = [];
		logsService.individualLog = {};



		logsService.save = function(log) {
			return $http.post(API_BASE + "log", {
				log: log
			}).then(function(response){
				logsService.workouts.push(response);
			});
		};

		logsService.fetch = function(log) {
			return $http.get(API_BASE + "log")
				.then(function(response){
					logsService.workouts = response.data;
				});
		};

		logsService.getLogs = function() {
			return logsService.workouts;
		};

		logsService.deleteLogs = function(log) {
			var logIndex = logsService.workouts.indexOf(log);
			logsService.workouts.splice(logIndex, 1);
			var deleteData = {log: log};
			return $http({
				method: "DELETE",
				url: API_BASE + "log",
				data: JSON.stringify(deleteData),
				headers: {"Content-Type": "application/json"}
			});
		};

		logsService.fetchOne = function(log) {
			//console.log(log);
			return $http.get(API_BASE + "log/" + log)
				.then(function(response) {
					logsService.individualLog = response.data;
				});
		};

		logsService.getLog = function() {
			return logsService.individualLog;
		};

		logsService.updateLog = function(logToUpdate) {
			return $http.put(API_BASE + "log", { log: logToUpdate });
		};

	}//end of function LogsService()




})();//end of wrapper IIFE
(function(){

	angular.module("workoutlog")
		.service("SessionToken", ["$window", function($window) {
			function SessionToken(){
				this.sessionToken = $window.localStorage.getItem("sessionToken");
			}

			SessionToken.prototype.set = function(token) {
				this.sessionToken = token;
				$window.localStorage.setItem("sessionToken", token);
			};

			SessionToken.prototype.get = function(){
				return this.sessionToken;
			};

			SessionToken.prototype.clear = function() {
				this.sessionToken = undefined;
				$window.localStorage.removeItem("sessionToken");
			};

			return new SessionToken();
			
		}]);


})();
(function(){

	angular.module("workoutlog")
		.service("UsersService", [
			"$http", "API_BASE", "SessionToken", "CurrentUser",
			function($http, API_BASE, SessionToken, CurrentUser) {
				function UsersService(){

				}

				UsersService.prototype.create = function(user) {
					var userPromise = $http.post(API_BASE + "user", {
						user: user
					});

					userPromise.then(function(response){
						SessionToken.set(response.data.sessionToken);
						CurrentUser.set(response.data.user);
					});
					return userPromise;
				};

				UsersService.prototype.login = function(user) {
					var loginPromise = $http.post(API_BASE + "login",{
						user: user
					});

					loginPromise.then(function(response){
						
						SessionToken.set(response.data.sessionToken);
						CurrentUser.set(response.data.user);
					});
					return loginPromise;
				};

				return new UsersService();

			}]);


		
})();
//# sourceMappingURL=bundle.js.map
