define([
	'lib/news_special/bootstrap',
	'settings',
	'teams',
	'utils',
	'validations',
	'data/players_index',
	'data/players',
	'vocabs/core'
], function (news, settings, teams, utils, validations, playersIndex, playersDetails, vocab) {

    return {
        init: function (storyPageUrl) {
			var that = this;

			that.addEventListeners();
			that.binds();
        },

		/**
		* Adds event listeners.
		*
		* @exports team_crud/addEventListeners
		*/
		addEventListeners: function (id) {
			var that = this;

			news.pubsub.on('team:confirm', function () {
				that.confirmTeam();
			});

			news.pubsub.on('team:edit', function () {
				that.editTeam();
			});

			news.pubsub.on('team:create', function (ids) {
				that.createTeam(ids);
			});
		},

		/**
		* Binds events to DOM elements.
		*
		* @exports team_crud/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('.confirm-team').bind('click', function () {
				news.pubsub.emit('team:confirm');
				news.pubsub.emit('datavis:update', [teams.get('user')]);
			});

			news.$('.edit-team').bind('click', function () {
				news.pubsub.emit('team:edit');
				news.pubsub.emit('share-close-button:click');
			});

			news.$('.options').find('.user').bind('click', function () {
				var len = teams.get('user').join().replace(/,/ig, '').length;

				news.pubsub.emit('team:edit');
			});
		},

		/**
		* Creates team from scratch.
		*
		* @exports team_crud/createTeam
		*/
		/**
		* @param {number} ids
		*/
		createTeam: function (ids) {
			var that = this;

			for (var i = 0;i < ids.length;i++) {
				var position = playersIndex[ids[i]].position.toLowerCase(),
					pid = position.substr(0, 1) + (i + 1);

				news.pubsub.emit('position:add', [pid, ids[i], (i + 1), 'user', false]);
			}
			settings.set('dock', false);
			news.pubsub.emit('datavis:update', [ids]);

			news.$('.create-your-team, .teamVis').show();
			news.$('.confirm-team, .team-references, #sections-wrapper').hide();
			news.$('.team.user').addClass('formation');
			news.$('.teamVis').addClass('shared');

			news.$('ul.team').find('img').hide();
			news.$('ul.team').find('img').fadeIn();
		},

		/**
		* Confirms team and changes state.
		*
		* @exports team_crud/confirmTeam
		*/
		confirmTeam: function () {
			var that = this,
				$team = news.$('.team.user'),
				hash = '#' + teams.get('user').join().replace(/,/ig, ''),
				url = vocab['article_url'] + hash;

			news.$('.team-references').hide();
			news.$('.edit-team').show();
			news.$('.buttons-wrapper').find('input').val(url);
			news.$('.buttons-wrapper').find('h2, input').show();
			news.$('.confirm-team').hide();
			news.$('#sections-wrapper').hide();
			$team.addClass('formation');
			utils.scroll2Iframe();
			news.$('.teamVis').show();

			if (settings.get('limitedViewport')) {
				news.pubsub.emit('formation:wrap', [$team]);
				settings.set('wrappedFormation', true);
			}

			news.$('.topShareBtnHolder').show();

			if (teams.get('friend').length !== 0) {
				news.pubsub.emit('datavis:showFriendsChoices', [teams.get('friend'), vocab['your_friend']]);
			}

			settings.set('dock', false);
			news.pubsub.emit('istats', ['team-confirmed', 'newsspec-interation']);
		},

		/**
		* Brings the edit team view.
		*
		* @exports team_crud/editTeam
		*/
		editTeam: function () {
			var that = this,
				$team = news.$('.team.user'),
				len;

			news.$('.options').find('.user').addClass('active');
			news.$('.options').find('.experts').removeClass('active');

			news.$('.buttons-wrapper').find('h2, input').hide();
			news.$('.team-references').show();
			news.$('.edit-team').hide();
			news.$('#sections-wrapper').show();
			news.$('#experts-wrapper').hide();
			news.$('.teamVis').hide();
			news.$('.teamVis').removeClass('shared');

			len = teams.get('user').join().replace(/,/ig, '').length;
			if (validations.checkNumberOfPlayers(len)) {
				news.$('.confirm-team').show();
				news.$('#sections-wrapper').addClass('confirm');
			} else {
				news.$('#sections-wrapper').removeClass('confirm');
			}

			if (settings.get('wrappedFormation')) {
				news.pubsub.emit('formation:unwrap', [$team]);
				settings.set('wrappedFormation', false);
			}

			$team.show();
			$team.removeClass('formation');
			news.$('.topShareBtnHolder').hide();

			settings.set('dock', true);

			news.pubsub.emit('istats', ['edit-team-clicked', 'newsspec-interation']);
		}
    };
});
