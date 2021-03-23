<template>
  <div class="chart-holder">
    <h1>Using Vue 3 (Composition API) with D3</h1>
    <responsive-line-chart :data="data" />
    <div class="buttons">
      <button @click="addData">Add data</button>
      <button @click="filterData">Filter data</button>
    </div>
  </div>
</template>

<script>
// thanks muratkemaldar: https://github.com/muratkemaldar/using-vue3-with-d3
import ResponsiveLineChart from "../components/LineChart.vue";
export default {
  name: "Dashboard",
  components: {
    ResponsiveLineChart,
  },
  data() {
    return {
      data: [10, 40, 15, 25, 50],
    };
  },
  methods: {
    addData() {
      // add random value from 0 to 50 to array
      this.data = [...this.data, Math.round(Math.random() * 50)];
    },
    filterData() {
      this.data = this.data.filter((v) => v <= 35);
    },
  },
};
</script>

<style>
.chart-holder {
  text-align: center;
  color: #2c3e50;
  max-width: 720px;
  margin: 100px auto;
  padding: 0 20px;
}
svg {
  /* important for responsiveness */
  display: block;
  fill: none;
  stroke: none;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: #eee;
}
.buttons {
  margin-top: 2rem;
}
</style>
