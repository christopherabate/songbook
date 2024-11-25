export class AutoScroll {
  constructor(element, durationInSeconds) {
    this.element = element || window;
    this.duration = durationInSeconds * 1000;
    this.animationFrameId = null;
    this.startTime = null;
    this.scrollDistance = null;
    this.eventHandlers = [];
  }

  bindEvents() {
    const events = ['mousedown', 'wheel', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'pointerdown'];
    const handler = this.pause.bind(this, true);
    this.eventHandlers = events.map(event => ({ event, handler }));
    this.eventHandlers.forEach(({ event, handler }) => {
      this.element.addEventListener(event, handler);
    });
  }

  unBindEvents() {
    this.eventHandlers.forEach(({ event, handler }) => {
      this.element.removeEventListener(event, handler);
    });
    this.eventHandlers = [];
  }

  play(onFinishCallback) {
    this.bindEvents();
    this.onFinishCallback = onFinishCallback;
    const scrollHeight = this.element.scrollHeight;
    const scrollDistance = scrollHeight - this.element.clientHeight;
    const startScrollTop = this.element.scrollTop;

    if (scrollDistance <= 0) {
      this.onFinishCallback?.();
    }

    this.scrollDistance = scrollDistance;

    const animate = (timestamp) => {
      if (!this.startTime) this.startTime = timestamp;
      const elapsed = timestamp - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      this.element.scrollTop = startScrollTop + (progress * scrollDistance);

      const tolerance = 1;
      if (this.element.scrollTop + this.element.clientHeight >= scrollHeight - tolerance) {
        this.pause(false);
        this.onFinishCallback?.();
      } else {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.startTime = performance.now();
    this.animationFrameId = requestAnimationFrame(animate);
  }

  pause(calledByUser = false) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.unBindEvents();
    }
    this.startTime = null;
    if (calledByUser) {
      this.onFinishCallback?.();
    }
  }
}
