export function getPointerEventPositionRelativeToTarget(event: PointerEvent) {
  const targetElement = event.target as HTMLElement;
  const targetClientRect = targetElement.getBoundingClientRect();

  return {
    x: event.clientX - targetClientRect.x,
    y: event.clientY - targetClientRect.y,
  };
}
