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
                    <router-link to="" class="nav-link" style="font-size: 1.2rem;">Home</router-link>
                    <router-link to="" class="nav-link" style="font-size: 1.2rem;">Search</router-link>
                    <button @click='logout' class='nav-link' style="font-size: 1.2rem; color:red">Logout</button>
                </div>
            </div>
        </nav>
`,
}