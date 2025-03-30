import CustomerTable from "./admin_customers.js";
import ProfessionalTable from "./admin_professionals.js";
import ServiceRequest from "./admin_service_request.js";

export default {
    template: `
    <div>
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
            Welcome Admin
           </span>
              <div class="d-flex">
                    <button @click='logout' class='nav-link' style="font-size: 1.2rem; color:red">Logout</button>
                </div>
            </div>
        </nav>

        <button  @click="create_csv" style='background-color:light'> 
        <div class="col-2-md-1 text-end">
          <div class=" border rounded">
            <h5 style='color:red'>Service Request Data</h5>
            <p style=" text-align: center;">Download</p>
          </div>
        </div>
        </button>


          
        <h1 class="text-center my-4">Available Services</h1>
        <div class="container" style="max-width: 800px;">
            <table class="table table-striped table-bordered text-centre">
                <thead class="table-primary">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in services" :key="service.id">
                        <th scope="row">{{ service.id }}</th>
                        <td>{{ service.name}}</td>
                        <td>{{ service.price }}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" @click="showServiceDetails(service)">View</button>
                            <button class="btn btn-warning btn-sm" @click="initUpdateService(service)">Update</button>
                            <button class="btn btn-danger btn-sm" @click="deleteService(service.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            

            <!-- Add Service Button -->
            <div class="text-center my-4">
                <button class="btn btn-success btn-lg" @click="showAddServiceModal = true">+Add Service</button>
            </div>
        </div>


        <div>
        <customer-table> </customer-table>
        </div>

        <div>
        <professional-table> </professional-table>
        </div>

        <div>
        <serviceRequest> </serviceRequest>
        </div>

        <!-- Add Service Modal -->
        <div v-if="showAddServiceModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Service</h5>
                        <button type="button" class="close" @click="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitService">
                            <div class="form-group">
                                <label for="name">Service Name</label>
                                <input type="text" id="name" v-model="newService.name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="price">Price</label>
                                <input type="number" id="price" v-model="newService.price" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="time_required">Time Required (minutes)</label>
                                <input type="number" id="time_required" v-model="newService.time_required" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea id="description" v-model="newService.description" class="form-control"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary mt-3">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


        <div v-if="showDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Service Details</h5>
                        <button type="button" class="close" @click="closeDetailsModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Name:</strong> {{ selectedService.name }}</p>
                        <p><strong>Price:</strong> {{ selectedService.price }}</p>
                        <p><strong>Time Required:</strong> {{ selectedService.time_required }} minutes</p>
                        <p><strong>Description:</strong> {{ selectedService.description }}</p>
                    </div>
                </div>
            </div>
        </div>
     

        <!-- Update Service Modal -->
        <div v-if="showUpdateServiceModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Service</h5>
                        <button type="button" class="close" @click="closeUpdateModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateService">
                            <div class="form-group">
                                <label for="update_name">Service Name</label>
                                <input type="text" id="update_name" v-model="selectedService.name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="update_price">Price</label>
                                <input type="number" id="update_price" v-model="selectedService.price" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="update_time_required">Time Required (minutes)</label>
                                <input type="number" id="update_time_required" v-model="selectedService.time_required" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="update_description">Description</label>
                                <textarea id="update_description" v-model="selectedService.description" class="form-control"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary mt-3">Update</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

        
    `,

    components: {
        CustomerTable,
        ProfessionalTable,
        ServiceRequest
        // other components
    },

    data() {
        return {
            services: [],
            showAddServiceModal: false,
            showDetailsModal:false,
            newService: {
                name: '',
                price: '',
                time_required: '',
                description: ''
            },
            selectedService : {},
            showUpdateServiceModal: false,
        };
    },

    methods: {
        async fetchServices() {
            try {
                const res = await fetch(location.origin + "/api/services", {
                    headers: {
                        'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                    }
                });
                
                if (res.ok) {
                    this.services = await res.json();
                    console.log("Services fetched", this.services);
                } else {
                    console.error("Failed to fetch services. Status:", res.status);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },

        async submitService() {
            try {
                const res = await fetch(location.origin + "/api/services", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                    },
                    body: JSON.stringify(this.newService)
                });

                if (res.ok) {
                    const addedService = await res.json();
                    this.services.push(addedService); // Add the new service to the list
                    this.closeModal();
                } else {
                    console.error("Failed to add service. Status:", res.status);
                }
            } catch (error) {
                console.error("Error adding service:", error);
            }
        },

        closeModal() {
            this.showAddServiceModal = false;
            // Clear the form fields
            this.newService = {
                name: '',
                price: 0,
                time_required: 0,
                description: ''
            }
        },
        
        showServiceDetails(service) {
            this.selectedService = service; 
            this.showDetailsModal = true; 
        },

        closeDetailsModal() {
            this.showDetailsModal = false; 
            this.selectedService = {}; 
        },


        async deleteService(serviceId) {
            if (confirm("Are you sure you want to delete this service?")) {
                try {
                    const res = await fetch(location.origin + `/api/services/${serviceId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                        }
                    });
    
                    if (res.ok) {
                        this.services = this.services.filter(service => service.id !== serviceId); // Remove the deleted service from the list
                    } else {
                        console.error("Failed to delete service. Status:", res.status);
                    }
                } catch (error) {
                    console.error("Error deleting service:", error);
                }
            }
        },



        initUpdateService(service) {
            this.selectedService = { ...service }; // Create a copy of the service to update
            this.showUpdateServiceModal = true; // Show the update modal
        },

        async updateService() {
            console.log(this.selectedService);
            try {
                const res = await fetch(location.origin + `/api/services/${this.selectedService.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                    },
                    body: JSON.stringify(this.selectedService)
                });
                if (res.ok) {
                    const updatedService = await res.json();
                    const index = this.services.findIndex(service => service.id === updatedService.id);
                    if (index !== -1) {
                        this.services.splice(index, 1, updatedService);
                    }
                    this.closeUpdateModal();
                } else {
                    console.error("Failed to update service. Status:", res.status);
                }
            } catch (error) {
                console.error("Error updating service:", error);
            }
        },

        closeUpdateModal() {
            this.showUpdateServiceModal = false; 
            this.selectedService = {}; 
        },

        async create_csv(){
          const res = await fetch(location.origin +'/create-csv', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
            }
          })
          const task_id = (await res.json()).task_id

          const interval = setInterval(async()=> {
            const res = await fetch(location.origin+ `/get-csv/${task_id}`)
            if (res.ok){
                console.log('Data is ready')
                window.open(location.origin+ `/get-csv/${task_id}`)
                clearInterval(interval)
            }
          },100)
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
  },
async mounted() {
    await this.fetchServices();
},
}