import mitt from 'mitt'
type Events = {
  resize: void
  select: { id: string }
}
export const eventBus = mitt<Events>()