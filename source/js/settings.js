define([], function () {

    return {
		settings: {
			'infopanel' : 'close',
			'limitedViewport' : false,
			'dock' : true,
			'wrappedFormation' : false,
			'wrappedFormationExperts' : false,
			'iframeOffset' : {}
		},

        /**
        * Getter.
        *
        * @exports settings/get
        */
        /**
        * @param {string} opt
        */
		get: function (opt) {
			return this.settings[opt];
		},

        /**
        * Setter.
        *
        * @exports settings/set
        */
        /**
        * @param {string} opt
        * @param {string} value
        */
		set: function (opt, value) {
			this.settings[opt] = value;
		}
    };

});
