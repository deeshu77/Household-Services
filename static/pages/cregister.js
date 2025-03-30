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
          <h3 class="text-center mb-4">Customer Signup</h3>
          <form>
            <div class="row mb-3">
              <div class="col">
                <label for="firstName" class="form-label">Name</label>
                <input type="text" id="firstName" v-model='username' class="form-control" placeholder="Enter your first name" required>
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
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" v-model='email' class="form-control" placeholder="Enter your email" required>
            </div>

            <div class="col">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" v-model='password' class="form-control" placeholder="Enter password" required>
            </div>
          </div>

                      
            <div class="text-center">
              <button @click="submitCRegister" type="submit" class="btn btn-primary btn-lg">Submit</button>
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
      username: null,
      address: null,
      pin: null,
      phone: null,
      email : null,
      password : null,
      role: 2,
      isregistered: false,
   }
 },

 methods: {
    async submitCRegister() {
        const res = await fetch(location.origin + '/cregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'username':this.username,'address':this.address, 'pin':this.pin, 'phone':this.phone, 'email': this.email ,'password': this.password, 'role':this.role})
        });

        if (res.ok) {
            console.log('Registered');
            this.isregistered=true
        }
    }
 }
}