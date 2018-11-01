import Vue from 'vue';
import { Component } from 'vue-property-decorator';

var SIZE = {
    sm: true,
    md: true,
    lg: true,
    xl: true,
};

@Component
export class ColMixin extends Vue {
    size = SIZE
    created() {
        let resize = _ => {
            this.size.sm = window.innerWidth >= 576;
            this.size.md = window.innerWidth >= 768;
            this.size.lg = window.innerWidth >= 992;
            this.size.xl = window.innerWidth >= 1200;
        };
        resize();
        window.addEventListener('resize', resize);
        this.$once('hook:beforeDestroy', function() {
            window.removeEventListener('resize', resize);
        });
    }
}