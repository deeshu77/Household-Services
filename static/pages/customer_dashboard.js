import RatingForm from "./customer_rating.js";

export default {
  template: `
    <div>
    <div v-if="showBookedMessage" class="alert alert-success text-center">
      <strong>Service successfully booked!</strong>
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
            Welcome Customer
           </span>
              <div class="d-flex">
    
                    <button @click='logout' class='nav-link' style="font-size: 1.2rem; color:red">Logout</button>
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



        <div class="text-center">
         <h1>Services</h1>
        </div>

        <div class="container text-center">
        <div class="row justify-content-center">
          <div v-for="service in services" :key="service.id" class="col-md-3 mb-4">
            <button @click="selectService(service)" class="btn w-100 p-4 shadow-none" style="background-color: #17a2b8; color: white; border-radius: 12px;">
              <h5>{{ service.name }}</h5>
            </button>
          </div>
        </div>
      </div>
      
    <div v-if="professionals.length > 0" class="container mt-5">
    <h2>Professionals who provide this service:</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Professional Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Contact</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="professional in professionals" :key="professional.id">
          <td>{{ professional.user_id}}</td>
          <td>{{ professional.username }}</td>
          <td>{{ professional.description }}</td>
          <td>{{ professional.price }}</td>
          <td>{{ professional.phone }}</td>

          <td>
          <button 
          class="btn btn-info" 
          @click="bookService(professional)">Book
        </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="container mt-5">
  <h2>Service History</h2>
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>Service ID</th>
        <th>Professional ID</th>
        <th>Date of request</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="request in serviceHistory" :key="request.id">
        <td>{{ request.id}}
        <td>{{ request.professional_id }}</td>
        <td>{{ request.date_of_request }}</td>
        <td>{{ request.service_status }}</td>
        <td><button 
        v-if="request.service_status === 'Accepted'" 
        class="btn btn-danger btn-sm" 
        @click="openRatingForm(request)"
      >
        Close 
      </button>
      </td>
      </tr>
    </tbody>
  </table>
</div>


<rating-form 
    v-if="showRatingForm" 
    :serviceRequestId="serviceRequestId" 
    @close="handleCloseRatingForm">
  </rating-form>








  <div v-if="showDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
  <div class="modal-dialog">
      <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">Profile</h5>
              <button type="button" class="close" @click="closeDetailsModal">&times;</button>
          </div>
          <div class="modal-body">
              <p><strong>Username:</strong> {{ customer.username }}</p>
              <p><strong>Email:</strong> {{ customer.email }}</p>
              <p><strong>Contact:</strong> {{ customer.phone }}</p>
              <p><strong>Address:</strong> {{ customer.address }}</p>
              <p><strong>Pin:</strong> {{ customer.pin }}</p>
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
                  <input v-model="customer.username" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <label>Email</label>
                  <input v-model="customer.email" type="email" class="form-control">
              </div>
              <div class="form-group">
                  <label>Contact</label>
                  <input v-model="customer.phone" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <label>Address</label>
                  <input v-model="customer.address" type="text" class="form-control">
              </div>
              <div class="form-group">
                  <label>Pin</label>
                  <input v-model="customer.pin" type="text" class="form-control">
              </div>
              
              <button type="submit" class="btn btn-primary mt-3">Save </button>
          </form>
      </div>
  </div>
  </div>
  </div>





</div>


 `,
 components:{
  RatingForm
 },
  data() {
    return {
      services: [],
      professionals: [],
      selectedService: null,
      serviceRequest:[],
      serviceHistory:[],
      showDetailsModal:false,
      showEditModal:false,
      customer:null,
      editedCustomer: {},
      bookedServices: [],
      showBookedMessage: false, 
      bookedProfessionalId: null,
      showRatingForm: false ,
      serviceRequestId: null,
    };
  },

  methods: {
    async fetchServices() {
      try {
        const response = await fetch(location.origin + "/api/services",{
            method:'GET',
            headers: {
            'Authentication-Token':  this.$store.state.auth_token
                    }
        })
        
        if (response.ok) {
          const data = await response.json();
          this.services = data;
          console.log("Fetched services:", data);
        } else {
          console.error("Failed to fetch services:", response.status);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    async selectService(service) {
        console.log("Selected service:", service);
        this.selectedService = service;
        await this.fetchProfessionals(service.id); 
      },


    async fetchProfessionals(serviceId) {
        try {
            const response = await fetch(location.origin + `/api/professionals?service_id=${serviceId}`, {
            method: 'GET',
            headers: {
              'Authentication-Token': this.$store.state.auth_token,
              'Content-Type': 'application/json',
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            this.professionals = data; 
            console.log("Fetched professionals:", data);
          } else {
            console.error("Failed to fetch professionals:", response.status);
          }
        } catch (error) {
          console.error("Error fetching professionals:", error);
        }
      },
      async bookService(professional) {
        const serviceId = this.selectedService.id; // Assuming selectedService is the chosen service
        const professionalId = professional.user_id;
        
        try {
          const response = await fetch(location.origin + "/api/service_requests", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify({ service_id: serviceId, professional_id: professionalId }),
          });
    
          if (response.ok) {
            const data = await response.json();
            this.bookedServices.push(professionalId); 
            this.bookedProfessionalId = professionalId; // Store booked professional ID
            this.showBookedMessage = true; // Display booking confirmation message
            this.removeProfessional(professionalId);
          } else {
            console.error("Failed to book service:", response.status);
          }
        } catch (error) {
          console.error("Error booking service:", error);
        }
      },

      removeProfessional(professionalId) {
        this.professionals = this.professionals.filter(prof => prof.user_id !== professionalId);
      },
      

      isBooked(professionalId) {
        return this.bookedServices.includes(professionalId);
      },


    
      updateStatus(professionalId, status) {
        const professional = this.professionals.find(prof => prof.user_id === professionalId);
        if (professional) {
          professional.service_status = status;
        }
      },


      async closeServiceRequest(professional) {
        const serviceRequestId = professional.service_request_id;  // Assuming you store the service request ID
    
        try {
          const response = await fetch(location.origin + `/api/service_requests/${serviceRequestId}/close`, {
            method: 'PUT',
            headers: {
              'Authentication-Token': this.$store.state.auth_token,
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log("Service request closed:", data);
            this.updateStatus(professional.id, 'closed');
          } else {
            console.error("Failed to close service request:", response.status);
          }
        } catch (error) {
          console.error("Error closing service request:", error);
        }
      },
    
      updateStatus(professionalId, status) {
        const professional = this.professionals.find(prof => prof.user_id === professionalId);
        if (professional) {
          professional.service_status = status;
        }
      },



      async viewProfile() {
        try {
          const response = await fetch(location.origin + "/api/customers", {
            method: 'GET',
            headers: {
              'Authentication-Token':  this.$store.state.auth_token  // Ensure token is passed
            },
          });
      
          if (response.ok) {
            const data = await response.json();
            this.customer = data[0];
            this.showDetailsModal = true; 
            console.log("Customer details:", data);
          } else {
            console.error("Failed to fetch customer details:", response.status);
          }
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      },


      viewProfessional(customer) {
        this.customer = customer;
        this.showDetailsModal = true;
    },

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.customer = null;
    },


    
    async updateProfile() {
      try {
        const response = await fetch(location.origin + "/api/customers", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(this.customer),
        });

        if (response.ok) {
          const updatedCustomer = await response.json();
          this.customer = updatedCustomer;  
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


    logout(){
      this.$store.commit('logout');
      localStorage.clear(); 
      this.$router.replace('/login');

      window.history.pushState(null, '', window.location.href);
      window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href);
  }
  },

  // Show the rating form when "Close Service" is clicked
  openRatingForm(serviceRequestId) {
    this.serviceRequestId =   serviceRequestId ;
    this.showRatingForm = true;
  },
  
  // Hide the rating form
  handleCloseRatingForm() {
    this.showRatingForm = false;
    this.selectedRequestId = null
  }
     



  
  },
  async mounted() {
    await this.fetchServices();
    await this.fetchHistory();

  },
};

