import { Component, input, output } from '@angular/core';

import { ClassSession } from '../../../../models/class-session';

@Component({
  selector: 'app-session-created-dialog',
  standalone: true,
  imports: [],
  templateUrl: './session-created-dialog.html',
  styleUrl: './session-created-dialog.scss'
})
export class SessionCreatedDialog {

  readonly session =
    input.required<ClassSession>();

  readonly enter =
    output<void>();

  readonly close =
    output<void>();

}