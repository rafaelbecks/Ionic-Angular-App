import { AbsoluteDrag } from './drag-event/absolute-drag';
import { AbsoluteDragChroma } from './drag-event/absolute-drag-chroma';
import { DoubleTap } from './tap-event/double-tap';
import { NgModule } from '@angular/core';
import { RotateCustomeDirective } from './rotate-event/rotate-event';
@NgModule({
	declarations: [RotateCustomeDirective, DoubleTap, AbsoluteDrag, AbsoluteDragChroma],
	imports: [],
	exports: [RotateCustomeDirective, DoubleTap, AbsoluteDrag, AbsoluteDragChroma]
})
export class DirectivesModule {}
