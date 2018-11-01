export default {
	min(arr) {
		return Math.min(...arr);
	},
    sum(arr) {
        return arr.reduce((a, b) => a + b, 0);
    },
    mean(arr) {
        if (arr.length == 0) return 0;
        if (arr.length == 1) return arr[0];
        return arr.reduce((a, b) => a + b) / arr.length;
	},
	maxItem(arr){
		let map = new Map();
		for(let item of arr){
			map.set(item, (map.get(item) || 0) +1);
		}
		let max = 0;
		let key;
		map.forEach(function(v, k) {
			if(v>max) {
				max = v;
				key = k;
			}
		});
		return key;
	},
};