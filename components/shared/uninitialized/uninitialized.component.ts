import { Component } from '@angular/core';

/**
 * Data uninitialized div, can use class and style
 * @interface class Custom class list
 *
 * @member f0: flex 0
 * @member w100: width 100%
 * @member nh100: min-height 100%
 */
@Component({
  selector: 'uninitialized',
  templateUrl: './uninitialized.component.html',
  styleUrls: ['./uninitialized.component.sass'],
  host: {
    class: 'uninitialized_section',
  }
})
export class UninitializedComponent {

  constructor() { }
}
