export default{
template:`
  <div>
    <input v-model="searchQuery" @input="handleSearch" placeholder="Search for services" />
    
    <div v-if="loading">Loading...</div>
    
    <div v-if="serviceResults">
      <ul>
        <li v-for="service in serviceResults" :key="service.id">
          {{ service.name }} 
        </li>
      </ul>
    </div>
    
    <div v-if="error" class="text-danger">{{ error }}</div>
  </div>
`,

  data() {
    return {
      searchQuery: '',
      serviceResults: [],
      loading: false,
      error: null
    };
  },
  methods: {
    async handleSearch() {
      if (this.searchQuery.length > 2) {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(location.origin + '/api/search/services', {
            method: 'GET',
            headers: {
              'Authentication-Token': this.$store.state.auth_token
            },
          });

          if (response.ok){
          const data =  await response.json();
          this.serviceResults = data;
          console.log('Results', this.serviceResults);
          }
        }
         catch (error) {
          this.error = 'Error fetching services';
        } finally {
          this.loading = false;
        }
    }
        else{
        this.serviceResults = [];
        } 
    }
  }
};

