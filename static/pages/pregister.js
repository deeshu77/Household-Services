export default{
    template :`
<div>

<div v-if="isregistered" class="alert alert-success text-center">
      <strong>Registered successfully !</strong>
    </div>

<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-lg-6">
      <div class="card shadow">
        <div class="card-body p-5">
          <h3 class="text-center mb-4">Service Professional Signup</h3>
          <form>
            <div class="row mb-3">
              <div class="col">
                <label for="firstName" class="form-label">Name</label>
                <input type="text" id="firstName" v-model='username' class="form-control" placeholder="Enter your first name" required>
              </div>
            </div>


            <div class="row mb-3">
              <div class="col">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" v-model='email' class="form-control" placeholder="Enter your email" required>
              </div>
              <div class="col">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" v-model='password' class="form-control" placeholder="Enter password" required>
              </div>
            </div>

            <div class="mb-3">
              <label for="address" class="form-label">Address</label>
              <input type="text" id="address" v-model='address' class="form-control" placeholder="Enter your address" required>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label for="pinCode" class="form-label">Pin Code</label>
                <input type="text" id="pinCode" v-model='pin' class="form-control" placeholder="Enter pin code" required>
              </div>
              <div class="col">
                <label for="contactNumber" class="form-label">Contact Number</label>
                <div class="input-group">
                  <span class="input-group-text">+91</span>
                  <input type="tel" id="contactNumber" v-model='phone' class="form-control" placeholder="Enter your contact number" required>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label for="services"  class="form-label">Available Services</label>
                <select id="services" v-model='service_id' class="form-select" required>
                  <option selected>Select a service...</option>
                  <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }}
                  </option>
                </select>
              </div>
              <div class="col">
                <label for="experience" class="form-label">Experience (in years)</label>
                <input type="number" id="experience" v-model='experience' class="form-control" placeholder="Experience" required>
              </div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea id="description" v-model='description' class="form-control" rows="3" placeholder="Briefly describe your service" required></textarea>
            </div>

            <div class="text-center">
              <button @click.prevent="submitPRegister"  type="submit" class="btn btn-primary btn-lg">Submit</button>
            </div>

            <router-link to="/login" style="font-size: 1.2rem;">Login</router-link>

          </form>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
`,

data(){
    return{
      username : null,
      email : null,
      password : null,
      address : null,
      pin : null,
      phone : null,
      experience : null,
      description: null,
      service_id : null,
      services:[],
      role : 3,
      isregistered:false
   }
 },

  created(){
    this.fetchServices()
  },

 methods: {

  async fetchServices() {
    const res = await fetch(location.origin + '/services');
    if (res.ok) {
        this.services = await res.json();
    } else {
        console.error('Failed to fetch services');
    }
}, 

    
    async submitPRegister() { 

        const res = await fetch(location.origin + '/pregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'username':this.username, 'address':this.address, 'pin':this.pin, 'phone':this.phone, 'experience' : this.experience, 'service_id':this.service_id,'description':this.description, 'email': this.email, 'password': this.password, 'role' : this.role})
        });

        if (res.ok) {
            console.log('Registered');
            this.isregistered=true
        }
    }
 }
}
