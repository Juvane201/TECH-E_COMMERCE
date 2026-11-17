import { Component, input } from '@angular/core';

@Component({
  selector: 'app-bttn-primary',
  imports: [],
  templateUrl: './bttn-primary.component.html',
  styleUrl: './bttn-primary.component.css'
})
export class BttnPrimaryComponent {

  label = input('');

}
