
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

