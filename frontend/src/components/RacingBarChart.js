import React from 'react';
import * as d3 from 'd3';

import styles from './index.module.less';

const time = 100;

export default class RacingBarChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.user2Color = {};
    }

    componentDidMount() {
        const margin = {
            top: 0, right: 40, bottom: 30, left: 120
        };

        const width = this.chart.current.parentNode.clientWidth - margin.left - margin.right;
        const height = this.chart.current.parentNode.clientHeight - margin.top - margin.bottom;
        this.width = width;
        this.height = height;

        this.svg = d3.select(this.chart.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        this.yScale = d3.scaleBand()
            .rangeRound([height, 0], 0.1)
            .padding(0.4);
        console.log(this);
    }

    moveToDate = (dateData) => {
        const {
            width,
            height,
            svg,
            yScale,
            user2Color
        } = this;

        return new Promise((resolve) => {
            const t = d3.transition().duration(time).on('end', resolve);

            const data = Object.keys(dateData).map((user) => {
                const value = dateData[user] || 0;
                return {
                    name: user,
                    value
                };
            }).sort((a, b) => d3.ascending(a.value, b.value));

            const max = d3.max(data, (d) => d.value);
            const xScale = d3.scaleLinear()
                .range([0, width])
                .domain([0, max < 10 ? 10 : max]);

            yScale.domain(data.map((d) => d.name));

            let xAxis = svg.select('.x.axis');
            if (xAxis.empty()) {
                xAxis = svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', `translate(0,${height})`);
            }

            xAxis.transition(t)
                .call(d3.axisBottom(xScale))
                .selectAll('g');

            let axis = svg.select('.y.axis');
            if (axis.empty()) {
                axis = svg.append('g')
                    .attr('class', 'y axis');
            }

            let barsG = svg.select('.bars-g');
            if (barsG.empty()) {
                barsG = svg.append('g')
                    .attr('class', 'bars-g');
            }

            const bars = barsG
                .selectAll('.bar')
                .data(data, function (d) {
                    return d.name;
                });

            bars.exit().remove();

            const enterBars = bars.enter();

            enterBars
                .append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .merge(bars)
                .style('fill', function (d) {
                    return user2Color[d.name] || '#333';
                })
                .transition(t)
                .attr('height', () => yScale.bandwidth())
                .attr('y', function (d) {
                    return yScale(d.name);
                })
                .attr('width', function (d) {
                    return xScale(d.value);
                });

            const labels = barsG
                .selectAll('.label')
                .data(data, function (d) {
                    return d.name;
                });

            labels.exit().remove();

            const enterLabels = labels.enter();

            enterLabels
                .append('text')
                .attr('class', 'label')
                .attr('x', function (d) {
                    return 0;
                })
                .merge(labels)
                .transition(t)
                .attr('y', function (d) {
                    return yScale(d.name) + yScale.bandwidth() / 2 + 4;
                })
                .attr('x', function (d) {
                    return xScale(d.value) + 3;
                })
                .tween('text', function (d) {
                    const selection = d3.select(this);
                    const start = d3.select(this).text();
                    const end = d.value;
                    const interpolator = d3.interpolateNumber(start, end);
                    return function (t) { selection.text(Math.round(interpolator(t))); };
                });

            axis.transition(t)
                .call(d3.axisLeft(yScale))
                .selectAll('g');
        });
    }

    render() {
        return (
            <div style={{ height: 400 }} className={styles.racingBarChart}>
                <svg ref={this.chart} />
            </div>
        );
    }
}
