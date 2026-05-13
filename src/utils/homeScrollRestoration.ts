let savedHomeScrollTop: number | null = null;
let shouldRestoreHomeScroll = false;

const getDocumentScrollElement = () =>
  (document.scrollingElement || document.documentElement) as HTMLElement;

const getHomePageElement = () => document.querySelector<HTMLElement>('.home-page');

const isScrollable = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return (
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    element.scrollHeight - element.clientHeight > 1
  );
};

const getHomeScrollContainers = () => {
  const containers = new Set<HTMLElement>();
  const homePage = getHomePageElement();

  let parent = homePage?.parentElement || null;
  while (parent) {
    if (isScrollable(parent)) {
      containers.add(parent);
    }
    parent = parent.parentElement;
  }

  document
    .querySelectorAll<HTMLElement>('.zaui-page, .zaui-page-content, .zaui-page-container, .home-page')
    .forEach((element) => {
      if (isScrollable(element) && (!homePage || element === homePage || element.contains(homePage))) {
        containers.add(element);
      }
    });

  return Array.from(containers);
};

const getCurrentHomeScrollTop = () => {
  const documentTop = window.scrollY || getDocumentScrollElement().scrollTop || 0;
  const containerTop = getHomeScrollContainers().reduce((max, element) => Math.max(max, element.scrollTop), 0);
  return Math.max(documentTop, containerTop);
};

export const saveHomeScrollPosition = () => {
  if (typeof window === 'undefined') return;

  savedHomeScrollTop = Math.max(0, Math.round(getCurrentHomeScrollTop()));
  shouldRestoreHomeScroll = true;
};

export const clearHomeScrollRestoration = () => {
  savedHomeScrollTop = null;
  shouldRestoreHomeScroll = false;
};

export const consumeHomeScrollRestoration = () => {
  if (!shouldRestoreHomeScroll || savedHomeScrollTop === null) {
    return null;
  }

  const scrollTop = savedHomeScrollTop;
  shouldRestoreHomeScroll = false;
  return scrollTop;
};

export const restoreHomeScrollPosition = (scrollTop: number) => {
  if (typeof window === 'undefined') return;

  const applyScroll = () => {
    const documentScrollElement = getDocumentScrollElement();
    window.scrollTo(0, scrollTop);
    documentScrollElement.scrollTop = scrollTop;
    getHomeScrollContainers().forEach((element) => {
      element.scrollTop = scrollTop;
    });
  };

  requestAnimationFrame(applyScroll);
  requestAnimationFrame(() => requestAnimationFrame(applyScroll));
  window.setTimeout(applyScroll, 80);
};
