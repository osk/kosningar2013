var csv = require('csv'),
	_ = require('underscore'),
	moment = require('moment')
	;

import_data('allir.csv', function(data)
{
	var age = function(ssn)
	{
		var today = moment();
		var birthday = moment('19' + ssn.substring(4,6) + '-' + ssn.substring(2,4) + '-' + ssn.substring(0,2));
		return today.diff(birthday, 'years');
	}

	var stats = function(data)
	{
		var sum = _.reduce(data, function(memo, i)
		{
			return age(i.Kt) + memo;
		}, 0);

		var count = data.length;
		var avg = sum/count;

		var dev = _.map(_.pluck(data, 'Kt'), function(item) { return (age(item) - avg) * (age(item) - avg); })
		var stdev = Math.sqrt(_.reduce(dev, function(memo, item) { return item + memo; }, 0) / count);

		var min = _.min(data, function(i) { return age(i.Kt); })
		var max = _.max(data, function(i) { return age(i.Kt); })

		console.log("- Meðalaldur", avg.toFixed(2));
		console.log("- Staðalfrávik", stdev.toFixed(2));
		console.log("- Yngst/ur:", min.Nafn, age(min.Kt));
		console.log("- Elst/ur:", max.Nafn, age(max.Kt));
	}

	console.log("# Allir frambjóðendur:")
	stats(data);

	console.log("\n# Eftir framboði:")

	var grouped = _.groupBy(data, 'Framboð');

	for (var g in grouped)
	{
		console.log("##", g);

		stats(grouped[g]);

		console.log();
	}

	console.log("---");
	console.log();

	console.log("# Eftir kjördæmi:")
	var place = _.groupBy(data, 'Kjördæmi');

	for (var p in place)
	{
		console.log("##", p);

		stats(place[p]);

		console.log();
	}
});

function import_data(all, callback)
{
	var get_data = function(file, cb)
	{
		var data = [];
		
		function t(row)
		{
			data.push(row);
		}

		csv()
			.from(file, {columns: true, delimiter: ';'})
			.on('end', function() { cb(data); })
			.transform(t);

		return data;
	}

	get_data(all, function(data)
	{
		callback(data);
	})
}