var express = require("express");
var passport = require("../config/passportConfig");
var db = require("../models");
var router = express.Router();

router.get("/login", function(req, res) {
	res.render("auth/login");
});

router.post("/login", passport.authenticate("local", {
	successRedirect: "/profile",
	successFlash: "Login Successful!",
	failureRedirect: "/auth/login",
	failureFlash: "Invalid Credentials"
}));

router.get("/signup", function(req, res) {
	res.render("auth/signup");
});

router.post("/signup", function(req, res) {
	console.log("req.body is", req.body);
	db.user.findOrCreate({
		where: { email: req.body.email },
		defaults: {
			username: req.body.username,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			password: req.body.password
		}
	}).spread(function(user, wasCreated) {
		if(wasCreated) {
			//Good job, you didn't try to create a duplicate
			passport.authenticate("local", {
				successRedirect: "/profile",
				successFlash: "Successfully Logged In"
			})(req, res, next);
		}
		else {
			//Bad job, you tried to sign up when you should log in
			req.flash("error", "Email already exists");
			res.redirect("/auth/login");
		}
	}).catch(function(err) {
		req.flash("error", err.message);
		res.redirect("/auth/signup");
	});
});

router.get("/logout", function(req, res) {
	req.logout();
	req.flash("Success", "Successfully Logged Out");
	res.render("/logout");
});

module.exports = router