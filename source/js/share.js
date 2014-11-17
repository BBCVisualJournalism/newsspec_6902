define([
	'lib/news_special/bootstrap',
	'lib/news_special/share_tools/controller',
	'settings',
	'teams',
	'vocabs/core'
], function (news, shareTools, settings, teams, vocab) {

    return {
        init: function (storyPageUrl) {
			var that = this;

			that.addEventListeners();
			that.binds();

            shareTools.init('.main', {
                url:     storyPageUrl,
                header:  'Share this page',
                message: 'Custom message',
                hashtag: 'BBCNewsGraphics'
            });
        },

		/**
		* Adds event addEventListeners.
		*
		* @exports share/addEventListeners
		*/
		addEventListeners: function (id) {
			var that = this;

			news.pubsub.on('share-button:click', function () {
				that.openShareDropdown();
			});

			news.pubsub.on('share-close-button:click', function () {
				that.closeShareDropdown();
			});
		},

		/**
		* Binds events to DOM elements.
		*
		* @exports share/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('.topShareBtnHolder').bind('click', function () {
				news.pubsub.emit('share-button:click');
			});

			news.$('.shareOverlayCloseBtn').bind('click', function () {
				news.pubsub.emit('share-close-button:click');
			});

			news.$('#facebookShareBtn').bind('click', function (e) {
				that.handleFacebookBtnClick(e);
			});

			news.$('#twitterShareBtn').bind('click', function (e) {
				that.handleTwitterBtnClick(e);
			});

			news.$('#emailShareBtn').bind('click', function (e) {
				that.handleEmailBtnClick(e);
			});

			news.$('.url').bind('click', function () {
				this.select();
			});
		},

		/**
		* Opens share overlay.
		*
		* @exports share/openShareDropdown
		*/
		openShareDropdown: function () {
			var that = this;

			news.$('.shareOverlay').toggle();
		},

		/**
		* Closes panel.
		*
		* @exports share/closeShareDropdown
		*/
		closeShareDropdown: function () {
			var that = this;

			news.$('.shareOverlay').hide();
		},

		/**
		* Manages FB option click.
		*
		* @exports share/handleFacebookBtnClick
		*/
        handleFacebookBtnClick: function (e) {
            e.preventDefault();
			var that = this;

            var hash = '%23' + teams.get('user').join().replace(/,/ig, ''),
				fbShareStr = vocab['facebook_text'],
				img = 'http://newsimg.bbc.co.uk/news/special/2014/newsspec_6902/content/english/img/fb.jpg';

            news.pubsub.emit('ns:share:setFacebookMessage', [{message: fbShareStr, image: img, pageUrl: vocab['article_url'] + hash}]);
            news.pubsub.emit('ns:share:call:facebook');
        },

		/**
		* Manages Twitter option click.
		*
		* @exports share/handleTwitterBtnClick
		*/
        handleTwitterBtnClick: function (e) {
            e.preventDefault();
			var that = this;

            var hash = '#' + teams.get('user').join().replace(/,/ig, ''),
				twitterShareStr = vocab['twitter_text_intro'] + ' ' + vocab['article_url'] + hash + ' ' + vocab['twitter_text_end'];

            news.pubsub.emit('ns:share:setTwitterMessage', [twitterShareStr]);
            news.pubsub.emit('ns:share:call:twitter');
        },

		/**
		* Manages e-mail option click.
		*
		* @exports share/handleEmailBtnClick
		*/
        handleEmailBtnClick: function (e) {
            e.preventDefault();
			var that = this;

			var hash = '#' + teams.get('user').join().replace(/,/ig, ''),
				emailSubjectStr = vocab['email_subject'],
				emailMessageStr = vocab['email_message'] + '\n' + vocab['article_url'] + hash;

            news.pubsub.emit('ns:share:setEmailMessage', [{subject: emailSubjectStr, message: emailMessageStr}]);
            news.pubsub.emit('ns:share:call:email');
        }

    };

});
