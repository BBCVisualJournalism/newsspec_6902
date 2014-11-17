define([
	'lib/news_special/bootstrap',
	'settings',
	'teams',
	'utils',
	'validations',
	'player_grid',
	'team_crud',
	'player_crud',
	'team_vis',
	'share',
	'experts',
	'formation',
	'data/players_index',
	'data/players',
	'data/pundits',
	'vocabs/core'
], function (news, settings, teams, utils, validations, playerGrid, teamCrud, playerCrud, teamVis, share, experts, formation, playersIndex, playersDetails, pundits, vocab) {

    return {
        init: function (storyPageUrl) {
			utils.scroll2Top();
			this.populatePlayers();
			this.addEventListeners();
			this.binds();
			this.initDockedMenu();

			// initialise dependencies
			var dependencies = [playerGrid, teamCrud, playerCrud, teamVis, share, experts, formation];

			for (var i = 0;i < dependencies.length;i++) {
				dependencies[i].init();
			}

			this.getTeamIdFromHash();
			news.$('ul.team').css('visibility', 'visible');
        },

		/**
		* Setup listeners.
		*
		* @exports app/addEventListeners
		*/
		addEventListeners: function () {
			var that = this;

			news.pubsub.on('position:click', function (position, elem) {
				var group = elem.attr('class'),
					id = elem.find('img').attr('data-pid');

				news.$('.team.user').attr('data-default-position', position);

				news.pubsub.emit('section:open', [group, id]);
			});

			news.pubsub.on('view:reset', function () {
				that.resetView();
			});

			news.$(window).delayedResize(function () {
				var cachedLength = teams.get('user').join().replace(/,/ig, '').length;

				that.initDockedMenu();
				that.positionDockedMenu();
				validations.isViewportWideEnough();

				if (validations.checkNumberOfPlayers(cachedLength)) {
					if (settings.get('limitedViewport') && !settings.get('wrappedFormation')) {
						news.pubsub.emit('formation:wrap', [news.$('.user.formation.team')]);
						settings.set('wrappedFormation', true);
					}

					if (!settings.get('limitedViewport') && settings.get('wrappedFormation')) {
						news.pubsub.emit('formation:unwrap', [news.$('.user.formation.team')]);
						settings.set('wrappedFormation', false);
					}
				}

				if (settings.get('limitedViewport') && !settings.get('wrappedFormationExperts')) {
					news.$('#experts-wrapper').find('.expert-group').each(function () {
						news.pubsub.emit('formation:wrap', [news.$(this).find('ul.expert')]);
					});
					settings.set('wrappedFormationExperts', true);
				}

				if (!settings.get('limitedViewport') && settings.get('wrappedFormationExperts')) {
					news.$('#experts-wrapper').find('.expert-group').each(function () {
						news.pubsub.emit('formation:unwrap', [news.$(this).find('ul.expert')]);
					});
					settings.set('wrappedFormationExperts', false);
				}
			});

		},

		/**
		* Binds events to DOM elements.
		*
		* @exports app/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('.team-references').find('li').bind('click', function () {
				var group = news.$(this).attr('class');

				news.pubsub.emit('section:open', [group]);
			});

			news.$('.team.user').find('li').bind('click', function () {
				var positionNumber = news.$(this).attr('data-position-number');

				news.pubsub.emit('position:click', [positionNumber, news.$(this)]);
			});

			news.$('#sections-wrapper .position').find('.player').bind('click', function () {
				var positionNumber = news.$(this).attr('data-pid');

				if (!news.$(this).hasClass('highlighted')) {
					news.pubsub.emit('player:click', [positionNumber]);
				}
				if (settings.get('infopanel') === 'open') {
					news.pubsub.emit('player-info-window:close', [id]);
					settings.set('infopanel', 'open');
				}
			});

			news.$('#player-details').find('.close').bind('click', function () {
				news.pubsub.emit('player-info-window:close');
			});

			news.$('.create-your-team').bind('click', function () {
				that.resetView();
			});
		},

		/**
		* Initialises docked Menu.
		*
		* @exports app/initDockedMenu
		*/
		initDockedMenu: function () {
			var that = this;

			try {
				settings.set('iframeOffset', news.$(window.parent.document).find('.responsive-iframe').offset());
			} catch (e) {
				settings.set('iframeOffset', { 'top' : 0 });
			}

			news.$(window.parent, window.parent.document).scroll(function () {
				that.positionDockedMenu();
			});
		},

		/**
		* Positions docked Menu.
		*
		* @exports app/positionDockedMenu
		*/
		positionDockedMenu: function () {
			var that = this,
				$scrollTop = news.$(window.parent, window.parent.document).scrollTop();

			if (settings.get('dock')) {
				news.$('.top-menu').css('margin-top', that.setScrollPos($scrollTop) + 'px');
			} else {
				news.$('.top-menu').css('margin-top', '');
			}
		},

		/**
		* Sets scroll position according to position of the scrollbar.
		*
		* @exports app/setScrollPos
		*/
		/**
		* @param {number} myScrollTop
		* @return {number}
		*/
		setScrollPos: function (myScrollTop) {
			var that = this;

			var containerHeight = news.$('.main').outerHeight(),
				floatingEltHeight = news.$('.top-menu').outerHeight(),
				scrollBreakPoint = (containerHeight + settings.get('iframeOffset').top) - floatingEltHeight,
				maxScrollPos = containerHeight - floatingEltHeight,
				optimumScrollPos = myScrollTop,
				totalOffset = 0;

			optimumScrollPos = myScrollTop > settings.get('iframeOffset').top ? myScrollTop - settings.get('iframeOffset').top : 0;

			return myScrollTop >= scrollBreakPoint ? maxScrollPos : optimumScrollPos;
		},

		/**
		* Creates the grid and populates the players.
		*
		* @exports app/populatePlayers
		*/
		populatePlayers: function () {
			var that = this,
				team = [],
				$rows = {
					'goalkeeper' : news.$('.position.goalkeeper').find('.player'),
					'defender' : news.$('.position.defender').find('.player'),
					'midfielder' : news.$('.position.midfielder').find('.player'),
					'forward' : news.$('.position.forward').find('.player')
				};

			for (var key in playersIndex) {
				if (playersIndex.hasOwnProperty(key)) {
					team.push(key);
				}
			}
			team.sort();

			for (var i = 0; i < team.length; i++) {
				var position = playersIndex[team[i]]['position'].toLowerCase(),
					name = playersDetails[team[i]]['name'],
					img = playersIndex[team[i]]['filename'];

				$rows[position].filter('[data-status="empty"]').first().html('<span class=\"frame\"><img src=\"img/players/' + img + '.jpg\" alt=\"' + name + '\" title=\"' + name + '\"></span>').attr('data-status', 'full').attr('data-gid', team[i]);
			}

			news.$('#sections-wrapper').show();

		},

		/**
		* Gets ids from hash of the page and creates team object.
		*
		* @exports app/getTeamIdFromHash
		*/
        getTeamIdFromHash: function () {
            var that = this,
				hash,
				teamFromHash,
				cachedLength,
				userTeam = [],
				userTeamWithoutDuplicates = [];

            hash = window.location.hash;

			if (hash) {
				hash = hash.replace(/#/ig, '');

				teamFromHash = hash.split('');
				cachedLength = teamFromHash.length;

				for (var i = 0;i < cachedLength;i++) {
					var check = teamFromHash[i].split('');

					if (isNaN(check)) { throw new Error('Non numeric ID'); }
				}

				for (var j = 0;j <= 10;j++) {
					var start = j * 3,
						playerId;

					playerId = hash.substr(start, 3);
					userTeam.push(playerId);
				}
				userTeamWithoutDuplicates = validations.eliminateDuplicates(userTeam);

				if (!validations.checkNumberOfPlayers(userTeamWithoutDuplicates.join().replace(/,/ig, '').length)) { throw new Error('Wrong number of players'); }

				if (!validations.checkPositionsInTheTeam(userTeam)) { throw new Error('Wrong formation'); }

				news.pubsub.emit('team:create', [userTeam]);
				teams.set('friend', '', userTeam);
			}
        },

		/**
		* Resets view.
		*
		* @function
		* @exports app/resetView
		*/
		resetView: function () {
			var that = this;

			for (var i = 0;i < teams.get('user').length;i++) {
				var position = playersIndex[teams.get('user')[i]].position.toLowerCase(),
					pid = position.substr(0, 1) + (i + 1);

				news.pubsub.emit('position:remove', [pid, teams.get('user')[i], (i + 1), 'user']);
			}

			news.$('.create-your-team').hide();
			news.$('.team-references').attr('style', '');
			news.$('#sections-wrapper').show();
			if (settings.get('limitedViewport') && settings.get('wrappedFormation')) {
				news.pubsub.emit('formation:unwrap', [news.$('.user.formation.team')]);
				settings.set('wrappedFormation', false);
			}
			news.$('.team.user').removeClass('formation');
			news.$('.teamVis').hide();
			news.$('.teamVis').removeClass('shared');
			news.$('#sections-wrapper').removeClass('confirm');
			settings.set('dock', true);

			teams.set('user', '', []);
		}
    };
});
