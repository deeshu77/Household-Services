export default {
    template: `
      <div>
       <nav class="navbar navbar-light bg-light py-4" style="margin: 0; padding: 0;">
        <div class="container-fluid">
         <span class="navbar-text" style="font-size: 2.00rem; color:#007bff;">
           Household Services
         </span>

    <!-- Right-aligned links for registration options -->
    <div class="d-flex">
    <router-link to="/cregister" class="nav-link" style="font-size: 1.2rem;">Customer Signup</router-link>
    <router-link to="/pregister" class="nav-link" style="font-size: 1.2rem;">Professional Signup</router-link>
    </div>
  </div>
</nav>
 <section class="vh-100 d-flex align-items-center">
  <div class="container-fluid">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-md-6 col-lg-5 col-xl-4">
        <img src="https://img.freepik.com/free-vector/flat-design-handyman-logo_23-2149239540.jpg?t=st=1732632561~exp=1732636161~hmac=828abadb54f883885e4950296d1b263477ac42d05315382b9bb43f02e693a7c0&w=740"
          class='img-fluid' alt="Sample image">
      </div>
      <div class="col-md-6 col-lg-5 col-xl-4">
        <form>
          <!-- Email input -->
          <div class="form-outline mb-4">
            <input type="email" id="form3Example3" v-model='email' class="form-control form-control-lg"
              placeholder="Enter a valid email address" />
          </div>

          <!-- Password input -->
          <div class="form-outline mb-3">
            <input type="password" id="form3Example4" v-model='password' class="form-control form-control-lg"
              placeholder="Enter password" />
          </div>


          <div class="mb-3">
                <div>
                    <input type="radio" id="admin" value="admin" v-model="role">
                    <label for="admin">Admin</label>
                    
                    <input type="radio" id="customer" value="customer" v-model="role">
                    <label for="customer">Customer</label>
                    
                    <input type="radio" id="professional" value="professional" v-model="role">
                    <label for="professional">Professional</label>
                </div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger text-center">
                  {{ errorMessage }}
                </div>


          <!-- Login button -->
          <div class="text-center mt-4 pt-2">
            <button @click='submitLogin' type="button" class="btn btn-primary btn-lg"
              style="padding-left: 2.5rem; padding-right: 2.5rem;">Login</button>
          </div>
        </form>
      </div>
    </div>
    </div>
</section>
</div>

    `,
    data() {
        return {
            email: null,
            password: null,
            role:null,
            errorMessage:null
        };
    },
    methods: {
        async submitLogin() {
          try{
            const res = await fetch(location.origin + "/login" , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                   email: this.email,
                   password: this.password,
                   role: this.role})
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Logged in:', data);

                localStorage.setItem('user', JSON.stringify(data) )
                this.$store.commit('setUser');
                

                if (this.role === 'admin') {
                  this.$router.push('/admin_services');
              } else if (this.role === 'customer') {
                  this.$router.push('/customer_dashboard');
              } else if (this.role === 'professional') {
                  this.$router.push('/professional_dashboard');
                } 
              } else {
                  this.errorMessage = "Invalid credentials. Please check your email, password, or role.";
                }
              }
              

        catch(error){
          console.error('Fetch error:', error);
        }
    }
  },

};
