export default {
    /**
     * 时间的echart配置
     * @param {string} title 
     */
    timeOption(title) {
        return {
            title: {
                text: title
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                data: []
            },
            toolbox: {
                feature: {
                    magicType: {
                        type: ['line', 'bar']
                    },
                    restore: {},
                    saveAsImage: {},
                },
            },
            xAxis: {
                type: 'time'
            },
            yAxis: {},
            series: []
        };
    },
};