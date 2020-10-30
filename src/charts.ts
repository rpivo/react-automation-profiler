import * as d3 from 'd3';
import {
  addExportListener,
  createCarousel,
  createSVG,
  handleMouseOut,
  handleMouseOver,
  initCarouselState,
  MouseEventSelectors,
  MouseMoveEvent,
  ParagraphMap,
  updateTooltipPosition,
} from './charts.util';

type Columns = {
  columns: ['Render', typeof ACTUAL_DURATION, typeof BASE_DURATION];
};

type Item = {
  [key in ParagraphMap]?: number;
} & {
  actualDuration?: number;
  baseDuration?: number;
  commitTime: number;
  id?: string;
  interactions?: [];
  phase?: string;
  Render?: string;
  startTime: number;
};

type ProfilerLogs = {
  logs: Item[];
  numberOfInteractions: number;
};

const { INTERACTIONS, RECT, TOTAL } = MouseEventSelectors;

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

  const allJsonValues: number[] = [];
  const carouselIds = [];
  const interactions: number[] = [];
  const itemIdLengths: number[] = [];
  const jsonData = [];

  d3.select('html').on('mousemove', e => updateTooltipPosition(e as MouseEvent));

  const { columns: jsonFiles } = await d3.dsv(' ', 'jsonList.dsv');

  for (const file of jsonFiles) jsonData.push(
    await d3
      .json(`${file}`)
      .then(data => {
        interactions.push((data as ProfilerLogs).numberOfInteractions);

        return (data as ProfilerLogs).logs.map((item: Item, index) => {
          item[ACTUAL_DURATION] = item.actualDuration;
          item[BASE_DURATION] = item.baseDuration;

          item.Render = `${index + 1}: ${item.id}`;

          allJsonValues.push((item[ACTUAL_DURATION] as number), (item[BASE_DURATION] as number));
          itemIdLengths.push(item!.id!.length);

          delete item.actualDuration;
          delete item.baseDuration;
          delete item.id;
          delete item.interactions;
          delete item.phase;

          return item;
        });
      })
  );

  const longestId = Math.max(...itemIdLengths);
  const tallestRect = Math.max(...allJsonValues);
  const scaleMax = Math.round((tallestRect + (tallestRect * 0.05)) * 10) / 10;

  for (const [id, file] of jsonFiles.entries()) {
    const [singularId, multipleId] = file.split('-');
    const carouselId = singularId === 'average' ? multipleId : singularId;

    carouselIds.push(carouselId);
    let carouselEl = document.getElementById(carouselId);

    if (!carouselEl) {
      carouselEl = createCarousel(carouselId);

      const h2El = document.createElement('h2');
      let innerText = carouselId.replace(/([^A-Z])([A-Z])/g, '$1 $2');
      innerText = innerText[0].toUpperCase() + innerText.substring(1);
      h2El.innerText = innerText;
      carouselEl.appendChild(h2El);

      document.body.appendChild(carouselEl);
    }

    const svgEl = createSVG(id);
    carouselEl.appendChild(svgEl);

    const data = Object.assign(
      jsonData[id],
      { columns: ['Render', ACTUAL_DURATION, BASE_DURATION] },
    ) as Item[] & Columns;

    const totalTimeElapsed = data[data.length - 1].commitTime - data[0].startTime;

    const potentialWidth = (~~(data.length / 10) * 875) + (Math.abs((longestId - 5)) * 150) - 1000;
    width = potentialWidth > 1000 ? potentialWidth : 1000;
    const potentialBodyWidth = width + 600;
    if (bodyWidth < potentialBodyWidth) bodyWidth = potentialBodyWidth;

    svgEl.setAttribute('width', `${width}`);

    const [groupKey, ...keys] = data.columns;

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
        .on('mouseover', () => handleMouseOver(TOTAL))
        .on('mouseout', () => handleMouseOut());

      svg.select('.interactions')
        .on('mouseover', () => handleMouseOver(INTERACTIONS))
        .on('mouseout', () => handleMouseOut());

      svg.selectAll('rect')
        .on('mouseover', e => handleMouseOver(RECT, e as MouseMoveEvent))
        .on('mouseout', e => handleMouseOut(e as MouseMoveEvent));

      return svg.node();
    };

    chart();
  }

  initCarouselState(carouselIds);
  addExportListener();

  if (bodyWidth) document.body.style.width = `${bodyWidth}px`;
})();
