import Vue from 'vue';

Vue.directive('focus', {
    inserted: function(el) {
        let input;
        if (el.tagName == "input")
            input = el;
        else {
            let rows = el.querySelectorAll(`input,textarea,select,[contenteditable='true']`);
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row.offsetWidth * row.offsetHeight > 0) {
                    input = row;
                    break;
                }
            }
        }
        if (input) setTimeout(function() {
			input.focus();
		}, 100);;
    }
});