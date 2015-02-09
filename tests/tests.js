define([
	'src/QDigest'
], function(QDigest){
	'use strict';

	describe('QDigest Tests', function () {
		beforeEach(function () {
			this.data = [0,2,2,2,2,3,3,3,3,3,3,4,5,6,7];

			var sigma = 8;  // we have 8 unique possible values 0-7
			var k = 5;  // compression parameter
			var logSigma = Math.log(sigma) / Math.log(2);

			this.error = logSigma * this.data.length / k;
			this.qDigest = new QDigest(this.data, k, sigma);
		});

		it('should create tree of a correct size', function () {
			expect(this.qDigest.tree.length).to.equal(15);
		});

		it('should serialize tree in an array of tuples', function () {
			var s = this.qDigest.serialize();
			expect(s).to.eql([
				[0, 1],
				[5, 2],
				[6, 2],
				[9, 4],
				[10, 6]
			]);
		});

		it('should calculate median', function () {
			var perc = 0.5;
			var idx = Math.floor(this.data.length * perc) - 1;
			expect(this.qDigest.quantile(perc)).to.equal(this.data[idx]);
		});

		it('should calculate 25% percantile', function () {
			var perc = 0.25;
			var idx = Math.floor(this.data.length * perc) - 1;
			expect(this.qDigest.quantile(perc)).to.equal(this.data[idx]);
		});

		it('should calculate 75% percantile within error boundaries', function () {
			var perc = 0.75;
			var idx = Math.floor(this.data.length * perc) - 1;
			expect(this.qDigest.quantile(perc)).to.be.within(
				Math.max(0, idx - this.error),
				Math.min(this.data.length, idx + this.error)
			);
			expect(this.qDigest.quantile(perc)).to.equal(this.data[11]);
		});
	});

});
