export default{
    template:`
    <div>
    <h1 class="text-center my-4">Service Requests</h1>
    <div class="container" style="max-width: 800px;">
        <table class="table table-striped table-bordered text-centre">
            <thead class="table-primary">
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Professional ID</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in serviceHistory" :key="service.id">
                    <th scope="row">{{ service.id }}</th>
                    <td>{{ service.professional_id}}</td>
                    <td>{{ service.date_of_request }}</td>
                    <td>{{ service.service_status}}</td>
                </tr>
            </tbody>
        </table>
        </div>

</div>

`,
data(){
  return{
    serviceHistory:[]
  }
},

methods:{
    async fetchHistory() {
        try {
          const response = await fetch(location.origin + "/api/service_booked_history", {
            method: 'GET',
            headers: {
              'Authentication-Token': this.$store.state.auth_token
            }
          });
  
          if (response.ok) {
            const data = await response.json();
            this.serviceHistory = data; // Populate the history table
            console.log("Fetched service history:", data);
          } else {
            console.error("Failed to fetch history:", response.status);
          }
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      },
     
},
mounted(){
    this.fetchHistory()
}
}

