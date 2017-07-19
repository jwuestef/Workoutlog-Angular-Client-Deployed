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