export default {
    template: `
      <div>

      <div v-if="actionMessage" class="alert alert-success">
      {{ actionMessage }}
      </div>

          <nav class="navbar navbar-light bg-light py-4">
              <div class="container-fluid">
              <span class="navbar-text" style="
              font-size: 2.5rem; 
              color: #007bff; 
              font-weight: bold; 
              font-style: italic;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); 
              padding: 0.5rem 1rem; 
              border-radius: 8px;">
              Welcome Professional
             </span>
                <div class="d-flex">

                      <button @click='logout' class='nav-link' style="font-size: 1.2rem; color:red;">Logout</button>
                  </div>
              </div>   
          </nav>


        <button  @click="viewProfile" style='background-color:light'> 
        <div class="col-md-1 text-end">
          <div class=" border rounded">
            <h4 style='color:red'>Profile</h4>
          </div>
        </div>
        </button>

        <div class='text-center'>
         <h1>Today's Services</h1>
        </div>

        <div class="container mt-5">
            <table class="table table-bordered">
            <thead>
            <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="request in serviceRequest" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.customer_name }}</td>
          <td>{{ request.address }},{{ request.pin}}</td>
          <td>{{ request.phone}}</td>

          <td>
            <button class="btn btn-info" @click="acceptRequest(request)">
              Accept
            </button>
            <button class="btn btn-info" @click="rejectRequest(request)">
              Reject
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>


    <div class='text-center'>
         <h1>Closed Services</h1>
        </div>

        <div class="container mt-5">
            <table class="table table-bordered">
            <thead>
            <tr>
            <th>ID</th>
            <th>Customer ID</th>
            <th>Date of Request</th>
            <th>Status</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="history in serviceHistory" :key="history.id">
          <td>{{ history.id }}</td>
          <td>{{ history.customer_id }}</td>
          <td>{{ history.date_of_request}}</td>
          <td>{{ history.service_status}}</td>

        </tr>
      </tbody>
    </table>
    </div>



    
    <div v-if="showDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Profile</h5>
                <button type="button" class="close" @click="closeDetailsModal">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Username:</strong> {{ professional.username }}</p>
                <p><strong>Email:</strong> {{ professional.email }}</p>
                <p><strong>Phone:</strong> {{ professional.phone }}</p>
                <p><strong>Address:</strong> {{ professional.address }}</p>
                <p><strong>Pin:</strong> {{ professional.pin }}</p>
                <p><strong>Service:</strong> {{ professional.service_name }}</p>
                <p><strong>Experience:</strong> {{ professional.experience }}</p>
                <p><strong>Description:</strong> {{ professional.description }}</p>
                <button type="button" class="btn btn-primary mt-2" @click="openEditModal">Edit</button> 
            </div>
        </div>
    </div>
</div>




<!-- Edit Profile Modal -->
<div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
<div class="modal-dialog">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Edit Profile</h5>
            <button type="button" class="close" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
            <form @submit.prevent="updateProfile">
                <div class="form-group">
                    <label>Username</label>
                    <input v-model="professional.username" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="professional.email" type="email" class="form-control">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input v-model="professional.phone" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input v-model="professional.address" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label>Pin</label>
                    <input v-model="professional.pin" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label>Experience</label>
                    <input v-model="professional.experience" type="number" class="form-control">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea v-model="professional.description" class="form-control"></textarea>
                </div>
                <button type="submit" class="btn btn-primary mt-3">Save Changes</button>
            </form>
        </div>
    </div>
</div>
</div>




</div>        
`,

data(){
    return{
        serviceRequest:[],
        showDetailsModal:false,
        showEditModal:false, 
        professional:null,
        editedProfessional: {},
        actionMessage: '',
        serviceHistory: [],
    }
},

methods: {
    async fetchRequest() {
      try {
        const response = await fetch(location.origin + "/api/professional_service_requests",{
            method:'GET',
            headers: {
            'Authentication-Token':  this.$store.state.auth_token
                    }
        })
        
        if (response.ok) {
          const data = await response.json();
          this.serviceRequest = data.filter(request => request.status !== 'Accepted' && request.status !== 'Rejected');  
          console.log("Fetched requests:", this.serviceRequest);
        } else {
          console.error("Failed to fetch requests:", response.status);
        }
      } catch (error) {
        console.error("Error fetching request:", error);
      }
    },

    async viewProfile() {
        try {
          const response = await fetch(location.origin + "/api/professionals", {
            method: 'GET',
            headers: {
              'Authentication-Token':  this.$store.state.auth_token  
            },
          });
      
          if (response.ok) {
            const data = await response.json();
            this.professional = data[0];
            this.showDetailsModal = true;  
            console.log("Professional details:", data);
          } else {
            console.error("Failed to fetch professional details:", response.status);
          }
        } catch (error) {
          console.error("Error fetching professional details:", error);
        }
      },


      viewProfessional(professional) {
        this.professional = professional;
        this.showDetailsModal = true;
    },

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.professional = null;
    },



    async updateProfile() {
        try {
          const response = await fetch(location.origin + "/api/professionals", {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify(this.professional),
          });

          if (response.ok) {
            const updatedProfessional = await response.json();
            this.professional = updatedProfessional;  
            console.log("Profile updated successfully");
          } else {
            console.error("Failed to update profile:", response.status);
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      },
    

    openEditModal(){
        this.showEditModal = true;
    },

    closeEditModal() {
        this.showEditModal = false;
      },



      async acceptRequest(request) {
        try {
          // Send the accept request to the backend API
          const response = await fetch(location.origin + "/api/accept_service_request", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token
            },
            body: JSON.stringify({ request_id: request.id })
          });
  
          if (response.ok) {
            const updatedRequest = this.serviceRequest.find(r => r.id === request.id);
            if (updatedRequest) updatedRequest.status = 'Accepted';
            this.actionMessage = `Request from ${request.customer_name} accepted.`;
            this.serviceRequest = this.serviceRequest.filter(r => r.id !== request.id);
            console.log("Request accepted");
          } else {
            console.error("Failed to accept request:", response.status);
          }
        } catch (error) {
          console.error("Error accepting request:", error);
        }
      },
  
      async rejectRequest(request) {
        try {
          // Send the reject request to the backend API
          const response = await fetch(location.origin + "/api/reject_service_request", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token
            },
            body: JSON.stringify({ request_id: request.id })
          });
  
          if (response.ok) {
            // Update the status on the frontend if successful
            const updatedRequest = this.serviceRequest.find(r => r.id === request.id);
            if (updatedRequest) updatedRequest.status = 'Rejected';
            this.actionMessage = `Request from ${request.customer_name} rejected.`;
            this.serviceRequest = this.serviceRequest.filter(r => r.id !== request.id); // Remove from list
            console.log("Request rejected");
          } else {
            console.error("Failed to reject request:", response.status);
          }
        } catch (error) {
          console.error("Error rejecting request:", error);
        }
      },

      async fetchHistory() {
        try {
          const response = await fetch(location.origin + "/api/service_request_history", {
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


      logout(){
        this.$store.commit('logout');
        localStorage.clear(); 
        this.$router.replace('/login');

        window.history.pushState(null, '', window.location.href);
        window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    }
  }
      

},

async mounted(){
    await this.fetchRequest(),
    await this.fetchHistory()
}

}