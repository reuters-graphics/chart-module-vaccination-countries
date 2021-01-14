import * as d3 from 'd3';

import BaseChartComponent from './baseClasses/ChartComponent';

/**
 * Write your chart as a class with a single draw method that draws
 * your chart! This component inherits from a base class you can
 * see and customize in the baseClasses folder.
 */
class VaccinationLollipop extends BaseChartComponent {
    /**
     * Default props are the built-in styles your chart comes with
     * that you want to allow a user to customize. Remember, you can
     * pass in complex data here, like default d3 axes or accessor
     * functions that can get properties from your data.
     */
    defaultProps = {
      stroke: '#aaa',
      strokeWidth: 1,
      aspectHeight: 0.7,
      margin: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 120,
      },
      filterNumber: 15,
      dots: true,
      radius: 5,
    };

    /**
     * Default data for your chart. Generally, it's NOT a good idea to import
     * a big dataset and assign it here b/c it'll make your component quite
     * large in terms of file size. At minimum, though, you should assign an
     * empty Array or Object, depending on what your chart expects.
     */
    defaultData = [];

    /**
     * Write all your code to draw your chart in this function!
     * Remember to use appendSelect!
     */
    draw() {
      let data = this.data(); // Data passed to your chart
      const props = this.props(); // Props passed to your chart
      data = data.slice(0,props.filterNumber)
      const { margin } = props;

      const node = this.selection().node();
      const { width: containerWidth } = node.getBoundingClientRect(); // Respect the width of your container!

      const width = containerWidth - margin.left - margin.right;
      const height = (containerWidth * props.aspectHeight) - margin.top - margin.bottom;

      const xScale = d3.scaleLinear()
        .rangeRound([0, width])
        .domain([0,d3.max(data, d=>+d.perPop)]);

      const yScale = d3.scaleBand()
        .rangeRound([0, height])
        .domain(data.map(d=>d.country));

      const transition = d3.transition()
        .duration(500);

      this.svg = this.selection()
        .appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const plot = this.svg
        .appendSelect('g')
        .classed('plot', true)
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xAxis = plot.appendSelect('g.axis.x');
      const yAxis = plot.appendSelect('g.axis.y');

      xAxis.attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(xScale)
            .ticks(4)
        );

      yAxis.attr('transform', `translate(0, 0)`)
        .call(
          d3.axisLeft(yScale)
        );

      // We're using d3's new data join method here.
      // Read more about that here: https://observablehq.com/@d3/selection-join
      // ... or feel free to use the old, reliable General Update Pattern.
      const countries = plot.selectAll('g.country-container')
        .data(data, d => d.country)
        .enter()
        .append('g')
        .attr('class', 'country-container')
        .attr('transform',d=>`translate(0,${yScale(d.country)+(yScale.bandwidth()/2)} )`);

      countries.appendSelect('line')
        .attr('x1',xScale(0))
        .attr('x2',d=>xScale(d.perPop))
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', props.stroke)
        .attr('stroke-width', props.strokeWidth)

      // if (props.dots){
      //   countries.appendSelect('circle')
      //     .attr('cy',0)
      //     .attr('cx',d=>xScale(d.perPop))
      //     .attr('r', props.radius)
      //     .attr('fill', props.circle)
      // }

      return this; // Generally, always return the chart class from draw!
    }
}

export default VaccinationLollipop;
