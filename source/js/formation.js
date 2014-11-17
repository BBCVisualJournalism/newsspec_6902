define([
	'lib/news_special/bootstrap'
], function (news) {

    return {
        init: function () {
			var that = this;

			that.addEventListeners();
        },

		/**
		* Adds event listeners.
		*
		* @exports formation/addEventListeners
		*/
		addEventListeners: function (id) {
			var that = this;

			news.pubsub.on('formation:wrap', function (team) {
				that.wrapFormation(team);
			});

			news.pubsub.on('formation:unwrap', function (team) {
				that.unwrapFormation(team);
			});
		},

		/**
		* Wraps team in HTML tags for reduced viewport.
		*
		* @exports formation/wrapFormation
		*/
		/**
		* @param {jQueryObject} $team
		* @return {jQueryObject}
		*/
		wrapFormation: function ($team) {
			var that = this;

			$team.find('.defender').wrapAll('<li><ul class=\"group\"></ul></li>');
			$team.find('.midfielder').wrapAll('<li><ul class=\"group\"></ul></li>');
			$team.find('.forward').wrapAll('<li><ul class=\"group\"></ul></li>');

			$team.addClass('wrapped');
		},

		/**
		* Unwraps team from HTML tags for expanded viewport.
		*
		* @exports formation/wrapFormation
		*/
		/**
		* @param {jQueryObject} $team
		* @return {jQueryObject}
		*/
		unwrapFormation: function ($team) {
			var that = this;

			$team.find('.defender').unwrap().unwrap();
			$team.find('.midfielder').unwrap().unwrap();
			$team.find('.forward').unwrap().unwrap();

			$team.removeClass('wrapped');
		}
    };
});
