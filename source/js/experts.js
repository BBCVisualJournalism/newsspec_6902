define([
	'lib/news_special/bootstrap',
	'settings',
	'utils',
	'team_vis',
	'formation',
	'data/players_index',
	'data/players',
	'data/pundits',
	'vocabs/core'
], function (news, settings, utils, teamVis, formation, playersIndex, playersDetails, pundits, vocab) {

    return {
        init: function () {
			var that = this;

			that.addEventListeners();
			that.binds();
			that.lookForExperts();
        },

		/**
		* Setup listeners.
		*
		* @exports experts/addEventListeners
		*/
		addEventListeners: function (id) {
			var that = this;

			news.pubsub.on('experts-tab:click', function () {
				that.createExpertsView();
			});

		},

		/**
		* Binds events to DOM elements.
		*
		* @exports experts/binds
		*/
		binds: function (id) {
			var that = this;

			news.$('.experts').bind('click', function () {
				news.pubsub.emit('experts-tab:click');
			});

		},

		/**
		* Manages the expert view.
		* Hide/shows elements, deals with limited viewport view, activates more description handling.
		* Takes data from JSON file.
		*
		* @exports experts/createExpertsView
		*/
		createExpertsView: function () {
			var that = this,
				stats = '',
				markup = '';

			news.$('.options').find('.user').removeClass('active');
			news.$('.options').find('.experts').addClass('active');
			news.$('#sections-wrapper, .team-references, .team.user, .confirm-team, .edit-team, .teamVis, .topShareBtnHolder, .shareOverlay, .create-your-team').hide();
			news.$('.buttons-wrapper').find('h2, input').hide();

			for (var key in pundits) {
				if (pundits.hasOwnProperty(key)) {
					var title = pundits[key]['position'],
						name = pundits[key]['name'],
						img = pundits[key]['filename'],
						teamDescriptionIntro = pundits[key]['team']['description_intro'],
						teamDescription = pundits[key]['team']['description'],
						teamIds = pundits[key]['team']['ids'].split(','),
						cleansheets = teamVis.getCleanSheetsNum(teamIds),
						winnersMedals = teamVis.getWinnersMedalsNum(teamIds),
						finalAppearences = teamVis.getFinalAppearencesNum(teamIds),
						goals = teamVis.getGoalsTotalNum(teamIds);

					if (vocab['language'] === 'persian') {
						cleansheets = utils.numberStringToFarsi(cleansheets);
						winnersMedals = utils.numberStringToFarsi(winnersMedals);
						finalAppearences = utils.numberStringToFarsi(finalAppearences);
						goals = utils.numberStringToFarsi(goals);
					}

					stats = '<div class="wrapper"><h3>' + vocab['team_stats'] + '</h3><table class=\"stats\"><tr><td class=\"icon cleansheets\"><span></span></td><td class=\"heading\">' + vocab['team_clean_sheets'] + '</td><td class=\"figure\">' + cleansheets + '</td></tr><tr><td class=\"icon medals\"><span></span></td><td class=\"heading\">' + vocab['team_winners_medals'] + '</td><td class=\"figure\">' + winnersMedals + '</td></tr><tr><td class=\"icon appearances\"><span></span></td><td class=\"heading\">' + vocab['team_world_cup_finals'] + '</td><td class=\"figure\">' + finalAppearences + '</td></tr><tr><td class=\"icon goals\"><span></span></td><td class=\"heading\">' + vocab['team_world_cup_goals'] + '</td><td class=\"figure\">' + goals + '</td></tr></table></div>';
					markup += '<div class=\"expert-group\">';
					if (img !== '') { markup += '<img class=\"avatar\" src=\"img/pundits/' + img + '.gif\">'; }
					markup += '<h2>' + name + '</h2><h3>' + title + '</h3><ul class=\"team formation expert\">';
					markup += that.createExpertsTeam(teamIds);
					markup += '</ul><div class=\"column\"><div class=\"description\"><p class=\"intro\">' + teamDescriptionIntro + '</p><p class=\"more\">' + teamDescription + '</p><button data-status=\"more\" class=\"toggle-pundit button\">' + vocab['label_more'] + '</button></div></div>';
					markup += '<div class=\"column numbers\">' + stats + '</div></div>';
					//that.wrapFormation($team);
				}
			}

			news.$('#experts-wrapper').html(markup);

			if (settings.get('limitedViewport')) {
				news.$('#experts-wrapper').find('.expert-group').each(function () {
					news.pubsub.emit('formation:wrap', [news.$(this).find('ul.expert')]);
				});
				settings.set('wrappedFormationExperts', true);
			}

			that.toggleMoreDescription();
			news.$('#experts-wrapper').show();

			news.pubsub.emit('istats', ['experts-tab-clicked', 'newsspec-interation']);
		},

		/**
		* Creates expert's team.
		*
		* @exports experts/createExpertsTeam
		*/
		/**
		* @param {array} array of player IDs
		* @return {string}
		*/
		createExpertsTeam: function (array) {
			var that = this,
				html = '';

			for (var i = 0; i < array.length; i++) {
				var gid = array[i],
					player = playersDetails[gid],
					position = playersIndex[gid]['position'].toLowerCase(),
					positionNumberHtml = '<span class=\"position-number\">' + (i + 1) + '</span>',
					img;

				img = playersIndex[gid]['filename'];
				html += '<li class=\"player ' + position + '\"><span class=\"frame\"><img src=\"img/players/' + img + '.jpg\" data-pid=\"' + (i + 1) + '\">' + positionNumberHtml + '</span></li>';
			}

			return html;
		},

		/**
		* Activates description show/hide when clicking on button.
		*
		* @exports experts/toggleMoreDescription
		*/
		toggleMoreDescription: function () {
			var that = this;

			news.$('#experts-wrapper').find('.toggle-pundit').bind('click', function () {
				var $t = news.$(this);
				if ($t.attr('data-status') === 'more') {
					news.$(this).html(vocab['label_less']);
					news.$(this).attr('data-status', 'less');
					news.$(this).closest('.description').find('.more').show();
					news.pubsub.emit('istats', ['more-content-from-expert-clicked', 'newsspec-interation']);
				} else {
					news.$(this).html(vocab['label_more']);
					news.$(this).attr('data-status', 'more');
					news.$(this).closest('.description').find('.more').hide();
				}
			});
		},

		/**
		* Check presence of experts in data file.
		*
		* @exports experts/lookForExperts
		*/
		/**
		* @param {array} array of player IDs
		* @return {string}
		*/
		lookForExperts: function (array) {
			var that = this;

			if (pundits['001'] !== undefined) {
				news.$('.options li.experts').css('display', 'inline-block');
			} else {
				news.$('.options li.experts').remove();
			}
		}
    };
});
