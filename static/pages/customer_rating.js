export default {
    template: `
      <div v-if="showRatingForm">
        <div class="container mt-5">
          <div class="card shadow">
            <div class="card-body">
              <h4 class="text-center">Service Remarks</h4>
              <p class="text-center" v-if="serviceRequestId">Service Request ID: {{ serviceRequestId.id }}</p>
              <form @submit.prevent="submitRating">
                <div class="mb-3">
                  <label class="form-label">Service Rating:</label>
                  <div class="rating-container">
                    <span
                      v-for="(star, index) in 5"
                      :key="index"
                      :class="['star', { active: index < rating }]"
                      :style="getStarStyle(index)"

                      @click="setRating(index + 1)"
                    >&#9733;</span>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="remarks" class="form-label">Remarks (if any):</label>
                  <textarea
                    id="remarks"
                    class="form-control"
                    rows="3"
                    v-model="remarks"
                    placeholder="Enter your remarks here"
                  ></textarea>
                </div>
                <div class="text-center">
                  <button type="submit" class="btn btn-primary">Submit</button>
                  <button type="button" class="btn btn-secondary" @click="cancelRating">Close</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `,
  props: ['serviceRequestId'],

  data() {
    return {
      rating: 0,
      remarks: '',
      showRatingForm: true,
      
    };
  },
  methods: {
    setRating(index) {
        this.rating = index; // Update the rating
        console.log("Rating updated to:", this.rating);
    },
    async submitRating() {
        if (!this.serviceRequestId || !this.serviceRequestId.id) {
            alert("Service Request ID is missing.");
            return;
          }
        console.log("this :",  this.serviceRequestId.id)
      try {
        const payload = {
          service_request_id:  this.serviceRequestId.id,
          service_status: 'Closed',
          rating: this.rating,
          remarks: this.remarks,
        };
        console.log("Submitting payload:", this.serviceRequestId);

        const response = await fetch(location.origin + "/api/service_requests", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Service successfully closed:", data);
          this.showRatingForm = false;
          alert("Service successfully closed and rated!");
          this.$emit('close'); 
        } else {
          console.error("Failed to submit rating:", response.status);
          alert("Failed to submit rating. Please try again.");
        }
      } catch (error) {
        console.error("Error while submitting rating:", error);
        alert("An error occurred while submitting the rating.");
      }
    },
    cancelRating() {
      this.showRatingForm = false; // Hide the rating form when the Close button is clicked
    },

    getStarStyle(index) {
        return {
          color: index < this.rating ? 'gold' : 'lightgray',
          fontSize: '3rem',
          cursor: 'pointer',
          transition: 'color 0.3s ease, transform 0.2s ease',
        };
      },
  },

}