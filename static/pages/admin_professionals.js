export default {
    template: `
        <div>
            <h1 class="text-center my-4">Professionals</h1>
            <div class="container" style="max-width: 800px;">
                <table class="table table-striped table-bordered text-center">
                    <thead class="table-primary">
                        <tr>
                            <th scope="col">User ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Service</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="professional in professionals" :key="professional.id">
                            <th scope="row">{{ professional.user_id }}</th>
                            <td>{{ professional.username }}</td>
                            <td>{{ professional.email }}</td>
                            <td>{{ professional.service_name }}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" @click="viewProfessional(professional)">View</button>
                                <button class="btn btn-warning btn-sm" @click="toggleBlock(professional)">
                                    {{ professional.active ? 'Unblock' : 'Block' }}
                                </button>
                                <button class="btn btn-danger btn-sm" @click="removeProfessional(professional.id)">Remove</button> 
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- View Customer Details Modal -->
            <div v-if="showDetailsModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Professional Details</h5>
                            <button type="button" class="close" @click="closeDetailsModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Username:</strong> {{ selectedProfessional.username }}</p>
                            <p><strong>Email:</strong> {{ selectedProfessional.email }}</p>
                            <p><strong>Phone:</strong> {{ selectedProfessional.phone }}</p>
                            <p><strong>Address:</strong> {{ selectedProfessional.address }}</p>
                            <p><strong>Service Name:</strong> {{ selectedProfessional.service_name }}</p>
                            <p><strong>Experience(in years):</strong> {{ selectedProfessional.experience}}</p>
                            <p><strong>Description:</strong> {{ selectedProfessional.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            professionals: [],
            showDetailsModal: false,
            selectedProfessional: {}
        };
    },
    methods: {
        async fetchProfessionals() {
            try {
                const response = await fetch(location.origin + '/api/professionals', {
                    method:'GET',
                    headers: {
                        'Authentication-Token':  this.$store.state.auth_token
                    }
                });
                console.log(`Response status: ${response.status}`);
                console.log('Complete response:', response);
                console.log('Current auth token:', this.$store.state.auth_token);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched professionals:', data);  
                    this.professionals = data;
                } else {
                    console.error('Failed to fetch professionals.');
                }
            } catch (error) {
                console.error('Error fetching professionals:', error);
            }
        },

        viewProfessional(professional) {
            this.selectedProfessional = professional;
            this.showDetailsModal = true;
        },

        closeDetailsModal() {
            this.showDetailsModal = false;
            this.selectedProfessional = {};
        },

        async toggleBlock(professional) {
            const blockStatus = professional.active ? true : false
            const response = await fetch(location.origin + '/api/toggle_user_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token
                },
                body: JSON.stringify({
                    user_id: professional.user_id,
                    block: !blockStatus
                })
            });
        
    
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data.active !== 'undefined'){
                this.$set(professional, 'active', !blockStatus);  // Update the active status locally
                console.log('User status updated:', data);
            } else {
                console.error('Failed to update user status.');
            }}
        },
    

        async removeProfessional(professionalId) {
            if (confirm("Are you sure you want to remove this professional?")) {
                try {
                    const response = await fetch(location.origin + `/api/professionals/${professionalId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                        }
                    });
                    if (response.ok) {
                        this.professionals = this.professionals.filter(p => p.id !== professionalId);
                    } else {
                        console.error("Failed to delete professional. Status:", response.status);
                    }
                } catch (error) {
                    console.error("Error deleting professional:", error);
                }
            }
        }
    },
    

    async mounted() {
        await this.fetchProfessionals();
    }
}
