define([
	'lib/news_special/bootstrap',
	'lib/news_special/share_tools/controller',
	'settings',
	'utils',
	'data/players_index',
	'data/players',
	'data/pundits',
	'vocabs/core'
], function (news, shareTools, settings, utils, playersIndex, playersDetails, pundits, vocab) {

    return {
        init: function () {
			var that = this;

			that.addEventListeners();
			that.binds();
        },

		/**
		* Adds event listeners.
		*
		* @exports formation/addEventListeners
		*/
		addEventListeners: function (id) {
			var that = this;

			news.pubsub.on('position:click', function (position, elem) {
				var group = elem.attr('class'),
					id = elem.find('img').attr('data-pid');

				news.$('.team.user').attr('data-default-position', position);

				news.pubsub.emit('section:open', [group, id]);
			});

			news.pubsub.on('player:click', function (position) {
				that.getPlayerInfo(position);
			});

			news.pubsub.on('section:open', function (position, id) {
				that.openSection(position, id);
			});

			news.pubsub.on('player-info-window:close', function (position) {
				that.closePlayerInfoWindow();
			});

		},

		/**
		* Binds events to DOM elements.
		*
		* @exports experts/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('#player-details').find('.close').bind('click', function () {
				news.pubsub.emit('player-info-window:close');
			});

		},

		/**
		* Goes to section of the grid and shows players on it.
		*
		* @exports player_crud/addPlayer
		*/
		/**
		* @param {number} position
		* @param {number} id
		*/
		openSection: function (position, id) {
			var that = this,
				justPosition,
				topPositionOffset,
				iframeTopOffset,
				dockedMenuHeight,
				total;

			justPosition = position.split(' ');
			positionTopOffset = $('.position.' + justPosition[0]).offset().top;
			iframeTopOffset = news.$(window.parent.document).find('.responsive-iframe').offset().top;
			dockedMenuHeight = news.$('.top-menu').outerHeight();
			total = iframeTopOffset + positionTopOffset - dockedMenuHeight;

			news.$(window.parent, window.parent.document).scrollTop(total);

			news.$(window.parent, window.parent.document).animate({top: total}, 800, function () {
				//news.$('.position').removeClass('open').find('group');
				//news.$('.position.' + justPosition).addClass('open');
			});
			if (id !== undefined) {
				news.pubsub.emit('player:click', [id]);
			}
		},

		/**
		* Show data from a player.
		*
		* @exports player_grid/getPlayerInfo
		*/
		/**
		* @param {number} id
		*/
		getPlayerInfo: function (id) {
			var that = this,
				$playerDetails = news.$('#player-details'),
				$positionAvailable,
				$currentlySelectedPlayer,
				digit,
				positionsArray = [],
				selectOptions,
				gid,
				height;

			digit = parseInt(id.replace(/[gdmf]/gi, ''), 10);

			if (settings.get('limitedViewport')) {
				digit = (Math.ceil((digit / 5)) * 10) / 2;
				digit = digit - 1;
			} else {
				digit = Math.ceil((digit / 10)) * 10;
				digit = digit - 1;
			}

			gid = news.$('.player[data-pid="' + id + '"]').attr('data-gid');

			news.$('.position').removeClass('open');
			news.$('.player').removeClass('highlighted');

			news.$('.player[data-pid="' + id + '"]').closest('.group').find('.player').eq(digit).after($playerDetails);

			if (settings.get('infopanel') === 'open') {
				$playerDetails.animate({
					height: 'hide'
				}, 300, function () {
					that.createInfoPanel(id, gid, digit);
					settings.set('infopanel', 'close');

					$playerDetails.animate({
						height: 'show'
					}, 300, function () {
						news.$('.player[data-pid="' + id + '"]').closest('.position').addClass('open');
						news.$('.player[data-pid="' + id + '"]').addClass('highlighted');
						settings.set('infopanel', 'open');
					});

				});
			} else {
				news.$('.player[data-pid="' + id + '"]').closest('.position').addClass('open');
				news.$('.player[data-pid="' + id + '"]').addClass('highlighted');
				that.createInfoPanel(id, gid, digit);
				$playerDetails.animate({
					height: 'show'
				}, 300, function () {
					settings.set('infopanel', 'open');
				});
			}
		},

		/**
		* Creates panel with data from a player.
		*
		* @exports player_grid/createInfoPanel
		*/
		/**
		* @param {number} id
		*/
		createInfoPanel: function (id, gid, digit) {
			var that = this,
				$playerDetails = news.$('#player-details'),
				currentlySelectedPlayer,
				selectOptions,
				name,
				description,
				country,
				tournaments,
				stats,
				position;

			position = id.substr(0, 1);

			$currentlySelectedPlayer = utils.currentlySelectedPlayer(id);
			$positionAvailable = utils.positionAvailable(position);

			name = playersDetails[gid]['name'];
			country = playersDetails[gid]['country'];
			description = playersDetails[gid]['description'];
			tournaments = playersDetails[gid]['tournaments'];
			tournaments = utils.boldNumbers(tournaments);

			$currentlySelectedPlayer = utils.currentlySelectedPlayer(id);
			stats = that.createStatsTable(playersDetails[gid]['stats'], $playerDetails.find('table.stats'));

			$playerDetails.attr('data-pid', id);
			$playerDetails.attr('data-gid', gid);
			$playerDetails.find('.player-name').html(name);
			$playerDetails.find('.player-country').html(country);
			$playerDetails.find('.player-description').html(tournaments + '<br /><br />' + description);
			$playerDetails.find('.column.numbers').html(stats);

			if ($currentlySelectedPlayer.length === 0) {
				selectOptions = that.createPositionSelectOptions($positionAvailable);
				if ($positionAvailable.length > 0) {
					$playerDetails.find('.position-options').html(selectOptions);
					$playerDetails.find('.fancy-select').show();
					news.$('#player-details').find('.position-options').removeAttr('disabled');
					news.$('#player-details').find('.add-position').show();
					news.$('#player-details').find('.remove-position').hide();
				} else {
					$playerDetails.find('.fancy-select').hide();
					news.$('#player-details').find('.remove-position, .add-position').hide();
				}
			} else {
				selectOptions = that.createPositionSelectOptions($currentlySelectedPlayer);
				$playerDetails.find('.position-options').html(selectOptions);
				$playerDetails.find('.fancy-select').show();
				news.$('#player-details').find('.position-options').attr('disabled', 'disabled');
				news.$('#player-details').find('.add-position').hide();
				news.$('#player-details').find('.remove-position').show();
			}

			news.pubsub.emit('istats', ['player-clicked', 'newsspec-interation', {view: name}]);
		},

		/**
		* Creates table with stats from a player.
		*
		* @exports player_grid/createStatsTable
		*/
		/**
		* @param {string} stats
		* @param {jQueryObject} container
		*/
		createStatsTable: function (stats, container) {
			var that = this,
				cards,
				medals,
				appearances,
				goals;

			cards = stats['yellowcards'];
			if (stats['redcards'] !== '0') { cards += ' (' + stats['redcards'] + ')'; }
			medals = stats['medals'];
			appearances = stats['appearances'];
			goals = stats['goals'];

			if (vocab['language'] === 'persian') {
				cards = utils.numberStringToFarsi(cards);
				if (stats['redcards'] !== '0') { cards += ' (' + utils.numberStringToFarsi(stats['redcards']) + ')'; }
				medals = utils.numberStringToFarsi(medals);
				appearances = utils.numberStringToFarsi(appearances);
				goals = utils.numberStringToFarsi(goals);
			}

			container.find('.cards').siblings('.figure').html(cards);
			container.find('.medals').siblings('.figure').html(medals);
			container.find('.appearances').siblings('.figure').html(appearances);
			container.find('.goals').siblings('.figure').html(goals);
		},

		/**
		* Creates select element with current free slots in the team.
		*
		* @exports player_grid/createPositionSelectOptions
		*/
		/**
		* @param {string} positions
		*/
		createPositionSelectOptions: function (positions) {
			var that = this,
				select = '',
				position,
				number,
				defaultPosition,
				selected = '';

			if (positions.length > 0) {
				positions.each(function () {
					selected = '';
					position = vocab[$(this).attr('data-position')];
					number = $(this).attr('data-position-number');
					defaultPosition = news.$('.team.user').attr('data-default-position');

					if (defaultPosition === number) {
						selected = ' selected=\"selected\"';
					}
					select += '<option value=\"' + number + '\"' + selected + '>' + vocab['position_label'] + ' ' + number + ' (' + position + ')</option>';
				});
			}

			return select;
		},

		/**
		* Closes panel.
		*
		* @exports player_grid/closePlayerInfoWindow
		*/
		closePlayerInfoWindow: function () {
			var that = this,
				$playerDetails = news.$('#player-details');

			$playerDetails.animate({
				height: 'hide'
			}, 300, function () {
				news.$('.main').removeClass('open-modal');
				news.$('.player').removeClass('highlighted');
				news.$('.position').removeClass('open');
				settings.set('infopanel', 'close');
			});
		}
    };

});
