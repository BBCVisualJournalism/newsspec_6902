define([], function () {

    return {
        teams: {
			'user' : [],
			'friend' : []
        },

        /**
        * Getter.
        *
        * @exports teams/get
        */
        /**
        * @param {string} opt
        */
		get: function (opt) {
			return this.teams[opt];
		},

        /**
        * Setter.
        *
        * @exports teams/set
        */
        /**
        * @param {string} opt
        * @param {string} index
        * @param {string} value
        */
		set: function (opt, index, value) {
			if (index !== '') {
				this.teams[opt][index] = value;
			} else {
				this.teams[opt] = value;
			}
		}
    };

});
