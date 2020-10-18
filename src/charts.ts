import * as d3 from 'd3';

type Columns = {
  columns: ['Render', typeof ACTUAL_DURATION, typeof BASE_DURATION];
};

type Item = {
  [key in ParagraphMap]?: number;
} & {
  actualDuration?: number;
  baseDuration?: number;
  commitTime: number;
  id?: number;
  interactions?: [];
  phase?: string;
  Render?: string;
  startTime: number;
};

type MouseMoveEvent = {
  target: {
    style: {
      outline: string;
    }
  } & {
    ['__data__']: {
      key: keyof ParagraphMap,
      value: string;
    };
  }
};

type ParagraphString =
  | 'Actual Duration'
  | 'Base Duration'
  | 'Number of Interactions'
  | 'Total Automation Time Elapsed';

type ProfilerLogs = {
  logs: Item[];
  numberOfInteractions: number;
};

enum ParagraphMap {
  ACTUAL_DURATION = 'Actual Duration',
  BASE_DURATION = 'Base Duration',
  NUMBER_OF_INTERACTIONS = 'Number of Interactions',
  TOTAL_AUTOMATION_TIME_ELAPSED = 'Total Automation Time Elapsed',
}

const {
  ACTUAL_DURATION,
  BASE_DURATION,
  NUMBER_OF_INTERACTIONS,
  TOTAL_AUTOMATION_TIME_ELAPSED,
} = ParagraphMap;

