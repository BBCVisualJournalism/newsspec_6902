define([
	'lib/news_special/bootstrap',
	'utils',
	'data/players',
	'data/players_index',
	'vocabs/team_vis_vocab',
	'data/pundits'
], function (news, utils, playersDetails, playersIndex, vocab, experts) {

    'use strict';

    return {
		/********************************************************
			* VARIABLES
		********************************************************/
		playedInEl: news.$('#teamVisPlayedInP'),
		profileTypeEl: news.$('#teamVisProfileTypeP'),
		teamVisWorldCupGoalsPEl: news.$('#teamVisWorldCupGoalsP'),
		winnerMedalsPEl: news.$('#teamVisWinnersMedalsP'),
		finalsAppearencesPEl: news.$('#teamVisFinalsAppearencesP'),
		cleanSheetsPEl: news.$('#teamVisCleanSheetsP'),
		expertSelectEl: news.$('.teamVisSelectExpert'),
		expertsViewEls: news.$('.hideExpertVal'),
		selectExpertSpanEl: news.$('.teamVisCompareSpan'),
		selectExpertEl: news.$('.teamVis').find('.fancy-select'),


		yourGoalsTotal: 0,
		minAttackingVal: 2.5,
		totalAttackingVal: 17.6,
		minDefensiveVal: 0,
		totalDefensiveVal: 18,
		minDisciplineVal: 0,
		totalDisciplineVal: 50,
		minExperienceVal: 41,
		totalExperienceVal: 132,

		additionalExperts: {},
		profileTypeStr: '',

        /********************************************************
            * METHODS
        ********************************************************/
        init: function () {

			this.bindPolyFill();
			this.addExpertsToDropDown();
			this.addListeners();

			// this.testListenerBroadcast();
        },

        addExpertsToDropDown: function () {
			var keysLength = 0,
				punditName;

			for (var key in experts) {
				if (!experts[key]) {
					//hide the experts dropdown!
					this.selectExpertSpanEl.hide();
					this.selectExpertEl.hide();
					return;
				}
				keysLength ++;
				punditName = experts[key].name;
				this.expertSelectEl.append('<option value="' + key + '">' + punditName + '</option>');
			}
			if (!keysLength) {
				//hide the experts dropdown!
				this.selectExpertSpanEl.hide();
				this.selectExpertEl.hide();
			}
        },

		addListeners: function () {
			news.pubsub.on('datavis:update', this.handleUpdateViz.bind(this));
			news.pubsub.on('datavis:showFriendsChoices', this.handleShowFriendsChoices.bind(this));

			//add the change listener to the dropdown!
			this.expertSelectEl.change(this.handleSelectExpertChange.bind(this));
		},

        /********************************************************
            * DATA MANIPULATION
        ********************************************************/
		returnTeamStats: function (teamArr) {
			var tournamentsPlayed = [],
				numOfGoals = 0,
				attackingPlayersTotal = 0,
				defensivePlayersTotal = 0,
				agspg = 0,
				agcpg = 0,
				cleanSheetsTotal = 0,
				yellowCardsTotal = 0,
				redCardsTotal = 0,
				appearancesTotal = 0,
				tournamentsTotal = 0,
				winnerMedalsTotal = 0,
				finalsTotal = 0,
				attackingStrengthVal,
				defensiveStrengthVal,
				disciplineVal,
				experienceVal,
				playersLength = teamArr.length,
				playerIndexObj = {},
				playerPosition,
				highestVal = 0;

			for (var a = 0; a < playersLength; a++) {
				playerIndexObj = playersDetails[teamArr[a]];
				playerPosition = playersIndex[teamArr[a]].position;
				if (playerPosition === 'Midfielder' || playerPosition === 'Forward') {
					attackingPlayersTotal++;
				}
				if (playerPosition === 'Goalkeeper' || playerPosition === 'Defender') {
					defensivePlayersTotal++;
				}
				yellowCardsTotal += Number(playerIndexObj.stats.yellowcards);
				redCardsTotal += Number(playerIndexObj.stats.redcards);

				//append the players tournaments array to the combined 'team' tournaments array
				tournamentsPlayed = tournamentsPlayed.concat(playerIndexObj.tournaments.split(', '));
				numOfGoals += Number(playerIndexObj.stats.goals);
				agspg += Number(playerIndexObj.stats.avtgspg);
				agcpg += Number(playerIndexObj.stats.avtgcpg);
				cleanSheetsTotal += Number(playerIndexObj.stats.clean_sheets);
				appearancesTotal += Number(playerIndexObj.stats.appearances);
				tournamentsTotal += Number(playerIndexObj.stats.tournaments);
				winnerMedalsTotal += Number(playerIndexObj.stats.medals);
				finalsTotal += Number(playerIndexObj.stats.final_appearences || 0);
			}

			//remove any duplicate entries from the tournamentsPlayed array
			tournamentsPlayed = this.getArrayUniqueEntries(tournamentsPlayed);
			attackingStrengthVal = (numOfGoals / attackingPlayersTotal) * (agspg / attackingPlayersTotal);
			defensiveStrengthVal = (cleanSheetsTotal / defensivePlayersTotal) / (agcpg / defensivePlayersTotal);
			disciplineVal = (yellowCardsTotal + (redCardsTotal * 2));
			experienceVal = (appearancesTotal / 2) + tournamentsTotal;
			var attackingStrengthDecVal = (attackingStrengthVal - this.minAttackingVal) / this.totalAttackingVal, defensiveStrengthDecVal = (defensiveStrengthVal - this.minDefensiveVal) / this.totalDefensiveVal, disciplineDecVal = (this.totalDisciplineVal - (disciplineVal - this.minDisciplineVal)) / this.totalDisciplineVal, experienceDecVal = (experienceVal - this.minExperienceVal) / this.totalExperienceVal;

			//extra prominance for the attacking value
			attackingStrengthDecVal = ((attackingStrengthDecVal / 0.8) < 1) ? (attackingStrengthDecVal / 0.8) : 1;

			//exra bit of slimming for the discipline value ... it was too prominant
			disciplineDecVal = disciplineDecVal * 0.8;

			//extra prominance for the defensive value
			defensiveStrengthDecVal = ((defensiveStrengthDecVal / 0.8) < 1) ? (defensiveStrengthDecVal / 0.8) : 1;

			highestVal = (attackingStrengthDecVal >= highestVal) ? this.returnProfileValAndSetType(attackingStrengthDecVal, vocab.attacking_profile) : highestVal;
			highestVal = (defensiveStrengthDecVal >= highestVal) ? this.returnProfileValAndSetType(defensiveStrengthDecVal, vocab.defensive_profile) : highestVal;
			highestVal = (disciplineDecVal >= highestVal) ? this.returnProfileValAndSetType(disciplineDecVal, vocab.disciplined_profile) : highestVal;
			highestVal = (experienceDecVal >= highestVal) ? this.returnProfileValAndSetType(experienceDecVal, vocab.experienced_profile) : highestVal;

			if (vocab['language'] === 'persian') {
				highestVal = utils.numberStringToFarsi(highestVal);
			}

			return {
				tournamentsPlayed: tournamentsPlayed,
				attackingStrengthDec: attackingStrengthDecVal,
				defensiveStrengthDec: defensiveStrengthDecVal,
				disciplineDec: disciplineDecVal,
				experienceDec: experienceDecVal,
				goalsNum: numOfGoals,
				winnersMedalsNum: winnerMedalsTotal,
				finalsNum: finalsTotal,
				cleanSheetsNum: cleanSheetsTotal,
				profileType: this.profileTypeStr
			};
		},

		updateExpertVals: function (expertId) {
			var objKey = expertId.replace(/\s/g, ''),
				expertObj = (experts[objKey]) ? experts[objKey] : this.additionalExperts[objKey.toString()], playerIds = expertObj.team.ids.split(','),
				teamStats = this.returnTeamStats(playerIds);

			// update views
			this.updateAttackingStrengthExpertBar(teamStats.attackingStrengthDec);
			this.updateDefensiveStrengthExpertBar(teamStats.defensiveStrengthDec);
			this.updateDisciplineExpertBar(teamStats.disciplineDec);
			this.updateExperienceExpertBar(teamStats.experienceDec);
			this.updateGoalsScoredExpert(teamStats.goalsNum);
			this.updateExpertName(expertObj.name);
		},

		updatePlayedIn: function (touramentsArr, profileType) {
			//construct data
			var tournamentsStr = touramentsArr.join(', '),
				numberRe = /\d+/g,
				numberWang,
				numberWangLength,
				formattedTouramentsArr,
				playedInStr,
				profileTypeStr;

			if (vocab['language'] === 'persian') {
				numberRe = /[۰۱۲۳۴۵۶۷۸۹]+/g;
			}
			numberWang = tournamentsStr.match(numberRe);
			numberWangLength = numberWang.length;
			for (var a = 0; a < numberWangLength; a++) {
				tournamentsStr = tournamentsStr.replace(numberWang[a], '<b>' + numberWang[a] + '</b>');
			}
			formattedTouramentsArr = touramentsArr.length;

			if (vocab['language'] === 'persian') {
				formattedTouramentsArr = utils.numberStringToFarsi(formattedTouramentsArr);
			}
			//update view elements
			playedInStr = vocab.played_in.replace('#num1', '<span class="orangeHighlightSpan">' + formattedTouramentsArr + '</span>') + '</br></br>' + tournamentsStr;
			this.playedInEl.html(playedInStr);

			profileTypeStr = profileType.replace(/#/, '<span class="orangeHighlightSpan">');
			profileTypeStr = profileTypeStr.replace(/#/, '</span>');
			this.profileTypeEl.html(profileTypeStr);
		},

		/******
			* decVal: the decimal value from 0-1
		******/
		updateAttackingStrengthBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				barEl;

			barEl = news.$('#attackingStrengthBar');
			barEl.removeClass('widthTransition');
			barEl.css('width', '0');
			barEl.addClass('widthTransition');
			setTimeout(function () {
				barEl.css('width', percentageVal + '%');
			}, 0);

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}

			news.$('#attackingStrengthVal').html(tidyDisplayVal);
		},

		updateAttackingStrengthExpertBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				triEl = news.$('#attackingExpertTri'),
				valEl = news.$('#attackingStrengthExpertVal');

			news.$('#attackingExpertTri').css('left', percentageVal + '%');
			news.$('#attackingStrengthExpertVal').css('left', percentageVal + '%');

			triEl.css('left', percentageVal + '%');
			valEl.css('left', percentageVal + '%');

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}

			news.$('#attackingStrengthExpertVal').html(tidyDisplayVal);
		},

		/******
			* decVal: the decimal value from 0-1
		******/
		updateDefensiveStrengthBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				barEl;

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}
			news.$('#defensiveStrengthVal').html(tidyDisplayVal);

			barEl = news.$('#defensiveStrengthBar');
			barEl.removeClass('widthTransition');
			barEl.css('width', '0');
			barEl.addClass('widthTransition');
			setTimeout(function () {
				barEl.css('width', percentageVal + '%');
			}, 100);
		},

		updateDefensiveStrengthExpertBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				triEl,
				valEl;

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}

			triEl = news.$('#defensiveStrengthExpertTri');
			valEl = news.$('#defensiveStrengthExpertVal');
			setTimeout(function () {
				triEl.css('left', percentageVal + '%');
				valEl.css('left', percentageVal + '%');
			}, 100);

			news.$('#defensiveStrengthExpertVal').html(tidyDisplayVal);
		},

		/******
			* decVal: the decimal value from 0-1
		******/
		updateDisciplineBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				barEl;

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}
			news.$('#disciplineVal').html(tidyDisplayVal);

			barEl = news.$('#disciplineBar');
			barEl.removeClass('widthTransition');
			barEl.css('width', '0');
			barEl.addClass('widthTransition');
			setTimeout(function () {
				barEl.css('width', percentageVal + '%');
			}, 100);
		},

		updateDisciplineExpertBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				triEl,
				valEl;

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}

			triEl = news.$('#disciplineExpertTri');
			valEl = news.$('#disciplineExpertVal');
			setTimeout(function () {
				triEl.css('left', percentageVal + '%');
				valEl.css('left', percentageVal + '%');
			}, 200);

			news.$('#disciplineExpertVal').html(tidyDisplayVal);
		},

		/******
			* decVal: the decimal value from 0-1
		******/
		updateExperienceBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				barEl;

			if (vocab['language'] === 'persian') {
				tidyDisplayVal = utils.numberStringToFarsi(tidyDisplayVal);
			}
			news.$('#experienceVal').html(tidyDisplayVal);

			barEl = news.$('#experienceBar');
			barEl.removeClass('widthTransition');
			barEl.css('width', '0');
			barEl.addClass('widthTransition');
			setTimeout(function () {
				barEl.css('width', percentageVal + '%');
			}, 100);
		},

		updateExperienceExpertBar: function (decVal) {
			decVal = Math.round(decVal * 10) / 10;
			var percentageVal = decVal * 100,
				tidyDisplayVal = (Math.round((decVal * 10) * 10) / 10),
				triEl,
				valEl;

			triEl = news.$('#experienceExpertTri');
			valEl = news.$('#experienceExpertVal');
			setTimeout(function () {
				triEl.css('left', percentageVal + '%');
				valEl.css('left', percentageVal + '%');
			}, 300);

			news.$('#experienceExpertVal').html(tidyDisplayVal);
		},

		updateGoalsScored: function (goals) {
			var formattedGoals = goals,
				targetLineNum,
				targetLineEl;

			if (vocab['language'] === 'persian') {
				formattedGoals = utils.numberStringToFarsi(formattedGoals);
			}

			this.yourGoalsTotal = goals;
			news.$('.teamVizGoalChartLine').removeClass('teamVizHighlightYouLine');
			this.teamVisWorldCupGoalsPEl.html(vocab.goals_scored.replace('#num1', '<span class="orangeHighlightSpan">' + formattedGoals + '</span>'));
			targetLineNum = goals - 7; //the goals scored line chart starts at 7 :s
			targetLineEl = news.$('.teamVisGoalLinesHolder')[0].children[targetLineNum];
			if (targetLineEl) {
				news.$(targetLineEl).addClass('teamVizHighlightYouLine');
			}
			news.$('#teamVisGoalsYouVal').html(': ' + formattedGoals);
		},

		updateGoalsScoredExpert: function (expertGoals) {
			var percentStepChange = 1.282051282051,
				expertGoalLineEl = news.$('.teamVisGoalLinesHolder div:last-child'),
				expertTargetLineNum = expertGoals - 7,
				expertTargetLeft = expertTargetLineNum * percentStepChange, expertPercentHeight = (expertGoals !== this.yourGoalsTotal) ? (expertTargetLeft + percentStepChange) : (expertTargetLeft + percentStepChange) / 2;

			expertGoalLineEl.css({
				left: expertTargetLeft + '%',
				height: expertPercentHeight + '%'
			});

			if (vocab['language'] === 'persian') {
				expertGoals = utils.numberStringToFarsi(expertGoals);
			}

			news.$('#teamVisGoalsExpertVal').html(': ' + expertGoals);
		},

		updateWinnersMedals: function (val) {
			//update view elements
			var formattedVal = val,
				totalNum = vocab.winner_medals.match(/\b\d+/g),
				winnersMedalsStr = '',
				iconEls;

			if (vocab['language'] === 'persian') {
				formattedVal = utils.numberStringToFarsi(formattedVal);
				totalNum = vocab.winner_medals.match(/[۰۱۲۳۴۵۶۷۸۹]+/g);
			}

			winnersMedalsStr = vocab.winner_medals.replace('#num1', '<span class="orangeHighlightSpan">' + formattedVal + '</span>');
			winnersMedalsStr = winnersMedalsStr.replace(totalNum, '<span class="blackHighlightSpan">' + totalNum + '</span>');
			this.winnerMedalsPEl.html(winnersMedalsStr);

			iconEls = news.$('.teamVisWinnersMedalsHolder').find('img');
			iconEls.attr('src', 'img/trophy_bw.png');

			for (var a = 0; a < val; a++) {
				news.$(iconEls[a]).attr('src', 'img/trophy.png');
			}
		},

		updateFinalAppearences: function (val) {
			//update view elements
			var formattedVal = val,
				totalNum = vocab.final_appearances.match(/\b\d+/g),
				finalsStr = '',
				iconEls;

			if (vocab['language'] === 'persian') {
				formattedVal = utils.numberStringToFarsi(formattedVal);
				totalNum = vocab.final_appearances.match(/[۰۱۲۳۴۵۶۷۸۹]+/g);
			}

			finalsStr = vocab.final_appearances.replace('#num1', '<span class="orangeHighlightSpan">' + formattedVal + '</span>');
			finalsStr = finalsStr.replace(totalNum, '<span class="blackHighlightSpan">' + totalNum + '</span>');
			this.finalsAppearencesPEl.html(finalsStr);

			iconEls = news.$('.teamVisFinalsAppearencesHolder').find('img');
			iconEls.attr('src', 'img/medal_bw.png');

			for (var a = 0; a < val; a++) {
				news.$(iconEls[a]).attr('src', 'img/medal.png');
			}
		},

		updateCleanSheets: function (val) {
			var formattedVal = val,
				totalNum = vocab.clean_sheets.match(/\b\d+/g),
				finalsStr = '';

			if (vocab['language'] === 'persian') {
				formattedVal = utils.numberStringToFarsi(formattedVal);
				totalNum = vocab.clean_sheets.match(/[۰۱۲۳۴۵۶۷۸۹]+/g);
			}

			finalsStr = vocab.clean_sheets.replace('#num1', '<span class="orangeHighlightSpan">' + formattedVal + '</span>');
			finalsStr = finalsStr.replace(totalNum, '<span class="blackHighlightSpan">' + totalNum + '</span>');
			this.cleanSheetsPEl.html(finalsStr);
		},

		updateExpertName: function (name) {
			news.$('.teamVisExpertName').html(name);
		},

		showExpertsView: function () {
			this.expertsViewEls.removeClass('hideExpertVal');
		},

		hideExpertsView: function () {
			this.expertsViewEls.addClass('hideExpertVal');
		},


		/********************************************************
            * EVENT HANDLERS
        ********************************************************/
        handleUpdateViz: function (playerIds) {

			var teamStats = this.returnTeamStats(playerIds);

			/**********************
				* UPDATE VIEW(S)
			**********************/
			this.updatePlayedIn(teamStats.tournamentsPlayed.sort(this.sortTournamentsArrayByDate), teamStats.profileType);
			this.updateAttackingStrengthBar(teamStats.attackingStrengthDec);
			this.updateDefensiveStrengthBar(teamStats.defensiveStrengthDec);
			this.updateDisciplineBar(teamStats.disciplineDec);
			this.updateExperienceBar(teamStats.experienceDec);
			this.updateGoalsScored(teamStats.goalsNum);
			this.updateWinnersMedals(teamStats.winnersMedalsNum);
			this.updateFinalAppearences(teamStats.finalsNum);
			this.updateCleanSheets(teamStats.cleanSheetsNum);
        },

        handleShowFriendsChoices: function (choices, friendStr) {
			var objKey = friendStr.replace(/\s/g, '');

			this.additionalExperts[objKey] = {
				name: friendStr,
				team: {
					ids: choices.toString()
				}
			};
			this.expertSelectEl.append('<option value="' + objKey + ' " selected="selected">' + friendStr + '</option>');
			this.showExpertsView();
			this.updateExpertVals(objKey);
        },

        handleSelectExpertChange: function (e) {
			var selectedVal = this.expertSelectEl[0].options[this.expertSelectEl[0].selectedIndex].value,
				valBoo = Number(selectedVal);

			if (valBoo !== 0) {
				this.updateExpertVals(selectedVal);
				this.showExpertsView();
				news.pubsub.emit('istats', ['compare-results-clicked', 'newsspec-interation']);
			}
			else {
				//you've selected the default option ... hide the experts view elements
				this.hideExpertsView();
			}
        },

		/********************************************************
            * TESTS
        ********************************************************/
		testListenerBroadcast: function () {
			news.pubsub.emit('datavis:update', [['006', '016', '020', '021', '069', '077', '053', '078', '106', '098', '102']]);
			// '006', '016', '020', '021', '069', '077', '053', '078', '106', '098', '102' -- highest goals scored
			news.pubsub.emit('datavis:showFriendsChoices', [['004', '023', '026', '037', '066', '086', '084', '058', '102', '105', '108'], 'your friend']);
		},

		/********************************************************
            * UTILS
        ********************************************************/
        returnProfileValAndSetType: function (val, str) {
			this.profileTypeStr = str;
			return val;
		},

        sortTournamentsArrayByDate: function (a, b) {
			var numberRe = /\d+/g,
				aNum = Number(a.match(numberRe)),
				bNum = Number(b.match(numberRe));

			return aNum - bNum;
        },

        getCleanSheetsNum: function (playerIds) {
			var cleanSheetsTotal = 0,
				playersLength = playerIds.length,
				playerIndexObj;

			for (var a = 0; a < playersLength; a++) {
				playerIndexObj = playersDetails[playerIds[a]];
				cleanSheetsTotal += Number(playerIndexObj.stats.clean_sheets);
			}
			return cleanSheetsTotal;
        },

        getWinnersMedalsNum: function (playerIds) {
			var winnerMedalsTotal = 0,
				playersLength = playerIds.length,
				playerIndexObj;

			for (var a = 0; a < playersLength; a++) {
				playerIndexObj = playersDetails[playerIds[a]];
				winnerMedalsTotal += Number(playerIndexObj.stats.medals);
			}
			return winnerMedalsTotal;
        },

        getFinalAppearencesNum: function (playerIds) {
			var finalsTotal = 0,
				playersLength = playerIds.length,
				playerIndexObj;

			for (var a = 0; a < playersLength; a++) {
				playerIndexObj = playersDetails[playerIds[a]];
				finalsTotal += Number(playerIndexObj.stats.final_appearences || 0);
			}
			return finalsTotal;
        },

        getGoalsTotalNum: function (playerIds) {
			var goalsTotal = 0,
				playersLength = playerIds.length,
				playerIndexObj;

			for (var a = 0; a < playersLength; a++) {
				playerIndexObj = playersDetails[playerIds[a]];
				goalsTotal += Number(playerIndexObj.stats.goals);
			}
			return goalsTotal;
        },

        getArrayUniqueEntries: function (arr) {
			var u = {},
				tempUniqueArr = [];

			for (var i = 0; i < arr.length; ++i) {
				if (u.hasOwnProperty(arr[i])) {
					continue;
				}
				tempUniqueArr.push(arr[i]);
				u[arr[i]] = 1;
			}
			return tempUniqueArr;
        },

        bindPolyFill: function () {
			if (typeof Function.prototype.bind !== 'function') {
				Function.prototype.bind = function (context) {
					var slice = Array.prototype.slice,
						fn = this,
						args;

					return function () {
						args = slice.call(arguments, 1);

						if (args.length) {
							return arguments.length ? fn.apply(context, args.concat(slice.call(arguments))) : fn.apply(context, args);
						} else {
							return arguments.length ? fn.apply(context, arguments) : fn.call(context);
						}
					};
				};
			}
        }
    };
});