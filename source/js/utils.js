define([
	'lib/news_special/bootstrap',
	'lib/news_special/share_tools/controller',
	'settings'
], function (news, shareTools, settings) {

    return {
		/**
		* Brings position available in the team.
		*
		* @exports utils/positionAvailable
		*/
		/**
		* @param {string} positionType
		* @return {array}
		*/
		positionAvailable: function (positionType) {
			var that = this,
				position,
				slot;

			position = that.positionType(positionType);

			slot = news.$('[data-position*="' + position + '"]').filter('[data-status="empty"]');

			if (slot.length > 0) {
				return slot;
			} else {
				return [];
			}
		},

		/**
		* Brings position name according to given code.
		*
		* @exports utils/positionType
		*/
		/**
		* @param {string} positionType
		* @return {string}
		*/
		positionType: function (positionType) {
			var that = this,
				position;

			switch (positionType) {
			case 'g':
				position = 'goalkeeper';
				break;
			case 'd':
				position = 'defender';
				break;
			case 'm':
				position = 'midfielder';
				break;
			case 'f':
				position = 'forward';
				break;
			}

			return position;
		},

		/**
		* Given an id returns jQuery reference to a player in the grid.
		*
		* @exports utils/currentlySelectedPlayer
		*/
		/**
		* @param {number} id
		* @return {jQueryObject}
		*/
		currentlySelectedPlayer: function (id) {
			var that = this,
				$playerSelected;

			$playerSelected = news.$('.team.user li[data-pid="' + id + '"]');

			return $playerSelected;
		},

		/**
		* Scrolls to the top of the page.
		*
		* @exports utils/scroll2Top
		*/
		scroll2Top: function () {
			var that = this;

			try {
				news.$(window.parent, window.parent.document).scrollTop(0);
			} catch (e) {
				news.$(window).scrollTop(0);
			}
		},

		/**
		* Scrolls to the top of the iframe.
		*
		* @exports utils/scroll2Iframe
		*/
		scroll2Iframe: function () {
			var that = this,
			iframeOffset = settings.get('iframeOffset').top;

			try {
				news.$(window.parent, window.parent.document).scrollTop(iframeOffset);
			} catch (e) {
				news.$(window).scrollTop(iframeOffset);
			}
		},

		/**
		* Makes number bold.
		*
		* @exports utils/boldNumbers
		*/
		/**
		* @param {number} positionType
		* @return {array}
		*/
		boldNumbers: function (number) {
			var arr = [];

			arr = number.split(', ');
			for (var i = 0;i < arr.length;i++) {
				arr[i] = arr[i].replace(/(^|\s)([0-9]*)(\s|$)/gi, '$1<b>$2</b>$3');
			}
			arr = arr.join(', ');

			return arr;
		},

		/**
		* Converts numbers from latin to farsi.
		*
		* @exports utils/numberStringToFarsi
		*/
		/**
		* @param {string} str
		* @return {array}
		*/
		numberStringToFarsi : function (str) {
			var farsiString = '',
				num = str.toString().replace(/\,/g, ''),
				farsiNumberArray = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

			for (;num / 10 > 0;) {
				n = num % 10;
				num = parseInt(num / 10, 10);
				farsiString = farsiNumberArray[n] + farsiString;
			}

			return farsiString || farsiNumberArray[0];
		}

    };

});
