module.exports.createBar = function (num) {  return Math.abs(num) * 5; };
module.exports.createMargin = function (num) { if (num < 0) return - (Math.abs(num) * 5); };
module.exports.createNumberMargin = function (num) {
	num = parseInt(num)
	if (num < 0) {
		var digits = num.toString().length,
			space;

		if (digits === 2) {
			space = 35;
		} else if (digits === 3) {
			space = 38;
		}
		return - space - (Math.abs(num) * 5);
	}
};
module.exports.applyScaleClass = function (percentage) {
	if (percentage > 20) {
		scaleClass = 'c0';
	} else if (percentage > 15 && percentage <= 20) {
		scaleClass = 'c1';
	} else if (percentage > 10 && percentage <= 15) {
		scaleClass = 'c2';
	} else if (percentage < 10) {
		scaleClass = 'c3';
	}

	return scaleClass;
};
module.exports.isNegative = function (num) { var s = (num < 0) ? 'negative' : ''; return s; };
module.exports.getBarWidth = function (str) {
	// 44 is the max bar width
	return (100 * parseInt(str)) / 45;
}