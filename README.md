![](./badge.svg)

# VaccinationLollipop

### Install

```
$ yarn add https://github.com/reuters-graphics/chart-module-vaccination-countries.git
```

### Use

```javascript
import VaccinationLollipop from '@reuters-graphics/chart-module-vaccination-countries';

const chart = new VaccinationLollipop();

// To create your chart, pass a selector string to the chart's selection method,
// as well as any props or data to their respective methods. Then call draw.
chart
  .selection('#chart')
  .data([1, 2, 3])
  .props({
      aspectHeight: 0.7,
      margin: {
        top: 25,
        right: 20,
        bottom: 40,
        left: 120,
      },
      filterNumber: 15,
      dots: true,
      radius: 5,
      padding: .4,
      rectFill: 'rgba(255,255,255,.3)',
      countryNameGetter: (d) => client.getCountry(d).translations['en'],
      milestones: [.1, .2, .3, .4, .5],
      annotationStroke: 'white',
      strokeDasharray: '4',
      text: {
        milestone: 'Number of doses needed to vaccinate {{ number }}% of the population',
        milestoneMinor: '...{{ number }}% of population',
      },
      topText: 'Doses per 100 people',
    })
  .draw();

// You can call any method again to update the chart.
chart
  .data([3, 4, 5])
  .draw();

// Or just call the draw function alone, which is useful for resizing the chart.
chart.draw();
```

To apply this chart's default styles when using SCSS, simply define the variable `$VaccinationLollipop-container` to represent the ID or class of the chart's container(s) and import the `_chart.scss` partial.

```CSS
$VaccinationLollipop-container: '#chart';

@import '~@reuters-graphics/chart-module-vaccination-countries/src/scss/chart';
```

## Developing chart modules

Read more in the [DEVELOPING docs](./DEVELOPING.md) about how to write your chart module.