export default {
    template: `
        <div>
            <h1 class="text-center my-4">Customers</h1>
            <div class="container" style="max-width: 800px;">
                <table class="table table-striped table-bordered text-center">
                    <thead class="table-primary">
                        <tr>
                            <th scope="col">User ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="customer in customers" :key="customer.id">
                            <th scope="row">{{ customer.user_id }}</th>
                            <td>{{ customer.username }}</td>
                            <td>{{ customer.email }}</td>
                            <td>{{ customer.phone }}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" @click="viewCustomer(customer)">View</button>
                                <button class="btn btn-danger btn-sm" @click="removeCustomer(customer.id)">Remove</button> 
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
                            <h5 class="modal-title">Customer Details</h5>
                            <button type="button" class="close" @click="closeDetailsModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Username:</strong> {{ selectedCustomer.username }}</p>
                            <p><strong>Email:</strong> {{ selectedCustomer.email }}</p>
                            <p><strong>Phone:</strong> {{ selectedCustomer.phone }}</p>
                            <p><strong>Address:</strong> {{ selectedCustomer.address }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            customers: [],
            showDetailsModal: false,
            selectedCustomer: {}
        };
    },
    methods: {
        async fetchCustomers() {
            try {
                const response = await fetch(location.origin + '/api/customers', {
                    method:'GET',
                    headers: {
                        'Authentication-Token':  this.$store.state.auth_token
                    }
                });
                console.log(`Response status: ${response.status}`);
                console.log('Current auth token:', this.$store.state.auth_token);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched customers:', data);  
                    this.customers = data;
                } else {
                    console.error('Failed to fetch customers.');
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        },

        viewCustomer(customer) {
            this.selectedCustomer = customer;
            this.showDetailsModal = true;
        },

        closeDetailsModal() {
            this.showDetailsModal = false;
            this.selectedCustomer = {};
        },

        async flagCustomer() {
        },
        

        async removeCustomer(customerId) {
            if (confirm("Are you sure you want to remove this customer?")) {
                try {
                    const response = await fetch(location.origin + `/api/customers/${customerId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authentication-Token': JSON.parse(localStorage.getItem('user')).token
                        }
                    });
                    if (response.ok) {
                        this.customers = this.customers.filter(c => c.id !== customerId);
                    } else {
                        console.error("Failed to delete customer. Status:", response.status);
                    }
                } catch (error) {
                    console.error("Error deleting customer:", error);
                }
            }
        }
    },
    async mounted() {
        await this.fetchCustomers();
    }
};
