define([
	'lib/news_special/bootstrap',
	'settings',
	'teams',
	'utils',
	'validations',
	'player_grid',
	'data/players_index',
	'data/players',
	'data/pundits',
	'vocabs/core'
], function (news, settings, teams, utils, validations, playerGrid, playersIndex, playersDetails, pundits, vocab) {

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
		addEventListeners: function () {
			var that = this;

			news.pubsub.on('position:add', function (id, gid, position, team, istats) {
				that.addPlayer(id, gid, position, team, istats);
			});

			news.pubsub.on('position:remove', function (id, gid, position, team) {
				that.removePlayer(id, gid, position, team);
			});

			news.pubsub.on('position:changeCallback', function (action, id) {
				that.changePlayerCallback(action, id);
			});

		},

		/**
		* Binds events to DOM elements.
		*
		* @exports experts/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('#player-details').find('.add-position').bind('click', function () {
				var id = news.$('#player-details').attr('data-pid'),
					gid = news.$('#player-details').attr('data-gid'),
					position = news.$('#player-details').find('option:selected').val();

				news.pubsub.emit('position:add', [id, gid, position, 'user']);
			});

			news.$('#player-details').find('.remove-position').bind('click', function () {
				var id = news.$('#player-details').attr('data-pid'),
					gid = news.$('#player-details').attr('data-gid'),
					position = news.$('#player-details').find('option:selected').val();

				news.pubsub.emit('position:remove', [id, gid, position, 'user']);
			});
		},

		/**
		* Adds player to the team.
		*
		* @exports player_crud/addPlayer
		*/
		/**
		* @param {number} id
		* @param {string} gid
		* @param {number} positionNumber
		* @param {variable} team
		* @param {string} istats
		*/
		addPlayer: function (id, gid, positionNumber, team, istats) {
			var that = this,
				$positionAvailable = news.$('.team.user').find('li[data-position-number="' + positionNumber + '"]'),
				$currentPlayer = news.$('.player[data-gid="' + gid + '"]'),
				html = '',
				positionNumberHtml = '<span class=\"position-number\">' + positionNumber + '</span>',
				img,
				name,
				position,
				positionType;

			positionType = id.substr(0, 1);

			img = playersIndex[gid]['filename'];
			name = playersDetails[gid]['name'];
			html = '<span class=\"frame\"><img alt=\"' + name + '\" title=\"' + name + '\" src=\"img/players/' + img + '.jpg\" data-pid=\"' + id + '\">' + positionNumberHtml + '</span>';
			position = utils.positionType(positionType);

			$positionAvailable.find('div').html(html);
			$positionAvailable.attr({
				'class' : position + ' player',
				'data-pid' : id,
				'data-gid' : gid,
				'data-status' : 'full'
			});

			$currentPlayer.attr('data-status', 'selected');
			$currentPlayer.addClass('selected');
			$currentPlayer.find('.frame').append(positionNumberHtml);

			teams.set(team, (positionNumber - 1), gid);

			if (istats !== false) {
				news.pubsub.emit('istats', ['player-added', 'newsspec-interation', {view: name}]);
			}
			news.pubsub.emit('position:changeCallback', ['add']);
		},

		/**
		* Removes player from the team.
		*
		* @exports player_crud/removePlayer
		*/
		/**
		* @param {number} id
		* @param {string} gid
		* @param {number} positionNumber
		* @param {variable} team
		*/
		removePlayer: function (id, gid, positionNumber, team) {
			var that = this,
				$positionAvailable = news.$('.team.user li[data-position-number="' + positionNumber + '"]'),
				$currentPlayer = news.$('.player[data-gid="' + gid + '"]'),
				html = '',
				diagonal = '',
				positionClass = '',
				position,
				positionType,
				index;

			positionType = id.substr(0, 1);

			diagonal = (positionNumber === '5' || positionNumber === '9') ? ' class=\"diagonal\"' : '';

			if (positionNumber === '5') {
				positionClass = 'defender midfielder';
			} else if (positionNumber === '9') {
				positionClass = 'midfielder forward';
			} else {
				positionClass = utils.positionType(positionType);
			}

			html = '<span' + diagonal + '></span><img src=\"img/transparent.png\"><strong>' + positionNumber + '</strong>';

			$positionAvailable.find('div').html(html);
			$positionAvailable.attr({
				'class' : positionClass + ' player',
				'data-pid' : '',
				'data-gid' : '',
				'data-status' : 'empty'
			});

			$currentPlayer.removeClass('selected');
			$currentPlayer.find('.frame .position-number').remove();

			position = $currentPlayer.attr('data-position');
			teams.set(team, (positionNumber - 1), '');

			news.pubsub.emit('position:changeCallback', ['remove', id]);
		},

		/**
		* Callback action after adding or removing a player to/from the team.
		*
		* @exports player_crud/changePlayerCallback
		*/
		changePlayerCallback: function (action, id) {
			var that = this,
				selectOptions,
				$playerDetails = news.$('#player-details'),
				$positionAvailable,
				position,
				len;

			if (action === 'add') {
				$playerDetails.find('.position-options').attr('disabled', 'disabled');
				$playerDetails.find('.fancy-select').removeClass('disabled');
				$playerDetails.find('.add-position').hide();
				$playerDetails.find('.remove-position').show();
			} else {
				position = id.substr(0, 1);
				$positionAvailable = utils.positionAvailable(position);

				selectOptions = playerGrid.createPositionSelectOptions($positionAvailable);

				$playerDetails.find('.position').html(selectOptions);
				$playerDetails.find('.position-options').removeAttr('disabled');
				$playerDetails.find('.fancy-select').removeClass('disabled');
				$playerDetails.find('.add-position').show();
				$playerDetails.find('.remove-position').hide();
				news.$('.confirm-team').hide();
			}
			news.pubsub.emit('player-info-window:close');

			len = teams.get('user').join().replace(/,/ig, '').length;

			if (validations.checkNumberOfPlayers(len)) {
				news.$('.confirm-team').show();
				news.$('#sections-wrapper').addClass('confirm');
				console.log(teams.get('user').join());
			}
		}
    };

});
