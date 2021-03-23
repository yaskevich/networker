<template>
  <div class="chart-holder">
    <Graph :data="data" />
  </div>
</template>

<script>
import Graph from "../components/Graph.vue";
export default {
  name: "Dashboard",
  components: {
    Graph,
  },
  data() {
    return {
      data: [10, 40, 15, 25, 50],
    };
  },
  methods: {

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

</style>
