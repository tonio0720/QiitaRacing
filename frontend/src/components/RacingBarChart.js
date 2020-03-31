import React from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import moment from 'moment';

const time = 100;
let prevDateData = {};

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

export default class RacingBarChart extends React.Component {
    constructor(props) {
        super(props);
        this.chart = React.createRef();
        this.prevDateData = {};
        this.state = { currentDate: null };
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
    }

    play = async () => {
        const { data } = this.props;
        this.prevDateData = {};
        for (let i = 0; i < data.length; i++) {
            const { date, likeCounts } = data[i];
            await sleep();
            this.setState({ currentDate: date });
            await this.translateDate(likeCounts);
        }
    }

    translateDate = (dateData) => {
        const { users } = this.props;
        const {
            width,
            height,
            svg,
            yScale
        } = this;

        return new Promise((resolve) => {
            const t = d3.transition().duration(time).on('end', resolve);

            const totalDateData = {};
            const data = users.map((user) => {
                const value = (this.prevDateData[user] || 0) + (dateData[user] || 0);
                totalDateData[user] = value;
                return {
                    name: user,
                    value
                };
            }).sort((a, b) => d3.ascending(a.value, b.value));

            this.prevDateData = totalDateData;

            const max = d3.max(data, (d) => d.value);
            const xScale = d3.scaleLinear()
                .range([0, width])
                .domain([0, max < 10 ? 10 : max]);

            let xAxis = svg.select('.x.axis');
            if (xAxis.empty()) {
                xAxis = svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', `translate(0,${height})`);
            }

            xAxis.transition(t)
                .call(d3.axisBottom(xScale))
                .selectAll('g');

            yScale.domain(data.map((d) => d.name));

            let axis = svg.select('.y.axis');
            if (axis.empty()) {
                axis = svg.append('g')
                    .attr('class', 'y axis');
            }

            axis.transition(t)
                .call(d3.axisLeft(yScale))
                .selectAll('g');

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

            bars
                .enter()
                .append('g')
                .append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .style('fill', function () {
                    // return usercolor[d.name];
                })
                .merge(bars)
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

            labels.enter()
                .append('g')
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
        });
    }

    render() {
        const { currentDate } = this.state;
        return (
            <div>
                <h2>{currentDate}</h2>
                <div style={{ height: 400 }}>
                    <svg ref={this.chart} />
                </div>
            </div>
        );
    }
}
