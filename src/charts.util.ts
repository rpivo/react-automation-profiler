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
    ` Time spent rendering the Profiler and its descendants for the current update. This 
      indicates how well the subtree makes use of memoization (e.g. React.memo, useMemo, 
      shouldComponentUpdate). Ideally this value should decrease significantly after the initial 
      mount as many of the descendants will only need to re-render if their specific props 
      change.`,
  [ParagraphMap.BASE_DURATION]:
    ` Duration of the most recent render time for each individual component within the Profiler 
      tree. This value estimates a worst-case cost of rendering (e.g. the initial mount or a tree
      with no memoization).`,
  [ParagraphMap.NUMBER_OF_INTERACTIONS]: `The total number of page interactions that occurred during the 
    automation flow.`,
  [ParagraphMap.TOTAL_AUTOMATION_TIME_ELAPSED]:
    ` The total time that elapsed during the automation flow. This does not indicate the total 
      render time, but rather the total time it took for the automation to complete its flow.`,
};

export const createCarousel = (carouselId: string) => {
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
};

export const createSVG = (id: number) => {
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.setAttribute('id', `chart-${id}`);
  svgEl.setAttribute('height', '575');
  return svgEl;
};

const handleArrowClick = (e: MouseClickEvent, arrowType: ArrowTypes.LEFT | ArrowTypes.RIGHT) => {
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
};

export const handleMouseOut = (e?: MouseMoveEvent) => {
  document.querySelector('h4')!.style.opacity = '0';
  if (e) {
    const span = document.querySelector('#big-tooltip span');
    span!.innerHTML = '';
    (span as HTMLElement)!.style.opacity = '0';
    (e as MouseMoveEvent).target.style.outline = 'none';
  }
};

export const handleMouseOver = (name?: string, e?: MouseMoveEvent) => {
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
};

export const updateTooltipPosition = (e: MouseEvent) => {
  const windowWidth = window.innerWidth;
  const tooltip = document.getElementById('big-tooltip');
  const { clientX, clientY }: { clientX: number; clientY: number } = e;
  const rightBuffer = windowWidth - 350;

  tooltip!.style.left =
    `${clientX > rightBuffer ? clientX - (clientX - rightBuffer) : clientX}px`;
  tooltip!.style.top = `${clientY}px`;
};
