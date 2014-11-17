define([
	'lib/news_special/bootstrap',
	'settings',
	'utils',
	'player_grid',
	'data/players_index',
	'data/players',
	'vocabs/core'
], function (news, settings, utils, playerGrid, playersIndex, playersDetails, vocab) {

    return {
        init: function () {
			var that = this;
        },

		/**
		* Eliminates duplicates from array (anticheat).
		*
		* @exports validations/numberStringToFarsi
		*/
		/**
		* @param {array} arr
		* @return {array}
		*/
		eliminateDuplicates: function (arr) {
			var i,
				len = arr.length,
				out = [],
				obj = {};

			for (i = 0; i < len; i++) {
				obj[arr[i]] = 0;
			}

			for (i in obj) {
				out.push(i);
			}

			return out;
		},

		/**
		* Validates that the number of players in team is 11.
		*
		* @exports validations/checkNumberOfPlayers
		*/
		/**
		* @param {number} arr
		* @return {boolean}
		*/
		checkNumberOfPlayers: function (num) {
			if (num === 33) {
				return true;
			}
		},

		/**
		* Validates correct position of players in the pitch.
		*
		* @exports validations/checkPositionsInTheTeam
		*/
		/**
		* @param {array} ids
		* @return {boolean}
		*/
		checkPositionsInTheTeam: function (ids) {
			var that = this,
				flag;

			for (var i = 0;i < ids.length;i++) {
				// check goalkeeper
				if (i === 0 && playersIndex[ids[i]].position !== 'Goalkeeper') {
					//console.log(playersIndex[ids[i]].name + ' is not a goalkeeper');
					return false;
				}

				// check defender
				if ((i > 0 && i <= 3) && playersIndex[ids[i]].position !== 'Defender') {
					//console.log(playersIndex[ids[i]].name + ' is not a defender');
					return false;
				}

				// check midfielder
				if ((i > 4 && i <= 7) && playersIndex[ids[i]].position !== 'Midfielder') {
					//console.log(playersIndex[ids[i]].name + ' is not a midfielder');
					return false;
				}

				// check forward
				if ((i > 8 && i <= 10) && playersIndex[ids[i]].position !== 'Forward') {
					//console.log(playersIndex[ids[i]].name + ' is not a forward');
					return false;
				}

				// check mixed positions
				if (i === 4 && (playersIndex[ids[i]].position !== 'Defender' || playersIndex[ids[i]].position !== 'Midfielder')) {
					//console.log(playersIndex[ids[i]].name + ' is not a defender or midfielder');
					return false;
				}
				if (i === 8 && (playersIndex[ids[i]].position !== 'Midfielder' || playersIndex[ids[i]].position !== 'Forward')) {
					//console.log(playersIndex[ids[i]].name + ' is not a midfielder or forward');
					return false;
				}

				return true;
			}
		},

		/**
		* Tests the viewport size.
		*
		* @exports validations/checkPositionsInTheTeam
		*/
		isViewportWideEnough: function () {
			var that = this;

			if (news.$(window).outerWidth() > 600) {
				settings.set('limitedViewport', false);
			} else {
				settings.set('limitedViewport', true);
			}
		}
    };
});
