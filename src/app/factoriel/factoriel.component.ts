import { Component, NgZone , OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorService } from '../shared/behavior.service';


@Component({
  selector: 'app-factorial',
  templateUrl: './factoriel.component.html',
  styleUrls: ['./factoriel.component.css']
})
export class FactorialComponent implements OnInit {
  numberInput: number | null = null; // To bind the input field
  progress: number = 0;
  result: number | null = null;


  constructor(private http: HttpClient,
    private zone: NgZone,
    public send:BehaviorService) {}

   ngOnInit() {
    let resultat =this.getAllNews();
    console.log(" test api Operation ",JSON.stringify(resultat))
      }


  getAllNews(){
    return this.http.get<any>('https://script.googleusercontent.com/macros/echo?user_content_key=98wZu5YKOVggNrOQoRVbfgWcB5_MbMHxAmZekXKol1zbA1nhgtWHh8Gnmn1G41a6cPof_Oo2MZNxMxv_SluggfnXZhmHvkmSm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnOZden1ewJ9JvUgZU4tRoBnIlsl_QMw1CG_1TCAq0LDLMWZtVOcL2-3YLHjJJeGyaKIF-L_b1ET_pyBpfcZAw-ykqG58xVo2C9z9Jw9Md8uu&lib=MCLBqBtrw4yJazfRJYB5InOzNkRQCIOg8');
  }
  calculateFactorial() {
    const body:any = { method: 'factoriel','filePath':"log_local_selfAnalytics_203505114050124", "number":this.numberInput };

    // Step 1: Send POST request to initiate computation
    this.http.post('http://localhost:5000/MonotoringFlux', body).subscribe(() => {
        // Step 2: Listen for progress updates via SSE
        const eventSource = new EventSource('http://localhost:5000/MonotoringFlux');

        eventSource.onmessage = (event) => {
            var  data0 = JSON.parse(event.data);
            console.log(typeof(data0)," data key  ",Object.keys(data0), " data ",data0)
          
            const data = data0['result'];
            //this.progress = data.progress;
            console.log(typeof(data)," data ",data)
            this.zone.run(() => {
              this.progress = data0.progress;
              this.result = data0.status //|| data.final_result;
              console.log("progress ",this.progress ," resultat ",this.result)
             
              this.send.SendMonotoring.next({'progress':this.progress});
  
            });

          if (data0.progress === 100) {
              eventSource.close();
          }


          /*  console.log(this.progress," progress ",JSON.stringify(data))
            if (data.final_result) {
                this.result = data.final_result;
                console.log(" final ",this.result)
                eventSource.close(); // Close the connection when finished
            }*/
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };
    });
}

monotoringFlow(filePath:string) {
  const body:any = { method: 'factoriel','filePath':filePath, "number":this.numberInput };

  // Step 1: Send POST request to initiate computation
  this.http.post('http://localhost:5000/MonotoringFlux', body).subscribe(() => {
      // Step 2: Listen for progress updates via SSE
      const eventSource = new EventSource('http://localhost:5000/MonotoringFlux');

      eventSource.onmessage = (event) => {
          var  data0 = JSON.parse(event.data);
          console.log(typeof(data0)," data key  ",Object.keys(data0), " data ",data0)
        
          const data = data0['result'];
          //this.progress = data.progress;
          console.log(typeof(data)," data ",data)
          this.zone.run(() => {
            this.progress = data0.progress;
            this.result = data0.status //|| data.final_result;
            console.log("progress ",this.progress ," resultat ",this.result)
            this.send.SendMonotoring.next({'progress':this.progress});
    
      });

        if (data0.progress === 100) {
            eventSource.close();
        }

      };

      eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          eventSource.close();
      };
  });
}

}

