import * as d3 from 'd3';

import BaseChartComponent from './baseClasses/ChartComponent';
import AtlasMetadataClient from '@reuters-graphics/graphics-atlas-client';
import Mustache from 'mustache';

const client = new AtlasMetadataClient();
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
      aspectHeight: 0.7,
      margin: {
        top: 18,
        right: 20,
        bottom: 80,
        left: 120,
      },
      filterNumber: 15,
      padding: .4,
      rectFill: 'rgba(255,255,255,.3)',
      countryNameGetter: (d) => client.getCountry(d).translations['en'],
      milestones: [.1, .2, .3, .4, .5],
      annotationStroke: 'white',
      strokeDasharray: '4',
      text: {
        milestone: 'Doses needed to vaccinate {{ number }}% of the population',
        milestoneMinor: '...{{ number }}% of population',
      },
      topText: 'Doses per 100 people',
      countryLinks: function(d){console.log(d)},
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
      data = data.slice(0, props.filterNumber);
      const { margin } = props;

      data.forEach(function(d) {
        d.perPop = d.totalDoses / d.population;
      });

      let useMilestone, milestoneIndex;
      const maxValue = d3.max(data, d => d.perPop);
      const { milestones } = props;

      for (let i = milestones.length - 1; i >= 0 ; i--) {
        if (milestones[i] * 2 > maxValue) {
          useMilestone = milestones[i];
          milestoneIndex = i;
        }
      }

      const node = this.selection().node();
      const { width: containerWidth } = node.getBoundingClientRect(); // Respect the width of your container!

      const width = containerWidth - margin.left - margin.right;
      const height = (containerWidth * props.aspectHeight) - margin.top - margin.bottom;

      const xScale = d3.scaleLinear()
        .rangeRound([0, width])
        .domain([0,useMilestone*2]);

      const yScale = d3.scaleBand()
        .rangeRound([0, height])
        .domain(data.map(d=>d.country)).padding(props.padding);

      const transition = d3.transition()
        .duration(500);

      const navOnClick = (country) => {
        if (props.countryLinks) {
          const countrySlug = client.getCountrySlug(country)

          // calling this function will navigate to a region page
          props.countryLinks(countrySlug);
        }
      };

      this.selection()
        .appendSelect('p.axis-label')
        .text(props.topText)
        .style('padding-left', (props.margin.left-2)+'px');

      this.svg = this.selection()
        .appendSelect('svg') // 👈 Use appendSelect instead of append for non-data-bound elements!
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      const plot = this.svg
        .appendSelect('g')
        .classed('plot', true)
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const yAxis = plot.appendSelect('g.axis.y');
      const xAxisTop = plot.appendSelect('g.axis.xTOP');

      xAxisTop.attr('transform', `translate(0,0)`)
        .call(
          d3.axisTop(xScale)
            .ticks(4)
            .tickFormat(d=>d*100)
        );

      yAxis.attr('transform', 'translate(0, 0)')
        .call(
          d3.axisLeft(yScale)
            .tickFormat((d) => {
              return props.countryNameGetter(d);
            })
        );

      yAxis.selectAll('.tick').each(function(d) {
        d3.select(this)
          .on('click', function(e) {
            navOnClick(e)
          });
      });

      // We're using d3's new data join method here.
      // Read more about that here: https://observablehq.com/@d3/selection-join
      // ... or feel free to use the old, reliable General Update Pattern.
      const countries = plot.selectAll('g.country-container')
        .data(data, d => d.country)
        .enter()
        .append('g')
        .attr('class', 'country-container')
        .attr('transform', d => `translate(0,${yScale(d.country)} )`);

      countries.appendSelect('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', d => yScale.bandwidth())
        .attr('width', d => xScale(d.perPop))
        .style('fill', props.rectFill);

      if (milestones[milestoneIndex-1]) {
        const a2 = plot.appendSelect('g.annotations')
          .appendSelect('g.ann-2')
  
        a2.appendSelect('line')
          .attr('x1', xScale(milestones[milestoneIndex-1]*2))
          .attr('x2', xScale(milestones[milestoneIndex-1]*2))
          .attr('y2', 0)
          .attr('y1', height)
          .style('stroke', props.annotationStroke)
          .style('stroke-dasharray',props.strokeDasharray);
  
        this.selection().appendSelect('p.ann-text-2.annotation-p')
          .style('left', `${xScale(milestones[milestoneIndex-1]*2)+margin.left}px`)
          .style('top', (height+margin.top+35)+'px')
          .text(Mustache.render(props.text.milestone, { number: milestones[milestoneIndex-1]*100 }))
      } else {
        plot.select('g.ann-2').remove()
        this.selection().select('.ann-text-2').remove()
      }

      const a1 = plot.appendSelect('g.annotations')
        .appendSelect('g.ann-1')

      a1.appendSelect('line')
        .attr('x1', xScale(useMilestone*2))
        .attr('x2', xScale(useMilestone*2))
        .attr('y2', 0)
        .attr('y1', height)
        .style('stroke', props.annotationStroke)
        .style('stroke-dasharray', props.strokeDasharray);

      const a1text = this.selection().appendSelect('p.ann-text-1.annotation-p')
        .style('left', `${xScale(useMilestone*2)+margin.left}px`)
        .style('top', (height+margin.top+35)+'px')

      if (milestones[milestoneIndex-1]) {
        a1text.text(Mustache.render(props.text.milestoneMinor, { number: useMilestone*100 }))
      } else {
        a1text.text(Mustache.render(props.text.milestone, { number: useMilestone*100 }))
      }
      return this; // Generally, always return the chart class from draw!
    }
}

export default VaccinationLollipop;
