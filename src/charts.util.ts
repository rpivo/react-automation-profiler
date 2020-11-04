import { getFileName } from './util.js';

export type MouseMoveEvent = {
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

interface MouseClickEvent extends MouseEvent {
  path: NodeList;
}

type ParagraphString =
  | 'Actual Duration'
  | 'Base Duration'
  | 'Number of Interactions'
  | 'Total Automation Time Elapsed';
  
enum ArrowTypes {
  LEFT = 'left',
  RIGHT = 'right'
}

export enum MouseEventSelectors {
  INTERACTIONS = 'interactions',
  RECT = 'rect',
  TOTAL = 'total'
}

export enum ParagraphMap {
  ACTUAL_DURATION = 'Actual Duration',
  BASE_DURATION = 'Base Duration',
  NUMBER_OF_INTERACTIONS = 'Number of Interactions',
  TOTAL_AUTOMATION_TIME_ELAPSED = 'Total Automation Time Elapsed',
}

export const paragraphs: { [key in ParagraphMap]?: string } = {
  [ParagraphMap.ACTUAL_DURATION]:
    ` The total time it actually took the component and its subtree to render. This should \
      ideally be lower than Base Duration after successive renders if memoization techniques are \
      in place.`,
  [ParagraphMap.BASE_DURATION]:
    ` The total time it normally would take the component and its subtree to render. This does not \
      take into account memoization for the component and its children.`,
  [ParagraphMap.NUMBER_OF_INTERACTIONS]:
    ` The total number of page interactions that occurred during the automation flow.`,
  [ParagraphMap.TOTAL_AUTOMATION_TIME_ELAPSED]:
    ` The total time that elapsed during the automation flow. This doesn't indicate the total \
      render time, but instead the time it took for the automation to complete. This \
      is calculated by taking the highest commitTime of all renders and subtracting the lowest \
      startTime of all renders, which indicates the length of time from when the \
      automation began to when it ended.`,
};

export function addExportListener() {
  const exportEl = document.querySelector('#export');
  exportEl?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = getFileName('react-automation-profiler', 'html').toLowerCase();
    a.href = 'export.html';
    a.click();
    a.remove();
  });
}

export function createCarousel(carouselId: string) {
  let carouselEl = document.createElement('div');
  carouselEl.classList.add('carousel');
  carouselEl.setAttribute('id', `${carouselId}`);

  const arrowWrapperEl = document.createElement('div');
  arrowWrapperEl.classList.add('arrow-wrapper');

  const arrowLeftEl = document.createElement('div');
  arrowLeftEl.classList.add('arrow', 'arrow-left');
  arrowLeftEl.addEventListener(
    'click',
    e => handleArrowClick(e as MouseClickEvent, ArrowTypes.LEFT),
  );
  arrowLeftEl.innerHTML = '◄';

  const arrowRightEl = document.createElement('div');
  arrowRightEl.classList.add('arrow', 'arrow-right');
  arrowRightEl.addEventListener(
    'click',
    e => handleArrowClick(e as MouseClickEvent, ArrowTypes.RIGHT),
  );
  arrowRightEl.innerHTML = '►';

  const h5El = document.createElement('h5');
  h5El.innerHTML = 'Version 1 of 1';

  arrowWrapperEl.appendChild(arrowLeftEl);
  arrowWrapperEl.appendChild(h5El);
  arrowWrapperEl.appendChild(arrowRightEl);

  carouselEl.appendChild(arrowWrapperEl);

  return carouselEl;
}

export function createSVG(id: number) {
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('id', `chart-${id}`);
  svgEl.setAttribute('height', '575');
  return svgEl;
}

function handleArrowClick(e: MouseClickEvent, arrowType: ArrowTypes.LEFT | ArrowTypes.RIGHT) {
  const { LEFT, RIGHT } = ArrowTypes;

  const carousel = e.path[2];
  const SVGs = (carousel as HTMLElement).querySelectorAll('svg');
  const h5El = (carousel as HTMLElement).querySelector('h5');
  const visibleSVGIndex = Array
    .from(SVGs)
    .findIndex(item => !Array.from(item.classList).includes('hidden'));

  if (
    (arrowType === LEFT && visibleSVGIndex === 0) ||
    (arrowType === RIGHT && visibleSVGIndex === SVGs.length - 1)
  ) return;

  const indexToUpdate = arrowType === LEFT ? visibleSVGIndex - 1 : visibleSVGIndex + 1;

  SVGs[indexToUpdate].classList.remove('hidden');
  SVGs[visibleSVGIndex].classList.add('hidden');

  h5El!.innerHTML = `Version ${indexToUpdate + 1} of ${SVGs.length}`;
}

export function handleMouseOut(e?: MouseMoveEvent) {
  document.querySelector('h4')!.style.opacity = '0';
  if (e) {
    const span = document.querySelector('#big-tooltip span');
    span!.innerHTML = '';
    (span as HTMLElement)!.style.opacity = '0';
    (e as MouseMoveEvent).target.style.outline = 'none';
  }
}

export function handleMouseOver(name?: string, e?: MouseMoveEvent) {
  const { INTERACTIONS, RECT, TOTAL } = MouseEventSelectors;
  const { NUMBER_OF_INTERACTIONS, TOTAL_AUTOMATION_TIME_ELAPSED } = ParagraphMap;
  const h4 = document.querySelector('h4');

  switch (name) {
    case INTERACTIONS:
      h4!.innerHTML =
        `${NUMBER_OF_INTERACTIONS}: ${paragraphs[NUMBER_OF_INTERACTIONS]}`;
      h4!.style.opacity = '1';
      break;
    case RECT:
      const { key: keyString } = (e as MouseMoveEvent).target['__data__'];
      if (keyString) {
        h4!.innerHTML = `${keyString}: ${paragraphs[keyString as ParagraphString]}`;
        h4!.style.opacity = '1';

        const span = document.querySelector('#big-tooltip span');
        span!.innerHTML = `${keyString}: ${(e as MouseMoveEvent).target['__data__'].value} ms`;
        (span as HTMLElement)!.style.opacity = '1';
      
        (e as MouseMoveEvent).target.style.outline = '1px solid white';
      }
      break;
    case TOTAL:
      h4!.innerHTML =
      `${TOTAL_AUTOMATION_TIME_ELAPSED}: ${paragraphs[TOTAL_AUTOMATION_TIME_ELAPSED]}`;
      h4!.style.opacity = '1';
      break;
    default:
      break;
  }
}

export function initCarouselState(carouselIds: string[]) {
  for (const id of carouselIds) {
    const charts = document.querySelectorAll(`div#${id} svg`);
    const h5El = document.querySelector(`div#${id} h5`);
    const chartCount = charts.length;

    charts.forEach((chart, index) => {
      if (index === chartCount - 1) return;
      chart.classList.add('hidden');
    });
    h5El!.innerHTML = `Version ${chartCount} of ${chartCount}`;
  }
}

export function updateTooltipPosition(e: MouseEvent) {
  const windowWidth = window.innerWidth;
  const tooltip = document.getElementById('big-tooltip');
  const { clientX, clientY }: { clientX: number; clientY: number } = e;
  const rightBuffer = windowWidth - 350;

  tooltip!.style.left =
    `${clientX > rightBuffer ? clientX - (clientX - rightBuffer) : clientX}px`;
  tooltip!.style.top = `${clientY}px`;
}
