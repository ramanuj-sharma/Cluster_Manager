import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Key } from 'src/api/Key';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  key: Key = new Key("","","")
  token_visible = false
  pending = false
  state?: boolean

  constructor(private api: ApiService, private sservice: SidenavService) { }

  /**
   * Sets up the content hint in the Quick Response Panel and loads the {@link Key} from the backend.
   */
  ngOnInit(): void {
    this.sservice.clear()
    this.sservice.setTitle("The Individual Way")
    this.sservice.setSubtitle("Why you need configuration")
    this.sservice.addSoloItem("Celonis EMS", "Cluster Manager allows you to personalize your user experience. To that end, some data is required to establish a connection to the Celonis EMS servers. An API access token allows you to savely communicate with the EMS.")
    this.sservice.addSoloItem("Your Advantages", "All necessary information is automatically provided by the EMS. That way, all your data integrated into Celonis is available from within the Cluster Manager, including live updated tables, aliasing, and pool management. No upload of data is required.")
    this.api.getKey().then(key => this.key = key)
  }

  /**
   * Sends the current key information to the backend.
   */
  save() {
    this.pending = true
    this.api.setKey(this.key).then(res => {
      this.pending = false
      this.state = res
    })
  }
}
