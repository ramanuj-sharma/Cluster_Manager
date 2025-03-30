import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Key } from 'src/api/Key';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

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
    this.sservice.setTitle("About Us")
    this.sservice.addSoloItem("Celonis", 'Celonis is the global leader in execution management. The Celonis Execution Management System provides companies a modern way to run their business processes entirely on data and intelligence. We pioneered the process mining category 10 years ago when we first developed the ability to automatically X-ray processes and find inefficiencies.')
    this.sservice.addSoloItem("Celonis EMS", '<a href="https://www.celonis.com">Celonis EMS</a> helps you to not just understand your processes, but to run your entire business on data and intelligence. It provides capabilities for Real-Time Data Ingestion, Process and Task Mining, Planning and Simulation, Visual and Daily Management, and Action Flows.')
    this.sservice.addListItem("The Company", "3000+ Employees", "3000+ Enterprise Customer Deployments", "$13 Billion Valuation")
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