(async () => {
  const height = 500;
  let width = 1000;
  let bodyWidth = 0;
  const margin = ({
    bottom: 20,
    left: 40,
    right: 10,
    top: 10,
  });

  const fileNames = [];
  const interactions: number[] = [];
  const jsonData = [];
  const allJsonValues: number[] = [];

  const paragraphs: { [key in ParagraphMap]?: string } = {
    [ACTUAL_DURATION]:
      ` Time spent rendering the Profiler and its descendants for the current update. This 
        indicates how well the subtree makes use of memoization (e.g. React.memo, useMemo, 
        shouldComponentUpdate). Ideally this value should decrease significantly after the initial 
        mount as many of the descendants will only need to re-render if their specific props 
        change.`,
    [BASE_DURATION]:
      ` Duration of the most recent render time for each individual component within the Profiler 
        tree. This value estimates a worst-case cost of rendering (e.g. the initial mount or a tree
        with no memoization).`,
    [NUMBER_OF_INTERACTIONS]: `The total number of page interactions that occurred during the 
      automation flow.`,
    [TOTAL_AUTOMATION_TIME_ELAPSED]:
      ` The total time that elapsed during the automation flow. This does not indicate the total 
        render time, but rather the total time it took for the automation to complete its flow.`,
  };

  d3.select('html')
    .on('mousemove', e => {
      const windowWidth = window.innerWidth;
      const tooltip = document.getElementById('big-tooltip');
      const { clientX, clientY }: { clientX: number; clientY: number } = e as MouseEvent;
      const rightBuffer = windowWidth - 350;

      tooltip!.style.left =
        `${clientX > rightBuffer ? clientX - (clientX - rightBuffer) : clientX}px`;
      tooltip!.style.top = `${clientY}px`;
    });

  const { columns: jsonFiles } = await d3.dsv(' ', 'json/jsonList.dsv');

  for (const file of jsonFiles) jsonData.push(
    await d3
      .json(`json/${file}`)
      .then(data => {
        interactions.push((data as ProfilerLogs).numberOfInteractions);

        return (data as ProfilerLogs).logs.map((item: Item, index) => {
          item[ACTUAL_DURATION] = item.actualDuration;
          item[BASE_DURATION] = item.baseDuration;

          item.Render = `${index + 1}: ${item.id}`;

          allJsonValues.push((item[ACTUAL_DURATION] as number), (item[BASE_DURATION] as number));

          delete item.actualDuration;
          delete item.baseDuration;
          delete item.id;
          delete item.interactions;
          delete item.phase;

          return item;
        });
      })
  );

  const scaleMax = Math.floor(Math.max(...allJsonValues)) + 1;

  for (const [id, file] of jsonFiles.entries()) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svgEl.setAttribute('id', `chart-${id}`);
    svgEl.setAttribute('height', '575');

    const h2El = document.createElement('h2');
    let innerText = file.split('-')[0].replace(/([^A-Z])([A-Z])/g, '$1 $2');
    innerText = innerText[0].toUpperCase() + innerText.substring(1);

    const versions = fileNames.filter(item => item === innerText).length;

    if (versions > 0) {
      fileNames.push(innerText);
      innerText += ` - Version ${versions + 1}`;
    } else {
      fileNames.push(innerText);
    }

    h2El.innerText = innerText;

    document.body.appendChild(svgEl);
    document.body.appendChild(h2El);

    const data = Object.assign(
      jsonData[id],
      { columns: ['Render', ACTUAL_DURATION, BASE_DURATION] },
    ) as Item[] & Columns;

    const totalTimeElapsed = data[data.length - 1].commitTime - data[0].startTime;

    if (data.length >= 40) {
      width = 3000;
      if (bodyWidth < 3600) bodyWidth = 3600;
    } else if (data.length >= 30 && data.length < 40) {
      width = 2000;
      if (bodyWidth < 2600) bodyWidth = 2600;
    } else width = 1000;

    svgEl.setAttribute('width', `${width}`);

    const [groupKey] = data.columns;
    const keys = data.columns.slice(1);

    const color = d3.scaleOrdinal().range(['#5A78E6', '#56A6FC', '#52C9F2']);

    const legend = (svg: any) => {
      const g = svg
        .attr('transform', `translate(${width},0)`)
        .attr('text-anchor', 'end')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('g')
        .data(color.domain().slice().reverse())
        .join('g')
        .attr('transform', (d: any, i: number) => `translate(0,${i * 20})`);

      g.append('rect')
        .attr('x', -19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', (color as unknown as string));

      g.append('text')
        .attr('x', -24)
        .attr('y', 9.5)
        .attr('dy', '0.35em')
        .text((d: any) => d);
    };

    const xAxis = (g: d3.Selection<any, d3.Axis<d3.NumberValue>, HTMLElement, any>) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call(g => g.select('.domain').remove());

    const yAxis = (g: any) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call((g: d3.Selection<SVGElement, {}, HTMLElement, any>) => g.select('.domain').remove())
      .call((g: d3.Selection<SVGElement, {}, HTMLElement, any>) =>
        g.select('.tick:last-of-type text').clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Milliseconds'));

    const x0 = d3.scaleBand()
      .domain(data.map(d => d['Render']!))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, scaleMax]).nice()
      .rangeRound([height - margin.bottom, margin.top]);

    const chart = () => {
      const svg = d3.select(`#chart-${id}`) as d3.Selection<any, any, any, any>;

      (svg as any).append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d: Item) => `translate(${x0(d[groupKey]!)},0)`)
        .selectAll('rect')
        .data((d: Item) => keys.map(key => ({ key, value: d[key] })))
        .join('rect')
        .attr('x', (d: any) => x1(d.key))
        .attr('y', (d: any) => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', (d: any) => y(0)! - y(d.value)!)
        .attr('fill', (d: any) => color(d.key));

      svg.append('g')
        .call(xAxis);

      svg.append('g')
        .call(yAxis);

      svg.append('g')
        .call(legend);

      svg.append('text')
        .attr('transform', `translate(45,${height - margin.bottom + 35})`)
        .attr('text-align', 'start')
        .attr('font-size', '11')
        .attr('font-weight', 'bold')
        .text('Renders');

      svg.append('text')
        .attr('transform', `translate(${width - 12},${height - margin.bottom + 35})`)
        .attr('text-anchor', 'end')
        .attr('font-size', '11')
        .attr('font-weight', 'bold')
        .attr('class', 'total')
        .text(`${TOTAL_AUTOMATION_TIME_ELAPSED}: ${totalTimeElapsed} ms`);

      svg.append('text')
        .attr('transform', `translate(${width - 12},${height - margin.bottom + 55})`)
        .attr('text-anchor', 'end')
        .attr('font-size', '11')
        .attr('font-weight', 'bold')
        .attr('class', 'interactions')
        .text(`${NUMBER_OF_INTERACTIONS}: ${interactions.shift()}`);

      svg.select('.total')
        .on('mouseover', () => {
          const h4 = document.querySelector('h4');
          h4!.style.opacity = '1';
          h4!.innerHTML =
            `${TOTAL_AUTOMATION_TIME_ELAPSED}: ${paragraphs[TOTAL_AUTOMATION_TIME_ELAPSED]}`;
        })
        .on('mouseout', () => {
          document.querySelector('h4')!.style.opacity = '0';
        });

      svg.select('.interactions')
        .on('mouseover', () => {
          const h4 = document.querySelector('h4');
          h4!.style.opacity = '1';
          h4!.innerHTML =
            `${NUMBER_OF_INTERACTIONS}: ${paragraphs[NUMBER_OF_INTERACTIONS]}`;
        })
        .on('mouseout', () => {
          document.querySelector('h4')!.style.opacity = '0';
        });

      svg.selectAll('rect')
        .on('mouseover', e => {
          const { key: keyString } = (e as MouseMoveEvent).target['__data__'];
          if (keyString) {
            const h4 = document.querySelector('h4');
            h4!.style.opacity = '1';
            h4!.innerHTML = `${keyString}: ${paragraphs[keyString as ParagraphString]}`;

            const span = document.querySelector('#big-tooltip span');
            span!.innerHTML = `${keyString}: ${(e as MouseMoveEvent).target['__data__'].value} ms`;
            (span as HTMLElement)!.style.opacity = '1';

            (e as MouseMoveEvent).target.style.outline = '1px solid white';
          }
        })
        .on('mouseout', e => {
          const span = document.querySelector('#big-tooltip span');
          span!.innerHTML = '';
          (span as HTMLElement)!.style.opacity = '0';

          (e as MouseMoveEvent).target.style.outline = 'none';
          document.querySelector('h4')!.style.opacity = '0';
        });

      return svg.node();
    };

    chart();
  }
  if (bodyWidth) document.body.style.width = `${bodyWidth}px`;
})();
