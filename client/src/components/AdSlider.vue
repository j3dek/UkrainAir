<template>
  <div class="slider-container">
    <button class="nav-arrow left-arrow" @click="prevSlide">
      &lt;
    </button>
    
    <div class="slide-window">
      <div 
        class="slide-track"
        :style="{ transform: `translateX(${trackOffset}%)` }"
      >
        <div class="slide red-slide"></div>
        <div class="slide green-slide"></div>
        <div class="slide blue-slide"></div>
      </div>
    </div>
    
    <button class="nav-arrow right-arrow" @click="nextSlide">
      &gt;
    </button>
  </div>
</template>

<script>
export default {
  name: 'AdSlider',
  data() {
    return {
      currentSlide: 0,
      totalSlides: 3
    };
  },
  computed: {
    trackOffset() {
      return -((100 / this.totalSlides) * this.currentSlide);
    }
  },
  methods: {
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      } else {
        this.currentSlide = this.totalSlides - 1;
      }
    },
    nextSlide() {
      if (this.currentSlide < this.totalSlides - 1) {
        this.currentSlide++;
      } else {
        this.currentSlide = 0;
      }
    }
  }
};
</script>

<style scoped>
.slider-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 30px 0;
}

.slide-window {
  width: 50%;
  overflow: hidden;
  position: relative;
  height: 300px;
}

.slide-track {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.3s ease-in-out;
}

.slide {
  width: calc(100% / 3);
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.red-slide { background-color: #f44336; }
.green-slide { background-color: #4caf50; }
.blue-slide { background-color: #2196f3; }

.nav-arrow {
  background: #3f51b5;
  color: white;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  font-size: 1.5em;
  font-weight: bold;
  z-index: 10;
  border-radius: 4px;
  margin: 0 10px;
}
.nav-arrow:hover {
    background: #5c6bc0;
}
</style>