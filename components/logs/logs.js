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