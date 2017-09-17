describe('utils:', function() {


	it('flyingon.create', function() {

		var base = { name: 1 };
		expect(flyingon.create(base).name).toBe(1);
	});


	it('flyingon.extend', function () {

		var source = { items: [{ name: 1, data: [] }] },
			target = flyingon.extend({}, source, { value: 1 }, true);

		expect(target.items[0].name).toBe(1);
		expect(target.value).toBe(1);

		expect(target.items[0].data).not.toBe(source.items[0].data);
		expect(flyingon.extend({}, source).items[0].data).toBe(source.items[0].data);
	});


	it('flyingon.each', function () {
		
		var cache = [0, 0, 0, 0];

		flyingon.each('1,2,3,4,5', function (value, index) {

			cache[0] += value | 0;
			cache[1] += index;
		});

		flyingon.each([1,2,3,4,5], function (value, index) {

			cache[2] += value | 0;
			cache[3] += index;
		});

		expect(cache[0]).toBe(15);
		expect(cache[1]).toBe(10);

		expect(cache[2]).toBe(15);
		expect(cache[3]).toBe(10);
	});



});